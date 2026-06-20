const fs = require('fs');
const path = require('path');

// 1. Process the shell HTML to become index.html
const distClientDir = path.join(__dirname, 'dist/client');
const shellPath = path.join(distClientDir, '_shell.html');
const indexOutPath = path.join(distClientDir, 'index.html');

if (fs.existsSync(shellPath)) {
  let shellHtml = fs.readFileSync(shellPath, 'utf8');

  // Fix all asset paths: /assets/ -> /commandcenter/assets/
  shellHtml = shellHtml.replace(/"\/assets\//g, '"/commandcenter/assets/');

  const spaInitScript = `<script>
  // SPA mode bootstrap: provide minimal $_TSR so startClient skips SSR hydration
  (function() {
    self.$R = self.$R || {};
    self.$R["tsr"] = [];
    self.$_TSR = {
      h() { this.hydrated = true; this.c(); },
      e() { this.streamEnded = true; this.c(); },
      c() {
        if (this.hydrated && this.streamEnded) {
          delete self.$_TSR;
          delete self.$R.tsr;
        }
      },
      p(fn) { this.initialized ? fn() : this.buffer.push(fn); },
      buffer: [],
      initialized: false
    };
    self.$_TSR.router = {
      manifest: { routes: { __root__: { preloads: [], scripts: [] } } },
      matches: [],
      lastMatchId: null
    };
    self.$_TSR.e();
  })();
  </script>`;

  // Remove the old $_TSR stream barrier script and inject the new one
  shellHtml = shellHtml.replace(
    /<script class="\$tsr"[^>]*>[\s\S]*?<\/script>/g,
    spaInitScript
  );

  fs.writeFileSync(indexOutPath, shellHtml);
  console.log('✅ Created index.html from _shell.html with SPA setup.');
}

// 2. Patch the main JS bundle
const assetsDir = path.join(distClientDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir).filter(f => f.startsWith('index-') && f.endsWith('.js'));
  if (files.length > 0) {
    // Find largest file (main bundle)
    const mainFile = files.sort((a, b) => fs.statSync(path.join(assetsDir, b)).size - fs.statSync(path.join(assetsDir, a)).size)[0];
    const filePath = path.join(assetsDir, mainFile);
    let code = fs.readFileSync(filePath, 'utf8');
    let patched = false;

    // Patch 1: f1() invariant fix
    const orig1 = 'if(S){const E=f[1];E||Ft()';
    const patch1 = 'if(S){const E=f[1];if(!E){return p;}(true)';
    if (code.includes(orig1)) {
      code = code.replace(orig1, patch1);
      patched = true;
    }

    // Patch 2: hydrateRoot to createRoot
    const orig2 = 'XS.hydrateRoot(document,';
    const patch2 = 'XS.createRoot(document.documentElement).render(';
    if (code.includes(orig2)) {
      code = code.replace(orig2, patch2);
      patched = true;
    }

    // Patch 3: preserve basepath in pN
    const orig3 = 't.update({basepath:"",serializationAdapters:e})';
    const patch3 = 't.update({basepath:t.options.basepath||"",serializationAdapters:e})';
    if (code.includes(orig3)) {
      code = code.replace(orig3, patch3);
      patched = true;
    }

    if (patched) {
      fs.writeFileSync(filePath, code);
      console.log(`✅ Patched main bundle: ${mainFile}`);
    }
  }
}

// 3. Copy to Kiro's public folder
const kiroDest = path.join(__dirname, '../kiro/public/commandcenter');
if (fs.existsSync(path.join(__dirname, '../kiro'))) {
  fs.cpSync(distClientDir, kiroDest, { recursive: true, force: true });
  console.log(`✅ Copied build output to Kiro's public/commandcenter directory.`);
}
