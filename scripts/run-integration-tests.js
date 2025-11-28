import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Forward console logs to terminal
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Handle page errors
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  try {
    // Navigate to the test page served by Vite
    // Ensure the server is running on port 5173 (default for Vite)
    await page.goto('http://localhost:5173/test/integration.html');

    // Wait for mocha to finish
    // We check for the #mocha-stats element and ensure it has populated data
    await page.waitForFunction(() => {
        return window.__MOCHA_DONE__ === true
    }, { timeout: 10000 });

    // Extract results
    const results = await page.evaluate(() => {
        const failuresEl = document.querySelector('#mocha-stats .failures em');
        const passesEl = document.querySelector('#mocha-stats .passes em');
        const durationEl = document.querySelector('#mocha-stats .duration em');
        const fails = [...document.querySelectorAll('.test.fail')]
                        .map((fail) => ({
                            name: fail.querySelector('h2').textContent,
                            stack: fail.querySelector('pre').textContent
                        }));

        return {
            failures: failuresEl ? parseInt(failuresEl.textContent) : 0,
            passes: passesEl ? parseInt(passesEl.textContent) : 0,
            duration: durationEl ? durationEl.textContent : '0ms',
            fails: fails
        };
    });

    if(results.failures){
        console.log("\n\n===\n\n")
        for (const fail of results.fails) {
            console.log(`Fail: ${fail.name}\n${fail.stack}`);
        }
    }
    console.log("\n\n===\n\n")
    console.log(`Tests finished in ${results.duration}`);
    console.log(`Passes: ${results.passes}`);
    console.log(`Failures: ${results.failures}`);

    if (results.failures > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (e) {
    console.error('Error running tests:', e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
