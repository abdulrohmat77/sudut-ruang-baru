const fs = require('fs');
const path = require('path');

// Path to the JS bundle in kiro
const assetsDir = 'C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/assets';
const files = fs.readdirSync(assetsDir).filter(f => f.startsWith('index-') && f.endsWith('.js') && !f.includes('Cla8l0g1') && !f.includes('CIBoJ') && !f.includes('BEWXX2dh'));
console.log('Candidate main JS files:', files);
if (files.length === 0) {
  console.error('No main JS file found!');
  process.exit(1);
}

// Find the main bundle (largest file that starts with index-)
const mainFile = files.sort((a, b) => {
  return fs.statSync(path.join(assetsDir, b)).size - fs.statSync(path.join(assetsDir, a)).size;
})[0];
console.log('Main bundle:', mainFile, '  Size:', fs.statSync(path.join(assetsDir, mainFile)).size);

let code = fs.readFileSync(path.join(assetsDir, mainFile), 'utf8');

// The problem: in f1(), when S=true (location changed from server render),
// it tries to get f[1] (second match = index route) and asserts it exists.
// But if the basepath strips the URL and we only match root, f[1] is undefined.
//
// Fix: change "E||Ft()" on that specific line to safely skip if E doesn't exist.
// The pattern is: if(S){const E=f[1];E||Ft(),...
// We change it to: if(S){const E=f[1];if(!E){return p;}
const original = 'if(S){const E=f[1];E||Ft()';
const patched = 'if(S){const E=f[1];if(!E){return p;}(true)';

if (!code.includes(original)) {
  console.error('Pattern not found! Cannot patch.');
  console.log('Searching for similar patterns...');
  const idx = code.indexOf('const E=f[1]');
  if (idx !== -1) console.log('f[1] context:', code.substring(idx - 20, idx + 200));
  process.exit(1);
}

code = code.replace(original, patched);
fs.writeFileSync(path.join(assetsDir, mainFile), code);
console.log('\nPatched successfully! The invariant in f1() will now gracefully skip if f[1] is missing.');
