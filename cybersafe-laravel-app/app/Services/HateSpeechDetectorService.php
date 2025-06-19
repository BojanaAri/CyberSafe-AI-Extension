<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HateSpeechDetectorService
{
    protected string $apiUrl = 'https://router.huggingface.co/hf-inference/models/unitary/toxic-bert';
    private string $apiKey;
    private const BATCH_LENGTH = 512;

    public function __construct()
    {
        $this->apiKey = config('services.huggingface.token');
    }

    /**
     * @throws \Exception
     */
    public function detect(string $text)
    {
        try {
            $text = mb_substr($text, 0, 4000);
            $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
            $text = preg_replace('/[\x00-\x1F\x80-\x9F]/u', '', $text);

            $scraper_response_array = str_split($text, self::BATCH_LENGTH);
            $lastItem = end($scraper_response_array);

            foreach ($scraper_response_array as $response_item) {
                $response = $this->sendRequest($response_item);

                // Logic for comparing
                if ($response->successful()) {
                    $results = $response->json();
                    $analysis = collect($results[0])->sortByDesc('score')->first();

                    if ($analysis['score'] > 0.5 or $response_item == $lastItem) {
                        return $analysis;
                    }
                    continue;
                }

                Log::error('Hugging Face API Error', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'text' => $response_item
                ]);

                return [
                    'error' => 'API request failed',
                    'status' => $response->status(),
                    'response' => $response->body()
                ];
            }

        } catch (ConnectionException $e) {
            Log::error('Hugging Face Connection Error: '.$e->getMessage());
            return ['error' => 'Connection failed', 'message' => $e->getMessage()];
        } catch (\Exception $e) {
            Log::error('Hugging Face Error: '.$e->getMessage());
            return ['error' => 'Processing failed', 'message' => $e->getMessage()];
        }
        return ['error' => 'Unexpected end of processing'];
    }

    /**
     * @throws ConnectionException
     */
    private function sendRequest(string $response_item): Response
    {
        return Http::withOptions([
            'verify' => false // Disables SSL verification
        ])->withHeaders([
            'Authorization' => 'Bearer '.$this->apiKey,
            'Content-Type' => 'application/json',
        ])
            ->timeout(15)
            ->retry(2, 1000)
            ->post($this->apiUrl, [
                'inputs' => $response_item
            ]);
    }
}
