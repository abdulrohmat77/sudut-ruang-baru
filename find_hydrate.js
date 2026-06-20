const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/SRA Project Command Center/dist/client/assets/index--e1-ZBnD.js', 'utf8');

// Find the pattern where hydrateRoot is used for starting
const hydrateIdx = code.indexOf('XS.hydrateRoot');
console.log('hydrateRoot at:', hydrateIdx);
if (hydrateIdx !== -1) {
  console.log('Context:', code.substring(hydrateIdx - 100, hydrateIdx + 300));
}

// Check how $_TSR is checked for spa mode
const pNIdx = code.indexOf('function pN');
console.log('\npN function context:');
console.log(code.substring(pNIdx, pNIdx + 600));
