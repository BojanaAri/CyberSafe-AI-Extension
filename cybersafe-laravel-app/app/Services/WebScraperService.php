<?php

namespace app\Services;

use Symfony\Component\BrowserKit\HttpBrowser;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\HttpClient\HttpClient;

class WebScraperService
{
    private array $excludedTags = [
        'script', 'style', 'nav', 'header',
        'footer', 'noscript', 'aside', 'meta', 'head'
    ];

    public function scraping(string $url): string{
        try{
            // HttpBrowser just provides features similar to those of a browser, such as cookie and session handling
            $browser = new HttpBrowser(HttpClient::create());

            // Automatically parses the HTML document
            $crawler = $browser->request('GET', $url);
            $html = $crawler->filter('body')
                ->each(function (Crawler $node) {
                    $text = $this->extract_visible_text($node);
                    return $this->clean_extracted_text($text);
                });

            return trim(implode("\n", array_filter($html)));
        }
        catch (\Exception $e){
            throw new \RuntimeException("Failed to scrape URL: {$url}. Error: {$e->getMessage()}");
        }
    }

    private function extract_visible_text(Crawler $node): string
    {
        $node->filter(implode(', ', $this->excludedTags))
            ->each(function (Crawler $node) {
            foreach($node as $n){
                $n->parentNode->removeChild($n);
            }
        });

        return $node->text(null, false);
    }

    private function clean_extracted_text(string $text): string
    {
        $text = str_replace("\t", ' ', $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        $text = preg_replace('/[ ]{2,}/', ' ', $text);
        $text = preg_replace('/\n+/', ' ', $text);

        $text = str_replace(["\n", "\r"], '', $text);
        $text = preg_replace('!\s+!', ' ', $text);
        return trim($text);
    }

    public function puppeteer_scraping(string $url): array
    {
        $scriptPath = base_path('public/web_scraper/scrape.js');
        $command = 'node "' . $scriptPath . '" ' . escapeshellarg($url);
        $output = shell_exec($command);

        if ($output) {
            return json_decode($output, true);
        }

        return ['success' => false, 'error' => 'No output from scraper'];
    }
}
