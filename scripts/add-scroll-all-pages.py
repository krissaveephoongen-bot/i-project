#!/usr/bin/env python3
import os
import re

pages_dir = os.path.join(os.path.dirname(__file__), '../src/pages')

files_to_update = [
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
]

def add_scroll_container(file_path):
    """Add ScrollContainer to a component file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has ScrollContainer
    if 'ScrollContainer' in content:
        print(f"✓ {os.path.basename(file_path)} already has ScrollContainer")
        return False
    
    # Add import after last import
    import_pattern = r'((?:import\s+.*?\n)+)'
    import_match = re.search(import_pattern, content)
    
    if import_match:
        import_end = import_match.end()
        content = (
            content[:import_end] +
            "import ScrollContainer from '../components/layout/ScrollContainer';\n" +
            content[import_end:]
        )
    
    # Find return statement and wrap
    return_pattern = r'(\s+return\s*\(\s*)(<div[^>]*className="[^"]*space-y-6[^"]*")'
    
    if re.search(return_pattern, content):
        content = re.sub(
            return_pattern,
            r'\1<ScrollContainer className="min-h-screen">\n            \2',
            content
        )
        
        # Find the last closing div before function end
        content = re.sub(
            r'(</div>\s*)\);(\s*})',
            r'\1\n        </ScrollContainer>\n    );\2',
            content,
            count=1
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Updated {os.path.basename(file_path)}")
        return True
    else:
        print(f"⚠ Could not update {os.path.basename(file_path)} - structure not recognized")
        return False

# Process files
updated = 0
for file in files_to_update:
    file_path = os.path.join(pages_dir, file)
    if os.path.exists(file_path):
        if add_scroll_container(file_path):
            updated += 1

print(f"\n✓ Updated {updated} files")
