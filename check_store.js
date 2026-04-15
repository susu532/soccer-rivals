import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await page.evaluate(() => {
    const store = window.localStorage.getItem('soccer-rivals-storage');
    console.log('STORE:', store);
  });
  
  await browser.close();
})();
