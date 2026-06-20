import { test } from '@playwright/test';

test('debug error message', async ({ page }) => {
  await page.goto('http://localhost:3000/commandcenter/');
  await page.waitForTimeout(2000);
  
  const errorText = await page.evaluate(() => {
    const el = document.querySelector('.bg-red-950\\/20');
    return el ? el.textContent : 'No error box found';
  });
  
  console.log('DOM ERROR TEXT:', errorText);
});
