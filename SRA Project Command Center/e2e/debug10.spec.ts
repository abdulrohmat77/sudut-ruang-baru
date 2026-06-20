import { test } from '@playwright/test';

test('debug dom', async ({ page }) => {
  await page.goto('http://localhost:3000/commandcenter/');
  await page.waitForTimeout(2000);
  const html = await page.evaluate(() => document.documentElement.outerHTML);
  console.log('DOM HTML:', html);
});
