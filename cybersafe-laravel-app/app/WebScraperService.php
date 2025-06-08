<?php

namespace App;

use Symfony\Component\BrowserKit\HttpBrowser;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\HttpClient\HttpClient;

class WebScraperService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function scraping(string $url): string{
        // HttpBrowser just provides features similar to those of a browser, such as cookie and session handling
        $browser = new HttpBrowser(HttpClient::create());

        // Automatically parses the HTML document
        $crawler = $browser->request('GET', $url);
        $html = $crawler->filter('body')->each(function (Crawler $node) {
            return $this->extract_visible_text($node);
        });
        return trim(implode("\n", array_filter($html)));
    }

    private function extract_visible_text(Crawler $node): string
    {
        $node->filter('script, style, nav, header, footer, noscript, aside, meta, head')->each(function (Crawler $node) {
            foreach($node as $n){
                $n->parentNode->removeChild($n);
            }
        });
        return $node->text(null, false);
    }
}
