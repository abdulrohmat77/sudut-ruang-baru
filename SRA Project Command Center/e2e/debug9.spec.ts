import { test } from '@playwright/test';

test('debug network', async ({ page }) => {
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('FAILED REQUEST:', response.status(), response.url());
    }
  });
  
  await page.goto('http://localhost:3000/commandcenter/');
  await page.waitForTimeout(2000);
});
