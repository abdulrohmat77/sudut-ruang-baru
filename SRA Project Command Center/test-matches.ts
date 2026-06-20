import { createRouter } from './src/router';
import { routeTree } from './src/routeTree.gen';

const router = createRouter();
const matches = router.matchRoutes('/');
console.log('Matches for /:', matches.map(m => m.id));

const matches2 = router.matchRoutes('/commandcenter/');
console.log('Matches for /commandcenter/:', matches2.map(m => m.id));

const matches3 = router.matchRoutes('');
console.log('Matches for empty string:', matches3.map(m => m.id));
