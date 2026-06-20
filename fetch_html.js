const fs = require('fs');
fetch('http://localhost:3002/')
  .then(res => res.text())
  .then(html => {
    html = html.replace(/"\/assets\//g, '"/commandcenter/assets/');
    fs.writeFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/index.html', html);
  });
