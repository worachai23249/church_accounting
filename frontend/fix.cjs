const fs = require('fs');

const files = [
  'C:/xampp/htdocs/church_accounting/frontend/src/App.jsx',
  'C:/xampp/htdocs/church_accounting/frontend/src/pages/Login.jsx',
  'C:/xampp/htdocs/church_accounting/frontend/src/pages/Record.jsx',
  'C:/xampp/htdocs/church_accounting/frontend/src/pages/Reports.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Add import if not exists
  if (!code.includes('import { API_BASE_URL }')) {
    const importPath = file.includes('pages/') ? '../config' : './config';
    const importStr = "import { API_BASE_URL } from '" + importPath + "';\n";
    
    // insert after first import
    const lines = code.split('\n');
    let inserted = false;
    for(let i=0; i<lines.length; i++) {
        if (lines[i].startsWith('import ')) {
            lines.splice(1, 0, importStr);
            inserted = true;
            break;
        }
    }
    if(!inserted) lines.unshift(importStr);
    code = lines.join('\n');
  }

  // Handle standard GET fetches
  code = code.replace(/fetch\('(\/church_api\/[^']+)'\)/g, "fetch(API_BASE_URL + '$1', { credentials: 'include' })");
  
  // Handle POST fetches (where headers are passed)
  code = code.replace(/fetch\('(\/church_api\/[^']+)',\s*\{/g, "fetch(API_BASE_URL + '$1', { credentials: 'include',");

  // Handle URL variable fetches 
  code = code.replace(/fetch\(url,\s*\{/g, "fetch(url, { credentials: 'include',");
  code = code.replace(/'\/church_api\/update_([^']+)'/g, "`\\${API_BASE_URL}/church_api/update_$1`");
  code = code.replace(/'\/church_api\/add_([^']+)'/g, "`\\${API_BASE_URL}/church_api/add_$1`");

  fs.writeFileSync(file, code);
  console.log('Updated ' + file);
});
