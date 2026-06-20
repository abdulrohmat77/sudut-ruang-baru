const fs = require('fs');
const path = require('path');

const assetsDir = 'C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/assets';
const mainFile = 'index--e1-ZBnD.js';
const filePath = path.join(assetsDir, mainFile);

let code = fs.readFileSync(filePath, 'utf8');

// Problem: pN() overrides basepath to "" on client startup
// This causes the router to lose its basepath "/commandcenter" 
// and fail to match any URL like /commandcenter/...
//
// Fix: Instead of setting basepath to "", preserve the router's existing basepath
// OR explicitly set it to /commandcenter
//
// Pattern to find: t.update({basepath:"",serializationAdapters:e})
// We change to: t.update({basepath:t.options.basepath||"",serializationAdapters:e})

const original = 't.update({basepath:"",serializationAdapters:e})';
const patched = 't.update({basepath:t.options.basepath||"",serializationAdapters:e})';

if (!code.includes(original)) {
  console.error('Pattern not found!');
  // Try to find it
  const idx = code.indexOf('basepath:""');
  if (idx !== -1) {
    console.log('Found similar at:', idx);
    console.log('Context:', code.substring(idx - 100, idx + 200));
  }
} else {
  code = code.replace(original, patched);
  fs.writeFileSync(filePath, code);
  console.log('✓ Patched basepath preservation! Router will now keep its configured basepath.');
  console.log('Pattern replaced:', original, '\n→', patched);
}
