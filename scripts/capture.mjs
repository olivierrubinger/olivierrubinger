// Re-captures the landing pages shown inside the project cards.
// Needs a local Chrome; override its path with CHROME_PATH.
import puppeteer from 'puppeteer-core';

const PAGES = [
  ['wegrow', 'https://lp.bywegrow.com/', 2400],
  ['tarsi', 'https://www.tarsi-ai.com/en', 2300],
];
const WIDTH = 1280;
const OUT_WIDTH = 728; // 2x the browser window drawn in the card

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
});
for (const [name, url, height] of PAGES) {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: 800, deviceScaleFactor: OUT_WIDTH / WIDTH });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  // scroll through once so scroll-triggered reveals have fired
  for (let y = 0; y < height + 800; y += 300) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await new Promise((r) => setTimeout(r, 250));
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 2500));
  const path = new URL(`./screens/${name}-lp.jpg`, import.meta.url);
  await page.screenshot({
    path: decodeURIComponent(path.pathname).replace(/^\/([A-Za-z]:)/, '$1'),
    type: 'jpeg',
    quality: 74,
    clip: { x: 0, y: 0, width: WIDTH, height },
    captureBeyondViewport: true,
  });
  console.log('captured', name);
  await page.close();
}
await browser.close();
