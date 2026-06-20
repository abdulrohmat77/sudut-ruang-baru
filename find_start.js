const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/SRA Project Command Center/dist/client/assets/index--e1-ZBnD.js', 'utf8');

// Find the gN and pN functions (start functions)
const idx1 = code.indexOf('async function gN');
const idx2 = code.indexOf('async function pN');
const idx3 = code.indexOf('function gN');
const idx4 = code.indexOf('function pN');
console.log('gN at:', idx1, idx3, '  pN at:', idx2, idx4);
if (idx1 !== -1) console.log('gN context:', code.substring(idx1, idx1 + 200));
if (idx3 !== -1) console.log('gN2 context:', code.substring(idx3, idx3 + 200));
if (idx4 !== -1) console.log('pN context:', code.substring(idx4, idx4 + 200));
