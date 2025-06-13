<?php

namespace App\Http\Controllers;

use app\Services\HateSpeechDetectorService;
use app\Services\WebScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalyzeController extends Controller
{
    public function analyze(Request $request): JsonResponse
    {
        // 1. Get Url from browser extension
        $url = $request->input('url');
        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            return response()->json(['error' => 'Invalid URL'], 400);
        }

        // 2. Scrape the website
        $webScraperService = new WebScraperService();
        $scraper_response = $webScraperService->puppeteer_scraping($url);

        if (isset($scraper_response['error'])) {
            Log::error($scraper_response['error']);
        }

        // 3. Detect hate speech
        try {
            $detector = new HateSpeechDetectorService();
            $result = $detector->detect($scraper_response['text']);

            return response()->json([
                'label' => $result['label'],
                'confidence' => $result['score'],
                'is_toxic' => $result['score'] > 0.5
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Helper function for debugging web scraping from websites
     * return - whether the web scraping service returns the right data
     **/
    public function scrape(Request $request, WebScraperService $scraper): JsonResponse
    {
        $url = $request->input('url');
        $result = $scraper->puppeteer_scraping($url);

        return response()->json($result);
    }
}
