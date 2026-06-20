const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/SRA Project Command Center/dist/client/assets/index--e1-ZBnD.js', 'utf8');
const lines = code.split('\n');
const line12 = lines[11] || '';
// Look for E||Ft() pattern - E is a display pending match
// This is "E || Invariant()" meaning E must exist
// Let's find the full f1 function
const f1idx = code.indexOf('async function f1');
if (f1idx === -1) {
  const f1idx2 = code.indexOf('function f1(');
  console.log('f1 at:', f1idx2);
  console.log('f1:', code.substring(f1idx2, f1idx2 + 1000));
} else {
  console.log('f1:', code.substring(f1idx, f1idx + 1000));
}
