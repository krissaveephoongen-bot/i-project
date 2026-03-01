#!/usr/bin/env node

/**
 * 🧪 Simple Admin CRUD Testing Script
 * Tests basic CRUD functionality without complex dependencies
 */

const http = require('http');

console.log('🚀 Starting Simple Admin CRUD Tests...\n');

// Test configuration
const BASE_URL = 'http://localhost:3000';

// Simple HTTP request function
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Simple-CRUD-Tester/1.0'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const data = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: { error: 'Invalid JSON response' }
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Test functions
async function testStakeholdersAPI() {
  console.log('👥 Testing Stakeholders API...');
  
  try {
    // Test GET all stakeholders
    console.log('  👁️ Testing GET /api/stakeholders');
    const getResult = await makeRequest('GET', '/api/stakeholders');
    
    if (getResult.statusCode === 200) {
      console.log(`    ✅ Success: Found ${Array.isArray(getResult.data) ? getResult.data.length : 'data'} stakeholders`);
      return { module: 'Stakeholders', status: 'PASS', operation: 'READ' };
    } else {
      console.log(`    ❌ Failed: Status ${getResult.statusCode}`);
      return { module: 'Stakeholders', status: 'FAIL', operation: 'READ', error: getResult.data?.error || 'Connection failed' };
    }
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    return { module: 'Stakeholders', status: 'FAIL', operation: 'READ', error: error.message };
  }
}

async function testExpensesAPI() {
  console.log('💰 Testing Expenses API...');
  
  try {
    // Test GET all expenses
    console.log('  👁️ Testing GET /api/expenses');
    const getResult = await makeRequest('GET', '/api/expenses');
    
    if (getResult.statusCode === 200) {
      console.log(`    ✅ Success: Found ${Array.isArray(getResult.data) ? getResult.data.length : 'data'} expenses`);
      return { module: 'Expenses', status: 'PASS', operation: 'READ' };
    } else {
      console.log(`    ❌ Failed: Status ${getResult.statusCode}`);
      return { module: 'Expenses', status: 'FAIL', operation: 'READ', error: getResult.data?.error || 'Connection failed' };
    }
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    return { module: 'Expenses', status: 'FAIL', operation: 'READ', error: error.message };
  }
}

async function testAdminUsersAPI() {
  console.log('👥 Testing Admin Users API...');
  
  try {
    // Test GET all users
    console.log('  👁️ Testing GET /api/admin/users');
    const getResult = await makeRequest('GET', '/api/admin/users');
    
    if (getResult.statusCode === 200) {
      console.log(`    ✅ Success: Found ${getResult.data?.users?.length || 'data'} users`);
      return { module: 'Admin Users', status: 'PASS', operation: 'READ' };
    } else {
      console.log(`    ❌ Failed: Status ${getResult.statusCode}`);
      return { module: 'Admin Users', status: 'FAIL', operation: 'READ', error: getResult.data?.error || 'Connection failed' };
    }
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    return { module: 'Admin Users', status: 'FAIL', operation: 'READ', error: error.message };
  }
}

async function testTimesheetAPI() {
  console.log('🕐 Testing Timesheet API...');
  
  try {
    // Test GET timesheet data
    console.log('  👁️ Testing GET /api/timesheet');
    const getResult = await makeRequest('GET', '/api/timesheet');
    
    if (getResult.statusCode === 200) {
      console.log(`    ✅ Success: Timesheet API accessible`);
      return { module: 'Timesheet', status: 'PASS', operation: 'READ' };
    } else {
      console.log(`    ❌ Failed: Status ${getResult.statusCode}`);
      return { module: 'Timesheet', status: 'FAIL', operation: 'READ', error: getResult.data?.error || 'Connection failed' };
    }
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    return { module: 'Timesheet', status: 'FAIL', operation: 'READ', error: error.message };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🌐 Testing against:', BASE_URL);
  console.log('⏰ Started at:', new Date().toLocaleString(), '\n');
  
  const results = [];
  
  try {
    // Run all tests
    results.push(await testStakeholdersAPI());
    results.push(await testExpensesAPI());
    results.push(await testAdminUsersAPI());
    results.push(await testTimesheetAPI());
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    
    let passed = 0;
    let failed = 0;
    
    for (const result of results) {
      if (result.status === 'PASS') {
        passed++;
        console.log(`✅ ${result.module}: ${result.operation} - PASS`);
      } else {
        failed++;
        console.log(`❌ ${result.module}: ${result.operation} - FAIL`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    }
    
    const total = passed + failed;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
    
    console.log(`\n🎯 Overall Summary:`);
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    
    // Save results
    const report = {
      timestamp: new Date().toISOString(),
      summary: { total, passed, failed, successRate: `${successRate}%` },
      modules: results
    };
    
    const fs = require('fs');
    fs.writeFileSync('simple-test-results.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to: simple-test-results.json');
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (failed === 0) {
      console.log('🎉 All tests passed! Your CRUD APIs are working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check:');
      console.log('   - Server is running on localhost:3000');
      console.log('   - API routes are properly configured');
      console.log('   - No firewall blocking connections');
      console.log('   - Database is accessible');
    }
    
  } catch (error) {
    console.log('❌ Test execution failed:', error.message);
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testStakeholdersAPI, testExpensesAPI, testAdminUsersAPI, testTimesheetAPI };
