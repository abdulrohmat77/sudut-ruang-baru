const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/index.html', 'utf8');
const bad = (code.split('/assets/').length - 1);
const good = (code.split('/commandcenter/assets/').length - 1);
console.log('Remaining /assets/ refs (including /commandcenter/assets/):', bad);
console.log('/commandcenter/assets/ refs:', good);
console.log('Net un-prefixed refs (should be 0):', bad - good);
