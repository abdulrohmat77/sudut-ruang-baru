import { test } from '@playwright/test';

test('screenshot dashboard', async ({ page }) => {
  const logs: string[] = [];
  page.on('pageerror', error => {
    logs.push('ERROR: ' + error.message.substring(0, 200));
  });
  
  await page.goto('http://localhost:3000/commandcenter/');
  await page.waitForTimeout(6000);
  
  console.log('Page errors:', logs.join('\n'));
  await page.screenshot({ path: 'screenshot_dashboard.png', fullPage: false });
});
