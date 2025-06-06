<?php

namespace App\Http\Controllers;

use App\WebScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalyzeController extends Controller
{
    public function analyze(Request $request): JsonResponse
    {
        $url = $request->input('url');
        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            return response()->json(['error' => 'Invalid URL'], 400);
        }

        $scraper_controller = new WebScraperService();
        $scraper_response = $scraper_controller->scraping($url);

        if (!$scraper_response) {
            Log::error($scraper_response);
        }
        return response()->json($scraper_response);
    }
}
