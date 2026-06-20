const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/SRA Project Command Center/dist/client/assets/index--e1-ZBnD.js', 'utf8');
let idx = -1;
let count = 0;
while (true) {
  idx = code.indexOf('$_TSR', idx + 1);
  if (idx === -1) break;
  count++;
  console.log('Found $_TSR at', idx, ':', code.substring(idx, idx + 100));
  if (count > 10) break;
}
console.log('Total $_TSR usages:', count);
