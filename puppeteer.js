'use strict';
const puppeteer = require('puppeteer');

const start_time = Date.now();
// const total_allowed_time = (((5 * 60) + 30) * 60) * 1000;
const total_allowed_time = 3000;

crawlPage("https://techmeme.com", "techmeme");
crawlPage("https://techmeme.com/river", "river");
crawlPage("https://techmeme.com/lb", "leaderboards");

function delay(time) {
    console.warn(`waiting for ${time / 1000} seconds...`);
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

        const addresses = await page.$$eval('a', as => as.map(a => a.href));
        const padding = addresses.length % 10;
        for (let i = 0; i < addresses.length; i++) {
            try {
                if ((Date.now() - start_time < total_allowed_time)
                    && addresses[i].startsWith("http") === true) {
                    console.log(`Now serving ${i} of ${addresses.length}: ${addresses[i]}`);
                }
                else {
                    console.log(`Skip serving ${i} of ${addresses.length}: ${addresses[i]}`);
                }
            } catch (error) {
                console.error(error);
            } finally {
                console.log(`Finished with ${i} of ${addresses.length}: ${addresses[i]}`);
                console.log(`Time now: ${Date.now()}. Start time: ${start_time}`);
                console.warn(`Time elapsed: ${ (Date.now() - start_time) / (1000 * 60) } minutes`); 
                console.warn(`Time elapsed: ${ (Date.now() - start_time) / (1000 * 60 * 60) } hours`); 
            };
        }

        await page.close();
        await browser.close();

    })().catch((error) => {
        console.error(error);
    });

}
