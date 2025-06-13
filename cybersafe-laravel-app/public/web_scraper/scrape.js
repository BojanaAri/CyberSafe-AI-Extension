const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const url = process.argv[2]; // URL passed from Laravel

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

        const text = await page.evaluate(() => {
            function isVisible(node) {
                const style = window.getComputedStyle(node);
                return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            }

            function extractText() {
                let collectedText = [];

                // Extract headings
                document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(node => {
                    if (isVisible(node)) {
                        collectedText.push(`### ${node.innerText.trim()} ###`);
                    }
                });

                // Extract paragraphs
                document.querySelectorAll('p').forEach(node => {
                    if (isVisible(node) && node.innerText.trim()) {
                        collectedText.push(node.innerText.trim());
                    }
                });

                // Extract list items
                document.querySelectorAll('li').forEach(node => {
                    if (isVisible(node) && node.innerText.trim()) {
                        collectedText.push(`- ${node.innerText.trim()}`);
                    }
                });

                // Extract comments if available on the page
                document.querySelectorAll('[class*="comment"], [id*="comment"]').forEach(node => {
                    if (isVisible(node) && node.innerText.trim()) {
                        collectedText.push(`Comment: ${node.innerText.trim()}`);
                    }
                });

                return collectedText.join('\n\n'); // Preserve readable separation
            }

            return extractText();
        });

        console.log(JSON.stringify({ success: true, text }));
    } catch (err) {
        console.log(JSON.stringify({ success: false, error: err.message }));
    } finally {
        await browser.close();
    }
})();
