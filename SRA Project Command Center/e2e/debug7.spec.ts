import { test } from '@playwright/test';

test('debug matches', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/commandcenter/');
  await page.waitForTimeout(1000);
  
  const state = await page.evaluate(() => {
    if (!window.__router) return 'No Router';
    const r = window.__router;
    return {
      status: r.state.status,
      matches: r.state.matches.map(m => ({ id: m.id, status: m.status, error: m.error ? m.error.message : null })),
    };
  }).catch(e => e.message);
  
  console.log('Router State:', JSON.stringify(state, null, 2));
});
