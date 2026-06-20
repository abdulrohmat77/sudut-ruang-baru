const fs = require('fs');

// Fetch the HTML from the correct basepath!
fetch('http://localhost:3002/commandcenter/')
  .then(res => res.text())
  .then(html => {
    // We shouldn't need to replace /assets/ if the preview server served it correctly with /commandcenter/assets/,
    // but we'll do it just in case some paths are still absolute to root.
    html = html.replace(/"\/assets\//g, '"/commandcenter/assets/');
    
    fs.writeFileSync('C:/Users/dandidce/Downloads/Master SRA Dasboard System/kiro/public/commandcenter/index.html', html);
    console.log('Successfully generated complete index.html from /commandcenter/ with hydration state and new asset hashes');
  })
  .catch(console.error);
