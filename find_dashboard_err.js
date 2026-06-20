const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/assets/dashboard-l5aKWNbB.js', 'utf8');

// Find the om function and what's after it
const omIdx = code.indexOf('function om()');
const omCode = code.substring(omIdx, omIdx + 2000);
// Find where it uses .length
const lenIdx = omCode.indexOf('.length');
console.log('om function code around .length:');
console.log(omCode.substring(Math.max(0, lenIdx - 200), lenIdx + 300));
