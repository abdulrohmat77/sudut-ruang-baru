const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/SRA Project Command Center/dist/client/assets/index--e1-ZBnD.js', 'utf8');
const basepathEmpty = code.indexOf('basepath:""');
const basepathComma = code.indexOf('basepath:","');
console.log('basepath:"" at:', basepathEmpty);
console.log('basepath:"," at:', basepathComma);
if (basepathEmpty !== -1) console.log('context:', code.substring(basepathEmpty - 100, basepathEmpty + 200));

// Also check the pN function that might reset basepath  
const pNidx = code.indexOf('function pN');
console.log('\npN function (relevant part):');
const pNcode = code.substring(pNidx, pNidx + 800);
console.log(pNcode);
