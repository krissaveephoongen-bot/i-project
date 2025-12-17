#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/pages');
const filesToUpdate = [
    'Activity.tsx',
    'AdminUsers.tsx',
    'DatabaseStatusPage.tsx',
    'Expenses.tsx',
    'Favorites.tsx',
    'LandingPage.tsx',
    'Menu.tsx',
    'MenuSearch.tsx',
    'NotFound.tsx',
    'ProjectDetail.tsx',
    'ProjectDetailEnhanced.tsx',
    'ProjectsEnhanced.tsx',
    'Reports.tsx',
    'ReportsNew.tsx',
    'Search.tsx',
    'Settings.tsx',
];

function addScrollContainer(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if ScrollContainer is already imported
    if (content.includes('ScrollContainer')) {
        console.log(`✓ ${path.basename(filePath)} already has ScrollContainer`);
        return false;
    }
    
    // Add import
    const importMatch = content.match(/^(import\s+.*?\n)+/);
    if (importMatch) {
        const lastImportIndex = importMatch[0].lastIndexOf('\n');
        const importInsertPoint = importMatch[0].length;
        content = content.slice(0, importInsertPoint) + 
                  "import ScrollContainer from '../components/layout/ScrollContainer';\n" + 
                  content.slice(importInsertPoint);
    }
    
    // Find the main return statement
    const returnMatch = content.match(/return\s*\(\s*<div/);
    if (returnMatch) {
        const returnIndex = content.indexOf(returnMatch[0]);
        const beforeReturn = content.slice(0, returnIndex);
        const returnPart = content.slice(returnIndex);
        
        // Wrap return with ScrollContainer
        const updatedContent = beforeReturn + 
            'return (\n' +
            '        <ScrollContainer className="min-h-screen">\n' +
            '            <div' +
            returnPart.slice(returnMatch[0].length - '<div'.length);
        
        // Find last closing div and wrap with ScrollContainer closing
        const lastDivIndex = updatedContent.lastIndexOf('</div>');
        if (lastDivIndex !== -1) {
            const beforeLastDiv = updatedContent.slice(0, lastDivIndex + '</div>'.length);
            const afterLastDiv = updatedContent.slice(lastDivIndex + '</div>'.length);
            
            const finalContent = beforeLastDiv + '\n        </ScrollContainer>\n' + afterLastDiv;
            
            fs.writeFileSync(filePath, finalContent, 'utf8');
            console.log(`✓ Updated ${path.basename(filePath)}`);
            return true;
        }
    }
    
    console.log(`⚠ Could not update ${path.basename(filePath)} - structure not recognized`);
    return false;
}

// Process files
let updated = 0;
filesToUpdate.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (fs.existsSync(filePath)) {
        if (addScrollContainer(filePath)) {
            updated++;
        }
    }
});

console.log(`\n✓ Updated ${updated} files`);
