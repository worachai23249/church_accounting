const fs = require('fs');

function enlargeLogos() {
    // 1. App.jsx
    let appContent = fs.readFileSync('src/App.jsx', 'utf8');
    appContent = appContent.replace(/<img src="\/logo\.png\?v=3" alt="Logo" className="w-full h-full object-contain/g, '<img src="/logo.png?v=3" alt="Logo" className="w-full h-full object-contain scale-[1.35]');
    fs.writeFileSync('src/App.jsx', appContent);

    // 2. Login.jsx
    let loginContent = fs.readFileSync('src/pages/Login.jsx', 'utf8');
    loginContent = loginContent.replace(/<img src="\/logo\.png\?v=3" alt="Logo" className="w-full h-full object-contain/g, '<img src="/logo.png?v=3" alt="Logo" className="w-full h-full object-contain scale-[1.35]');
    fs.writeFileSync('src/pages/Login.jsx', loginContent);
    
    // 3. index.html - change to use ?v=4
    let indexContent = fs.readFileSync('index.html', 'utf8');
    indexContent = indexContent.replace(/\?v=3/g, '?v=4');
    fs.writeFileSync('index.html', indexContent);

    // Copy logo.png to favicon.ico to try and force update
    try {
        fs.copyFileSync('public/logo.png', 'public/favicon.ico');
    } catch(e) {}

    console.log('Scaled logos up by 1.35x and bumped cache to v4');
}

enlargeLogos();
