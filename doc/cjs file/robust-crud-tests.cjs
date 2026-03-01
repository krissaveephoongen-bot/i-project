#!/usr/bin/env node

/**
 * 🔧 Robust Admin CRUD Testing Script
 * Handles API timeouts and provides detailed debugging
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Robust Admin CRUD Tests...\n');

class RobustCRUDTester {
  constructor() {
    this.results = [];
    this.testStartTime = new Date();
  }

  // Enhanced HTTP request with better error handling
  async makeRequest(method, path, timeout = 10000) {
    return new Promise((resolve) => {
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        timeout: timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Robust-CRUD-Tester/1.0'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ 
              success: res.statusCode < 400, 
              statusCode: res.statusCode, 
              data: parsed,
              headers: res.headers
            });
          } catch (error) {
            resolve({ 
              success: false, 
              statusCode: res.statusCode, 
              error: 'Invalid JSON response',
              rawData: data.substring(0, 200)
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({ 
          success: false, 
          error: error.message,
          code: error.code
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ 
          success: false, 
          error: 'Request timeout',
          timeout: timeout
        });
      });

      req.end();
    });
  }

  // Test server with detailed diagnostics
  async testServerConnection() {
    console.log('🌐 Testing Server Connection...');
    
    try {
      const result = await this.makeRequest('GET', '/', 5000);
      
      if (result.success) {
        console.log('    ✅ Server is running and accessible');
        console.log(`    📊 Status: ${result.statusCode}`);
        return { 
          status: 'PASS', 
          message: 'Server accessible',
          statusCode: result.statusCode
        };
      } else {
        console.log(`    ❌ Server responded with error: ${result.error}`);
        return { 
          status: 'FAIL', 
          error: result.error,
          statusCode: result.statusCode
        };
      }
    } catch (error) {
      console.log(`    ❌ Connection error:`, error.message);
      return { 
        status: 'FAIL', 
        error: error.message
      };
    }
  }

  // Test API endpoint with detailed diagnostics
  async testAPIEndpoint(endpoint, moduleName) {
    console.log(`🔌 Testing ${moduleName} API...`);
    
    try {
      // First try with shorter timeout
      const result = await this.makeRequest('GET', endpoint, 8000);
      
      if (result.success) {
        console.log(`    ✅ ${moduleName} API accessible`);
        console.log(`    📊 Status: ${result.statusCode}`);
        
        // Check if we got valid data
        if (Array.isArray(result.data)) {
          console.log(`    📋 Found ${result.data.length} items`);
        } else if (result.data && typeof result.data === 'object') {
          console.log(`    📋 Got object response`);
        }
        
        return { 
          module: moduleName, 
          operation: 'API_ACCESS', 
          status: 'PASS', 
          statusCode: result.statusCode,
          dataType: Array.isArray(result.data) ? 'array' : 'object',
          itemCount: Array.isArray(result.data) ? result.data.length : 1
        };
      } else {
        console.log(`    ❌ ${moduleName} API failed: ${result.error}`);
        if (result.statusCode) {
          console.log(`    📊 Status Code: ${result.statusCode}`);
        }
        if (result.rawData) {
          console.log(`    📄 Response: ${result.rawData}`);
        }
        
        return { 
          module: moduleName, 
          operation: 'API_ACCESS', 
          status: 'FAIL', 
          error: result.error,
          statusCode: result.statusCode,
          rawData: result.rawData
        };
      }
    } catch (error) {
      console.log(`    ❌ ${moduleName} API error:`, error.message);
      return { 
        module: moduleName, 
        operation: 'API_ACCESS', 
        status: 'FAIL', 
        error: error.message
      };
    }
  }

  // Test specific API routes with different methods
  async testAPIRoutes() {
    console.log('🛣️ Testing API Routes...');
    
    const routes = [
      { path: '/api/stakeholders', method: 'GET', name: 'Stakeholders' },
      { path: '/api/expenses', method: 'GET', name: 'Expenses' },
      { path: '/api/admin/users', method: 'GET', name: 'Admin Users' },
      { path: '/api/timesheet', method: 'GET', name: 'Timesheet' }
    ];

    const results = [];
    
    for (const route of routes) {
      console.log(`  🔍 Testing ${route.name} (${route.method} ${route.path})`);
      
      try {
        const result = await this.makeRequest(route.method, route.path, 5000);
        
        if (result.success) {
          console.log(`    ✅ ${route.name}: ${result.statusCode}`);
          results.push({
            module: route.name,
            operation: 'ROUTE_TEST',
            status: 'PASS',
            method: route.method,
            path: route.path,
            statusCode: result.statusCode
          });
        } else {
          console.log(`    ❌ ${route.name}: ${result.error || result.statusCode}`);
          results.push({
            module: route.name,
            operation: 'ROUTE_TEST',
            status: 'FAIL',
            method: route.method,
            path: route.path,
            error: result.error,
            statusCode: result.statusCode
          });
        }
      } catch (error) {
        console.log(`    ❌ ${route.name}: ${error.message}`);
        results.push({
          module: route.name,
          operation: 'ROUTE_TEST',
          status: 'FAIL',
          method: route.method,
          path: route.path,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Test project structure
  testProjectStructure() {
    console.log('📁 Testing Project Structure...');
    
    const requiredFiles = [
      'next-app/app/admin/users/page.tsx',
      'next-app/app/expenses/page.tsx',
      'next-app/app/timesheet/page.tsx',
      'next-app/app/stakeholders/page.tsx',
      'next-app/app/api/stakeholders/route.ts',
      'next-app/app/api/expenses/route.ts',
      'next-app/app/api/admin/users/route.ts'
    ];

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const file of requiredFiles) {
      const exists = fs.existsSync(file);
      if (exists) {
        passed++;
        console.log(`    ✅ ${file}`);
      } else {
        failed++;
        console.log(`    ❌ ${file} - Missing`);
      }
      results.push({ file, exists });
    }

    return {
      module: 'Project Structure',
      operation: 'FILE_CHECK',
      status: failed === 0 ? 'PASS' : 'FAIL',
      summary: { total: requiredFiles.length, passed, failed },
      details: results
    };
  }

  // Test database configuration
  testDatabaseConnection() {
    console.log('🗄️ Testing Database Connection...');
    
    try {
      const dbFiles = [
        'prisma/schema.prisma',
        '.env.local'
      ];

      let found = 0;
      for (const file of dbFiles) {
        if (fs.existsSync(file)) {
          found++;
          console.log(`    ✅ ${file} found`);
          
          // Check file contents
          if (file === '.env.local') {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('DATABASE_URL')) {
              console.log(`    ✅ DATABASE_URL found in .env.local`);
            } else {
              console.log(`    ⚠️ DATABASE_URL not found in .env.local`);
            }
          }
        } else {
          console.log(`    ❌ ${file} missing`);
        }
      }

      return {
        module: 'Database',
        operation: 'CONNECTION_CHECK',
        status: found === dbFiles.length ? 'PASS' : 'FAIL',
        summary: { found, total: dbFiles.length }
      };
    } catch (error) {
      console.log('    ❌ Database check error:', error.message);
      return {
        module: 'Database',
        operation: 'CONNECTION_CHECK',
        status: 'FAIL',
        error: error.message
      };
    }
  }

  // Generate comprehensive report
  generateReport() {
    const endTime = new Date();
    const duration = endTime - this.testStartTime;

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    for (const result of this.results) {
      if (Array.isArray(result)) {
        // Handle array results (like API routes)
        for (const subResult of result) {
          totalTests++;
          if (subResult.status === 'PASS') {
            passedTests++;
          } else {
            failedTests++;
          }
        }
      } else {
        totalTests++;
        if (result.status === 'PASS') {
          passedTests++;
        } else {
          failedTests++;
        }
      }
    }

    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

    const report = {
      timestamp: endTime.toISOString(),
      duration: `${duration}ms`,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: `${successRate}%`
      },
      modules: this.results.flat(),
      recommendations: this.generateRecommendations(),
      troubleshooting: this.generateTroubleshooting()
    };

    // Save JSON report
    fs.writeFileSync('robust-test-results.json', JSON.stringify(report, null, 2));

    // Generate HTML report
    this.generateHTMLReport(report);

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    const serverTest = this.results.flat().find(r => r.module === 'Server Connection');
    if (serverTest && serverTest.status === 'FAIL') {
      recommendations.push('Start the Next.js development server: cd next-app && npm run dev');
    }

    const apiTests = this.results.flat().filter(r => r.operation === 'API_ACCESS' || r.operation === 'ROUTE_TEST');
    const failedAPIs = apiTests.filter(r => r.status === 'FAIL');
    if (failedAPIs.length > 0) {
      recommendations.push('Check API routes configuration and ensure they are properly exported');
      recommendations.push('Verify database connection in API routes');
      recommendations.push('Check for any middleware that might be blocking requests');
    }

    const structTest = this.results.flat().find(r => r.module === 'Project Structure');
    if (structTest && structTest.status === 'FAIL') {
      recommendations.push('Ensure all required CRUD files are present in the project');
    }

    const dbTest = this.results.flat().find(r => r.module === 'Database');
    if (dbTest && dbTest.status === 'FAIL') {
      recommendations.push('Check database configuration and connection settings');
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests passed! Your CRUD system is working correctly.');
    }

    return recommendations;
  }

  generateTroubleshooting() {
    return {
      commonIssues: [
        'API timeouts may indicate database connection issues',
        'Check server console logs for detailed error messages',
        'Verify environment variables are properly set',
        'Ensure database is accessible and running'
      ],
      nextSteps: [
        'Check Next.js server console for errors',
        'Test API endpoints manually with curl or Postman',
        'Review API route implementations',
        'Check database connection strings'
      ]
    };
  }

  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Robust CRUD Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .modules { padding: 0 30px 30px; }
        .module { margin-bottom: 30px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .module-header { background: #f8f9fa; padding: 20px; border-bottom: 1px solid #e9ecef; }
        .module-header h2 { margin: 0; color: #495057; }
        .tests { padding: 20px; }
        .test { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #f1f3f4; }
        .test:last-child { border-bottom: none; }
        .test-status { padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 500; text-transform: uppercase; }
        .status-pass { background: #d4edda; color: #155724; }
        .status-fail { background: #f8d7da; color: #721c24; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; font-size: 0.9em; }
        .recommendations, .troubleshooting { padding: 30px; background: #f8f9fa; }
        .recommendations h3, .troubleshooting h3 { margin: 0 0 15px 0; color: #495057; }
        .recommendations ul, .troubleshooting ul { margin: 0; padding-left: 20px; }
        .recommendations li, .troubleshooting li { margin-bottom: 10px; }
        .timestamp { text-align: center; color: #6c757d; padding: 20px; border-top: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 Robust CRUD Test Report</h1>
            <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
            <p>Duration: ${report.duration}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${report.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>✅ Passed</h3>
                <div class="number passed">${report.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>❌ Failed</h3>
                <div class="number failed">${report.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>📊 Success Rate</h3>
                <div class="number">${report.summary.successRate}</div>
            </div>
        </div>
        
        <div class="modules">
            ${report.modules.map(module => `
                <div class="module">
                    <div class="module-header">
                        <h2>${module.module || 'Test'}</h2>
                    </div>
                    <div class="tests">
                        <div class="test">
                            <div class="test-name">${module.operation || 'Test'}</div>
                            <div class="test-status status-${module.status.toLowerCase()}">${module.status}</div>
                        </div>
                        ${module.error ? `<div class="error">Error: ${module.error}</div>` : ''}
                        ${module.statusCode ? `<div style="font-size: 0.9em; color: #666;">Status Code: ${module.statusCode}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="recommendations">
            <h3>💡 Recommendations</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="troubleshooting">
            <h3>🔧 Troubleshooting</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div>
                    <h4>Common Issues:</h4>
                    <ul>
                        ${report.troubleshooting.commonIssues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h4>Next Steps:</h4>
                    <ul>
                        ${report.troubleshooting.nextSteps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="timestamp">
            Report generated by Robust Admin CRUD Testing Suite
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync('robust-test-report.html', html);
    console.log('✅ HTML report generated: robust-test-report.html');
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Robust CRUD Test Suite...\n');
    console.log('⏰ Started at:', this.testStartTime.toLocaleString(), '\n');

    try {
      // Test 1: Server Connection
      const serverResult = await this.testServerConnection();
      this.results.push(serverResult);

      // Test 2: Project Structure
      const structResult = this.testProjectStructure();
      this.results.push(structResult);

      // Test 3: Database Connection
      const dbResult = this.testDatabaseConnection();
      this.results.push(dbResult);

      // Test 4: API Routes (detailed testing)
      const routeResults = await this.testAPIRoutes();
      this.results.push(routeResults);

      // Generate final report
      const report = this.generateReport();

      // Display summary
      console.log('\n📊 Test Results Summary:');
      console.log(`Total Tests: ${report.summary.total}`);
      console.log(`✅ Passed: ${report.summary.passed}`);
      console.log(`❌ Failed: ${report.summary.failed}`);
      console.log(`📊 Success Rate: ${report.summary.successRate}`);

      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));

      console.log('\n📄 Reports generated:');
      console.log('   - robust-test-results.json (detailed data)');
      console.log('   - robust-test-report.html (visual report)');

      return report;

    } catch (error) {
      console.log('❌ Test execution failed:', error.message);
      return { error: error.message };
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new RobustCRUDTester();
  tester.runAllTests().catch(console.error);
}

module.exports = RobustCRUDTester;
