const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace template literals with API_BASE_URL
  content = content.replace(/`\$\{API_BASE_URL\}\//g, '`./');
  content = content.replace(/`\\\$\{API_BASE_URL\}\//g, '`./');
  
  // Replace API_BASE_URL + prefix
  content = content.replace(/API_BASE_URL \+ `\.\//g, '`./');
  
  // Any stray API_BASE_URL
  content = content.replace(/\$\{API_BASE_URL\}\//g, './');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

fixFile('src/App.jsx');
fixFile('src/pages/Record.jsx');
fixFile('src/pages/Reports.jsx');
