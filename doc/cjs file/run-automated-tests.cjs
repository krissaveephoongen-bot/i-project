#!/usr/bin/env node

/**
 * 🚀 Automated Admin CRUD Testing Runner
 * This script sets up and runs comprehensive CRUD tests
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Automated Admin CRUD Tests...\n');

// Step 1: Install dependencies
console.log('📦 Installing test dependencies...');
const installProcess = spawn('npm', ['install', 'puppeteer', 'chai'], { 
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

installProcess.on('close', (code) => {
  if (code !== 0) {
    console.log('❌ Failed to install dependencies');
    process.exit(1);
  }
  
  console.log('✅ Dependencies installed successfully\n');
  
  // Step 2: Run the tests
  console.log('🧪 Starting Automated CRUD Tests...\n');
  
  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.API_KEY = 'sk-user-pjKRSCs5p4VLA1WauX_IGwpOjWfK3_W4stuH5i3WiM-NXyGb5Kolgzd6PtG1B2MA_N2oqUk0CWKQapVRT4w2eRR0xaaeXckX8rtr9E1TstCbmyn0PWt6WlXIaOUQuRzdjn0';
  
  // Run the test script
  const testProcess = spawn('node', ['automated-admin-tests.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    env: { ...process.env }
  });
  
  testProcess.on('close', (testCode) => {
    console.log('\n🏁 Test execution completed');
    
    if (testCode === 0) {
      console.log('✅ All tests completed successfully');
    } else {
      console.log(`❌ Tests completed with errors (exit code: ${testCode})`);
    }
    
    // Step 3: Generate HTML report
    generateHTMLReport();
    
    console.log('\n📊 Test Results:');
    console.log('- Check test-report.json for detailed results');
    console.log('- Check test-report.html for visual report');
    console.log('- Check screenshots/ for test screenshots');
  });
});

function generateHTMLReport() {
  console.log('\n📄 Generating HTML Report...');
  
  try {
    // Read JSON report if it exists
    let reportData = { modules: [], summary: { total: 0, passed: 0, failed: 0 } };
    
    if (fs.existsSync('test-report.json')) {
      const jsonContent = fs.readFileSync('test-report.json', 'utf8');
      reportData = JSON.parse(jsonContent);
    }
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin CRUD Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 1.1em; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; font-size: 1.1em; }
        .summary-card .number { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .modules { padding: 0 30px 30px; }
        .module { margin-bottom: 30px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .module-header { background: #f8f9fa; padding: 20px; border-bottom: 1px solid #e9ecef; }
        .module-header h2 { margin: 0; color: #495057; font-size: 1.5em; }
        .tests { padding: 20px; }
        .test { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #f1f3f4; }
        .test:last-child { border-bottom: none; }
        .test-name { font-weight: 500; color: #333; }
        .test-status { padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 500; text-transform: uppercase; }
        .status-pass { background: #d4edda; color: #155724; }
        .status-fail { background: #f8d7da; color: #721c24; }
        .status-skip { background: #fff3cd; color: #856404; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; font-size: 0.9em; }
        .timestamp { text-align: center; color: #6c757d; padding: 20px; border-top: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Admin CRUD Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${reportData.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>✅ Passed</h3>
                <div class="number passed">${reportData.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>❌ Failed</h3>
                <div class="number failed">${reportData.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>📊 Success Rate</h3>
                <div class="number">${reportData.summary.successRate || '0%'}</div>
            </div>
        </div>
        
        <div class="modules">
            ${reportData.modules.map(module => `
                <div class="module">
                    <div class="module-header">
                        <h2>${module.name}</h2>
                    </div>
                    <div class="tests">
                        ${module.tests.map(test => `
                            <div class="test">
                                <div class="test-name">${test.operation}</div>
                                <div class="test-status status-${test.status.toLowerCase()}">${test.status}</div>
                            </div>
                            ${test.error ? `<div class="error">${test.error}</div>` : ''}
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="timestamp">
            Report generated by Automated Admin CRUD Testing Suite
        </div>
    </div>
</body>
</html>`;
    
    fs.writeFileSync('test-report.html', htmlContent);
    console.log('✅ HTML report generated: test-report.html');
    
  } catch (error) {
    console.log('❌ Failed to generate HTML report:', error.message);
  }
}

console.log('🎯 Ready to run automated CRUD tests!');
console.log('📋 Test Coverage:');
console.log('  👥 Admin Users - Full CRUD operations');
console.log('  💰 Expenses - Create, Read, Update, Delete, Approve/Reject');
console.log('  🕐 Timesheet - Create, Read, Update, Delete entries');
console.log('  👥 Stakeholders - Read operations + API CRUD');
console.log('\n🚀 Starting tests in 3 seconds...');

setTimeout(() => {
  console.log('🧪 Test execution started...');
}, 3000);
