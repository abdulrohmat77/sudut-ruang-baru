const fs = require('fs');
const code = fs.readFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/index.html', 'utf8');
const matches = [];
let match;
const re = /src="([^"]+)"/g;
while ((match = re.exec(code)) !== null) {
  matches.push(match[1]);
}
console.log('Scripts/src:', JSON.stringify(matches, null, 2));
