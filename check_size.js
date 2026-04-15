import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Click Customize
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const customizeBtn = buttons.find(b => b.textContent && b.textContent.includes('Customize'));
    if (customizeBtn) customizeBtn.click();
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Click CR7
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cr7Btn = buttons.find(b => b.textContent && b.textContent.toLowerCase().includes('cristiano'));
    if (cr7Btn) cr7Btn.click();
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Click Confirm Selection
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const confirmBtn = buttons.find(b => b.textContent && b.textContent.includes('Confirm'));
    if (confirmBtn) confirmBtn.click();
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Click Modes
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const modesBtn = buttons.find(b => b.textContent && b.textContent.includes('Modes'));
    if (modesBtn) modesBtn.click();
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Click Training
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const trainingBtn = buttons.find(b => b.textContent && b.textContent.includes('Training'));
    if (trainingBtn) trainingBtn.click();
  });

  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Take screenshot
  await page.screenshot({ path: 'check_cr7_gameplay_size.png' });
  console.log('Screenshot saved to check_cr7_gameplay_size.png');
  
  await browser.close();
})();
