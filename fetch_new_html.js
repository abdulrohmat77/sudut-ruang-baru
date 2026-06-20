const fs = require('fs');

fetch('http://localhost:3002/')
  .then(res => res.text())
  .then(html => {
    // Replace base path for assets so it resolves properly from Kiro
    html = html.replace(/"\/assets\//g, '"/commandcenter/assets/');
    
    fs.writeFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/index.html', html);
    console.log('Successfully generated complete index.html with hydration state and new asset hashes');
  })
  .catch(console.error);
