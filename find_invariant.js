const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/SRA Project Command Center/dist/client/assets/index--e1-ZBnD.js', 'utf8');
const lines = code.split('\n');
// Line 12, char 32268 - get surrounding context
const line12 = lines[11] || ''; // 0-indexed
const col = 32268;
const start = Math.max(0, col - 200);
const end = Math.min(line12.length, col + 300);
console.log('f1 invariant context (line 12, col ~32268):');
console.log(line12.substring(start, end));
