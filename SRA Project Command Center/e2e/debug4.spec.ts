import { test } from '@playwright/test';

test('debug blank page state', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message, error.stack));
  
  await page.goto('http://localhost:3000/commandcenter/'); // WITH TRAILING SLASH
  await page.waitForTimeout(2000);
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body Text:', text);
});
