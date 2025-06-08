<?php

namespace App\Http\Controllers;

use App\HateSpeechDetectorService;
use App\WebScraperService;
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
        $scraper_controller = new WebScraperService();
        $scraper_response = $scraper_controller->scraping($url);

        if (!$scraper_response) {
            Log::error($scraper_response);
        }

        // 3. Detect hate speech
        try {
            $detector = new HateSpeechDetectorService();
            $result = $detector->detect($scraper_response);

            return response()->json([
                'label' => $result['label'],
                'confidence' => $result['score'],
                'is_toxic' => $result['score'] > 0.5 // Example threshold
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}
