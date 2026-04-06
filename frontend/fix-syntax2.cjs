const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

let startDelete = -1;
let endDelete = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(') : (') && lines[i+1].includes('fileInputRef.current.click()')) {
    startDelete = i;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes(')}')) {
        endDelete = j;
        break;
      }
    }
    break;
  }
}

if (startDelete !== -1 && endDelete !== -1) {
  lines.splice(startDelete, endDelete - startDelete + 1);
  fs.writeFileSync('src/App.jsx', lines.join('\n'));
  console.log('Fixed syntax error successfully!');
} else {
  console.log('Could not find the block to delete. Lines matched: ' + startDelete + ' to ' + endDelete);
}
