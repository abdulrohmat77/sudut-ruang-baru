const fs = require('fs');
const path = require('path');

const assetsDir = 'C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/assets';
const mainFile = 'index--e1-ZBnD.js';
const filePath = path.join(assetsDir, mainFile);

let code = fs.readFileSync(filePath, 'utf8');

// Patch 1: Change hydrateRoot to createRoot for the main app startup
// The pattern is: XS.hydrateRoot(document, JSX)
// We need to change it to: XS.createRoot(document.getElementById('root') || document.body).render(JSX)
// But since it's XS.hydrateRoot(document,...) we change to createRoot
const original1 = 'XS.hydrateRoot(document,';
const patched1 = 'XS.createRoot(document.body).render(';
if (!code.includes(original1)) {
  console.error('Pattern 1 not found! Searching...');
  const idx = code.indexOf('hydrateRoot');
  if (idx !== -1) console.log('hydrateRoot context:', code.substring(idx - 20, idx + 100));
} else {
  // We need to also close the render() call properly
  // Original: XS.hydrateRoot(document, Y.jsx(ae.StrictMode,{children:Y.jsx(yN,{})}))
  // Patched:  XS.createRoot(document.body).render(Y.jsx(ae.StrictMode,{children:Y.jsx(yN,{})}))
  // The args are the same! Just need to add .render() and adjust the container
  
  // Actually createRoot takes a container, and hydrateRoot takes document
  // Let's use: XS.createRoot(document.body).render(JSX)
  // But wait - the call is: XS.hydrateRoot(document, JSX) where document is the container
  // For createRoot we need an element, not document. Use document.documentElement
  code = code.replace('XS.hydrateRoot(document,', 'XS.createRoot(document.documentElement).render(');
  
  // Now fix the closing - hydrateRoot(container, element) has 2 args, 
  // createRoot(container).render(element) has render call
  // The original call ends with )) (closes hydrateRoot's arg and call)
  // We need it to end with ) (closes render's arg)
  // Find the specific ending: Y.jsx(ae.StrictMode,{children:Y.jsx(yN,{})})})
  // This is tricky to patch surgically. Let's check what the full call looks like.
  console.log('After first replace:', code.indexOf('XS.createRoot'));
}

// Actually, let me think differently. 
// hydrateRoot(container, element) - container is the DOM node that was server-rendered
// createRoot(container).render(element) - container is where React will render INTO
// Both use document as the container in this case.
// The signature difference means we need to remove one closing paren from the outer call.

// Let me find the exact pattern and patch it properly
const idx = code.indexOf('XS.createRoot(document.documentElement).render(');
if (idx !== -1) {
  // Find the matching close paren for the render call
  // We already consumed one arg to hydrateRoot (document), now the next arg becomes render's arg
  // The original: XS.hydrateRoot(document, JSX)) -- becomes XS.createRoot(doc).render(JSX))
  // But wait we replaced hydrateRoot(document, with createRoot(doc).render(
  // So original had: XS.hydrateRoot(document, JSX)) 
  // After replace: XS.createRoot(document.documentElement).render(JSX))
  // The extra ) is the ae.startTransition callback closing, so it should still work!
  console.log('Patch 1 applied! Context:', code.substring(idx, idx + 200));
  fs.writeFileSync(filePath, code);
  console.log('File saved!');
} else {
  console.error('Patch 1 failed - createRoot pattern not found after replace');
}
