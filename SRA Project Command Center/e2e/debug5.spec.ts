import { test } from '@playwright/test';

test('debug matches', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/commandcenter/');
  
  const state = await page.evaluate(() => {
    if (!window.$_TSR || !window.$_TSR.router) return 'No Router';
    const r = window.$_TSR.router;
    return {
      location: r.state.location.pathname,
      matches: r.state.matches.map(m => m.id),
      lastMatchId: r.clientSsr?.lastMatchId,
      isSpaMode: r.state.matches[r.state.matches.length - 1]?.id !== r.clientSsr?.lastMatchId
    };
  }).catch(e => e.message);
  
  console.log('Router State:', state);
});
