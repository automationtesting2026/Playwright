const { chromium } = require('playwright');

(async () => {
  const baseUrl = process.env.TEST_BASE_URL || 'https://mmfdorcuat.mahindra.com/index.html';
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(baseUrl);

  console.log('Browser opened. Please log in manually in the opened browser window.');
  console.log('When done, focus this terminal and press ENTER to save authentication.');

  await new Promise((resolve) => {
    const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    rl.question('', () => {
      rl.close();
      resolve();
    });
  });

  const statePath = 'auth.json';
  await context.storageState({ path: statePath });
  console.log(`Saved storageState to ${statePath}`);
  await browser.close();
})();
