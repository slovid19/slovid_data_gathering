const puppeteer = require('puppeteer');
const SOURCE_URL = "https://www.emergencyslo.org/en/positive-case-details.aspx";

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', consoleMessageObject => function (consoleMessageObject) {
        if (consoleMessageObject._type !== 'warning') {
            console.log(consoleMessageObject._text)
        }
    });
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './browser_downloads'})
    let getIframeSource = async() => {
        await page.goto(SOURCE_URL,
            {
                waitUntil: 'networkidle2'
            });
        return await page.evaluate(async() => {
            return document.getElementsByTagName("iframe")[0].src;
        });
    }
    let dataURL = await getIframeSource();
    console.log("Data found at: " + dataURL);

    await page.goto(
        dataURL,
        {
            waitUntil: 'networkidle2'
        }
    );
    await page.evaluate( () => {
        let tag = "span";
        let str = "Cases by Location (over time)";
        let el = Array.prototype.slice.call(document.getElementsByTagName(tag))
            .filter(
                el => el.textContent.trim() === str.trim()
            )[0];
        el.scrollIntoView();
        let dataLinks = 
            document.getElementsByClassName("igc-data-download-text");
    });
    await page.waitFor(1000);
    await page.click(".igc-data-download-text");
    await page.waitFor(8000);
    await browser.close();
})();
