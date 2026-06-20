import { test } from '@playwright/test';

test('debug errors', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(msg.type() + ': ' + msg.text());
  });
  page.on('pageerror', error => {
    logs.push('PAGE ERROR: ' + error.message + '\n' + error.stack);
  });
  
  await page.goto('http://localhost:3000/commandcenter/');
  await page.waitForTimeout(3000);
  
  console.log(logs.join('\n'));
});
