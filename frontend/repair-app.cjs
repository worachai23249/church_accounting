const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<Upload size={32} className="text-slate-400')) {
    skip = true;
  }
  
  if (skip) {
    if (lines[i].includes(')}')) {
      // Keep the `)}` line
      newLines.push(lines[i]);
      skip = false;
    }
  } else {
    newLines.push(lines[i]);
  }
}

fs.writeFileSync('src/App.jsx', newLines.join('\n'));
console.log('Repaired App.jsx');
