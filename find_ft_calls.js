const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/SRA Project Command Center/dist/client/assets/index--e1-ZBnD.js', 'utf8');
const lines = code.split('\n');
// f1 is on line 12 (0-indexed = line 11), col 32268
// Find all Ft() calls in f1
const line12 = lines[11];
let allFt = [];
let idx = 0;
while (true) {
  idx = line12.indexOf('Ft()', idx);
  if (idx === -1) break;
  allFt.push({ col: idx, context: line12.substring(Math.max(0, idx - 100), Math.min(line12.length, idx + 100)) });
  idx += 4;
}
console.log('All Ft() calls on line 12:', allFt.length);
allFt.forEach((ft, i) => {
  console.log(`\n#${i+1} at col ${ft.col}:`);
  console.log(ft.context);
});
