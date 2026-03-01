const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components', 'lib']; // Added lib
const replacements = [
  { from: 'Button', to: 'button' },
  { from: 'Dialog', to: 'dialog' },
  { from: 'Input', to: 'input' },
  { from: 'Select', to: 'select' },
  { from: 'Skeleton', to: 'skeleton' },
  { from: 'EmptyState', to: 'empty-state' },
  { from: 'Loading', to: 'loading' },
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) { // Added .js
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      
      for (const rep of replacements) {
        const regex = new RegExp(`(\\/)${rep.from}(['"])`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `$1${rep.to}$2`);
          changed = true;
        }
      }

      if (changed) {
        console.log(`Updating ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    walk(dir);
  }
}
