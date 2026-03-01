const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const uiDir = path.join(projectRoot, 'app', 'components', 'ui');

// 1. Check for capitalized filenames in components/ui
if (fs.existsSync(uiDir)) {
  const files = fs.readdirSync(uiDir);
  let hasCapitalized = false;
  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (/^[A-Z]/.test(file)) {
        console.error(`Error: Found capitalized file in components/ui: ${file}. Shadcn UI components should be lowercase.`);
        hasCapitalized = true;
      }
    }
  });
  if (hasCapitalized) {
    console.error('Please rename these files to lowercase (e.g. Button.tsx -> button.tsx).');
    process.exit(1);
  }
}

// 2. Check for imports of capitalized components in the codebase
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.venv') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, fileList);
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

console.log('Scanning imports...');
const files = walk(projectRoot);
let importErrors = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Regex to find imports from components/ui/Capitalized
  const regex = /from\s+['"].*\/components\/ui\/([A-Z][a-zA-Z0-9]*)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    console.error(`Error in ${path.relative(projectRoot, file)}:`);
    console.error(`  Importing capitalized component: ${match[0]}`);
    console.error(`  Should be lowercase: ${match[1].toLowerCase()}`);
    importErrors++;
  }
});

if (importErrors > 0) {
  console.error(`Found ${importErrors} import casing errors.`);
  process.exit(1);
}

console.log('Deployment check passed: No casing issues found.');
