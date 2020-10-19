'use strict';
const puppeteer = require('puppeteer');

const start_time = Date.now();
const total_allowed_time = (((5 * 60) + 30) * 60) * 1000;

crawlPage("https://techmeme.com", "techmeme");
crawlPage("https://techmeme.com/river", "river");
crawlPage("https://techmeme.com/lb", "leaderboards");

const master_list = [];

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

function crawlPage(url, prefix) {
    (async () => {

        const args = [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--blink-settings=imagesEnabled=true",
        ];
        const options = {
            args,
            headless: true,
            ignoreHTTPSErrors: true
        };

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080
        });

        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 0
        });

        await page.screenshot({
            path: `screenshots/${prefix}.png`,
            fullPage: true
        });
        await page.screenshot({
            path: `screenshots/${prefix}-fold.png`,
            fullPage: false
        });

        const addresses = await page.$$eval('a', as => as.map(a => a.href));
        const padding = addresses.length % 10;
        for (let i = 0; i < addresses.length; i++) {
            try {
                if ((Date.now() - start_time < total_allowed_time)
                    && addresses[i].startsWith("http") === true
                    && master_list.find(addresses[i] === undefined)) {
                    console.log(`Now serving ${i} of ${addresses.length}: ${addresses[i]}`);
                    master_list.push(addresses[i]);
                    await page.goto(addresses[i], { waitUntil: "networkidle0", timeout: 0 });

                    const watchDog = page.waitForFunction(() => 'window.status === "ready"', { timeout: 0 });
                    await watchDog;

                    await page.screenshot({
                        path: `screenshots/${prefix}-${i.toString().padStart(padding, '0')}.png`,
                        fullPage: true
                    });

                    await page.screenshot({
                        path: `screenshots/${prefix}-${i.toString().padStart(padding, '0')}-fold.png`,
                        fullPage: false
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                console.log(`Finished with ${i} of ${addresses.length}: ${addresses[i]}`);
            };
        }

        await page.close();
        await browser.close();

    })().catch((error) => {
        console.error(error);
    });

}
