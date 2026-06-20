const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/SRA Project Command Center/src/routeTree.gen.ts', 'utf8');
// Look for the index route (path '/')
const idx = code.indexOf("id: '/'");
if (idx !== -1) {
  console.log('Index route:', code.substring(idx - 100, idx + 300));
} else {
  // Try to find all route IDs
  const matches = code.match(/id: '[^']+'/g);
  console.log('All route IDs:', matches ? matches.slice(0, 20) : 'none');
}
