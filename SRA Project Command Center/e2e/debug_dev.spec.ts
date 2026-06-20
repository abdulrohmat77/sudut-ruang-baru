import { test } from '@playwright/test';

test('debug dev server', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message, error.stack));
  
  await page.goto('http://localhost:8080/commandcenter/');
  await page.waitForTimeout(2000);
  
  const locationPath = await page.evaluate(() => window.location.pathname);
  console.log('Location:', locationPath);
  
});
