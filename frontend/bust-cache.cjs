const fs = require('fs');

function bustCache(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // index.html
    content = content.replace(/\/logo\.png(\?v=\d+)?/g, '/logo.png?v=3');
    content = content.replace(/\/manifest\.json(\?v=\d+)?/g, '/manifest.json?v=3');
    
    // manifest.json
    content = content.replace(/\/pwa-192x192\.png(\?v=\d+)?/g, '/pwa-192x192.png?v=3');
    content = content.replace(/\/pwa-512x512\.png(\?v=\d+)?/g, '/pwa-512x512.png?v=3');
    
    fs.writeFileSync(filePath, content);
    console.log(`Busted cache v3 for ${filePath}`);
}

bustCache('index.html');
bustCache('public/manifest.json');
bustCache('src/App.jsx');
bustCache('src/pages/Login.jsx');

// Copy logo to pwa icons since Windows supports it
try {
  fs.copyFileSync('public/logo.png', 'public/pwa-192x192.png');
  fs.copyFileSync('public/logo.png', 'public/pwa-512x512.png');
  console.log('Copied NEW logo.png to pwa icons!');
} catch (e) {
  console.log('Error copying icons: ' + e.message);
}
