<?php
namespace App\Http\Controllers;

use App\Models\Report;
use App\Services\HateSpeechDetectorService;
use App\Services\WebScraperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalyzeController extends Controller
{
    private WebScraperService $webScraperService;
    private HateSpeechDetectorService $hateSpeechDetectorService;

    public function __construct(WebScraperService $webScraperService, HateSpeechDetectorService $hateSpeechDetectorService){
        $this->webScraperService = $webScraperService;
        $this->hateSpeechDetectorService = $hateSpeechDetectorService;
    }

    public function analyze(Request $request): JsonResponse
    {
        // 1. Get Url from browser extension
        $url = $request->input('url');
        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            return response()->json(['error' => 'Invalid URL'], 400);
        }

        // 2. Scrape the website
        $scraper_response = $this->webScraperService->puppeteer_scraping($url);

        if ($scraper_response == "Error => No output from scraper") {
            Log::error($scraper_response);
            return response()->json(['error' => 'Failed to scrape the website.'], 500);
        }

        // 3. Detect hate speech
        try {
            $result = $this->hateSpeechDetectorService->detect($scraper_response);

            if (isset($result['error'])) {
                return response()->json($result, 500);
            }

            $detectedText = strtolower($scraper_response);
            $detectedWords = preg_split('/[^a-z0-9]+/', $detectedText);

            $flaggedReports = Report::all();
            foreach ($flaggedReports as $report) {
                if (in_array(strtolower($report->flagged_text), $detectedWords)) {
                    $result['label'] = $report->flagged_text;
                    $result['score'] = 1.0;
                    break;
                }
            }

            return response()->json([
                'label' => $result['label'],
                'score' => $result['score'],
                'is_toxic' => $result['score'] > 0.5
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
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
