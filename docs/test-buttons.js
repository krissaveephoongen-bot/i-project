#!/usr/bin/env node

/**
 * Button Functionality Test Runner
 * ทดสอบทุกปุ่มต้องสามารถใช้งานได้จริง
 * Test all buttons to ensure they actually work
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`\n${colors.bright}${colors.cyan}🧪 Button Functionality Test Suite${colors.reset}\n`);
console.log(`${colors.blue}ทดสอบทุกปุ่มต้องสามารถใช้งานได้จริง${colors.reset}\n`);

const tests = [
  {
    name: '📋 Header Buttons',
    description: 'Theme toggle, notifications, user menu',
  },
  {
    name: '🧭 Navigation Buttons',
    description: 'Sidebar collapse, menu navigation',
  },
  {
    name: '📝 Form Buttons',
    description: 'Create, submit, cancel buttons',
  },
  {
    name: '⚙️ Table Action Buttons',
    description: 'Edit, delete, view actions',
  },
  {
    name: '🔍 Filter/Search Buttons',
    description: 'Search, filter, reset functionality',
  },
  {
    name: '📥 Export/Download Buttons',
    description: 'Export to file, print',
  },
  {
    name: '✔️ Dropdown Buttons',
    description: 'Select options, status changes',
  },
  {
    name: '☑️ Checkbox Buttons',
    description: 'Toggle states, select all',
  },
  {
    name: '🪟 Modal Buttons',
    description: 'Close, confirm actions',
  },
  {
    name: '📢 Toast Buttons',
    description: 'Notification dismissal',
  },
  {
    name: '📄 Page-Specific Buttons',
    description: 'Project, timesheet, task actions',
  },
  {
    name: '⌨️ Keyboard Interactions',
    description: 'Enter, escape, tab navigation',
  },
  {
    name: '🖱️ Hover States',
    description: 'Visual feedback on hover',
  },
  {
    name: '🚫 Disabled States',
    description: 'Disabled button behavior',
  },
];

console.log(`${colors.bright}Test Categories:${colors.reset}\n`);
tests.forEach((test, index) => {
  console.log(`  ${index + 1}. ${test.name}`);
  console.log(`     ${colors.yellow}${test.description}${colors.reset}\n`);
});

console.log(`${colors.bright}Running Tests...${colors.reset}\n`);

// Run Playwright tests
const testCommand = 'npx playwright test tests/e2e/buttons-functionality.spec.ts --headed';

exec(testCommand, (error, stdout, stderr) => {
  if (error) {
    console.log(`${colors.red}❌ Tests failed:${colors.reset}\n`);
    console.log(stdout);
    if (stderr) console.log(stderr);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ Tests passed:${colors.reset}\n`);
    console.log(stdout);
    
    // Generate report
    generateReport();
  }
});

function generateReport() {
  const reportPath = path.join(__dirname, '..', 'BUTTON_TEST_REPORT.md');
  
  const report = `# 🧪 Button Functionality Test Report

**Date**: ${new Date().toLocaleString()}
**Status**: ✅ All Tests Executed

## Test Summary

### Categories Tested: ${tests.length}

${tests.map((test, i) => `${i + 1}. **${test.name}**\n   - ${test.description}`).join('\n\n')}

## Test Results

### ✅ Tests Executed
- Header button interactions
- Navigation functionality
- Form submission workflows
- Table action buttons
- Filter and search operations
- Export/download capabilities
- Dropdown selections
- Checkbox toggling
- Modal operations
- Keyboard interactions
- Hover states
- Disabled button behavior

## Button Test Coverage

### Button Types Tested
- [ ] Primary buttons
- [ ] Secondary buttons
- [ ] Danger buttons
- [ ] Disabled buttons
- [ ] Loading state buttons
- [ ] Icon buttons
- [ ] Text buttons

### Interaction Patterns Tested
- [ ] Click events
- [ ] Hover states
- [ ] Focus states
- [ ] Disabled states
- [ ] Loading states
- [ ] Keyboard activation (Enter)
- [ ] Escape key handling
- [ ] Tab navigation

### Page Buttons Tested
- [ ] Header buttons
- [ ] Sidebar navigation
- [ ] Create/Add buttons
- [ ] Edit buttons
- [ ] Delete buttons
- [ ] Submit buttons
- [ ] Cancel buttons
- [ ] Filter buttons
- [ ] Search buttons
- [ ] Export buttons
- [ ] Action menu buttons

## Issues Found

(Document any button issues discovered)

| Button | Page | Issue | Priority | Status |
|--------|------|-------|----------|--------|
| | | | | |

## Recommendations

1. **All buttons must respond to click events**
   - Each button should trigger its intended action
   - No silent failures

2. **Visual feedback required**
   - Hover state visible
   - Active/pressed state visible
   - Disabled state clearly shown

3. **Keyboard accessibility**
   - All buttons focusable with Tab
   - Enter/Space should activate
   - Escape closes modals

4. **Consistency**
   - Same button types behave the same
   - Same visual style across app
   - Standard confirmation patterns

## Next Steps

1. Address any failed tests
2. Fix broken button handlers
3. Re-run test suite
4. Verify all buttons work in production

---

**Tested By**: Automation Suite
**Last Updated**: ${new Date().toLocaleString()}
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n${colors.green}✅ Report generated: BUTTON_TEST_REPORT.md${colors.reset}\n`);
}
