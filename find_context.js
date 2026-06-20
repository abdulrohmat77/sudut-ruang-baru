const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/SRA Project Command Center/dist/client/assets/index--e1-ZBnD.js', 'utf8');
const lines = code.split('\n');
const line12 = lines[11];
// Get context around col 32067 to 32500 (around the E||Ft() at 32267)
const col = 32267;
const start = Math.max(0, col - 500);
const end = Math.min(line12.length, col + 800);
console.log('Context around col 32267:');
console.log(line12.substring(start, end));
