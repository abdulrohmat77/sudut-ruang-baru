import { test } from '@playwright/test';

test('debug blank page', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message, error.stack));
  
  await page.goto('http://localhost:3000/commandcenter/');
  await page.waitForTimeout(5000);
  console.log('Test finished');
});
