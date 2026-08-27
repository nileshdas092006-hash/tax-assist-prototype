const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 800 });
  
  await page.goto('http://localhost:5173');
  
  // 1. Screenshot the expanded notice
  await page.waitForSelector('button');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('View Official Notice Text')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  
  if (!fs.existsSync('./evidence/screenshots')) {
    fs.mkdirSync('./evidence/screenshots', { recursive: true });
  }
  await page.screenshot({ path: '../evidence/screenshots/expanded_notice.png', fullPage: true });

  // 2. Test state persistence
  const fixBtn = await page.$$('button');
  for (const btn of fixBtn) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Fix This')) {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  const yesBtn = await page.$$('button');
  for (const btn of yesBtn) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.trim() === 'Yes') {
      await btn.click();
      break;
    }
  }
  await page.waitForSelector('input[type="text"]');
  await page.type('input[type="text"]', '45000');
  
  const verBtn = await page.$$('button');
  for (const btn of verBtn) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Verification')) {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  const backBtn = await page.$$('button');
  for (const btn of backBtn) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('Back')) {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  const val = await page.$eval('input[type="text"]', el => el.value);
  console.log('PERSISTED_VALUE:' + val);
  
  await browser.close();
})();
