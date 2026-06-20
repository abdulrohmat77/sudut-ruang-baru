import { test, expect } from '@playwright/test';

test('screenshot commandcenter', async ({ page }) => {
  await page.goto('http://localhost:3000/commandcenter/');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'screenshot_final.png', fullPage: false });
});
