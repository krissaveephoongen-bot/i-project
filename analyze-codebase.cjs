// Analyze codebase to understand required schema
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing codebase for database schema requirements...\n');

// Find all API routes and database queries
const apiDir = path.join(__dirname, 'next-app', 'app', 'api');
const requiredTables = new Set();
const tableSchemas = {};

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find table references
    const tableMatches = content.match(/from\(['"]([^'"]+)['"]\)/g);
    if (tableMatches) {
      tableMatches.forEach(match => {
        const table = match.match(/from\(['"]([^'"]+)['"]\)/)[1];
        requiredTables.add(table);
      });
    }
    
    // Find column references
    const columnMatches = content.match(/select\(['"]([^'"]+)['"]\)/g);
    if (columnMatches) {
      columnMatches.forEach(match => {
        const column = match.match(/select\(['"]([^'"]+)['"]\)/)[1];
        console.log(`   Column found: ${column}`);
      });
    }
    
  } catch (error) {
    console.log(`   Error reading ${filePath}: ${error.message}`);
  }
}

function findApiFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findApiFiles(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        console.log(`📄 Analyzing: ${filePath}`);
        analyzeFile(filePath);
      }
    });
  } catch (error) {
    console.log(`   Error reading directory ${dir}: ${error.message}`);
  }
}

findApiFiles(apiDir);

console.log('\n📋 Required Tables:');
requiredTables.forEach(table => {
  console.log(`   - ${table}`);
});

console.log('\n✅ Analysis complete!');
