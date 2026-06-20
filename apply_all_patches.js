const fs = require('fs');
const path = require('path');

const assetsDir = 'C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/assets';
const files = fs.readdirSync(assetsDir).filter(f => f.startsWith('index-') && f.endsWith('.js'));
const mainFile = files.sort((a, b) => fs.statSync(path.join(assetsDir, b)).size - fs.statSync(path.join(assetsDir, a)).size)[0];
console.log('Main bundle to patch:', mainFile);

const filePath = path.join(assetsDir, mainFile);
let code = fs.readFileSync(filePath, 'utf8');

// Patch 1: f1() invariant fix
const orig1 = 'if(S){const E=f[1];E||Ft()';
const patch1 = 'if(S){const E=f[1];if(!E){return p;}(true)';
if (code.includes(orig1)) {
  code = code.replace(orig1, patch1);
  console.log('Patch 1 (invariant) applied.');
} else {
  console.error('Patch 1 pattern not found!');
}

// Patch 2: hydrateRoot to createRoot
const orig2 = 'XS.hydrateRoot(document,';
const patch2 = 'XS.createRoot(document.documentElement).render(';
if (code.includes(orig2)) {
  code = code.replace(orig2, patch2);
  console.log('Patch 2 (createRoot) applied.');
} else {
  console.error('Patch 2 pattern not found!');
}

// Patch 3: preserve basepath in pN
const orig3 = 't.update({basepath:"",serializationAdapters:e})';
const patch3 = 't.update({basepath:t.options.basepath||"",serializationAdapters:e})';
if (code.includes(orig3)) {
  code = code.replace(orig3, patch3);
  console.log('Patch 3 (basepath) applied.');
} else {
  console.error('Patch 3 pattern not found!');
}

fs.writeFileSync(filePath, code);
console.log('All patches applied and saved.');
