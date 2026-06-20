const fs = require('fs');

fetch('http://localhost:3008/commandcenter/')
  .then(res => res.text())
  .then(html => {
    html = html.replace(/"\/assets\//g, '"/commandcenter/assets/');
    fs.writeFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/index.html', html);
    console.log('Successfully generated complete index.html from root with hydration state and new asset hashes');
  })
  .catch(console.error);
