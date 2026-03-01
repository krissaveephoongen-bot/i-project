#!/usr/bin/env node

/**
 * 🔐 API-only CRUD Testing Script
 * Tests all CRUD operations via API endpoints
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:3000/api';

// Test data
const TEST_DATA = {
  user: {
    name: 'API Test User',
    email: 'apitest@example.com',
    password: 'testpass123',
    role: 'employee',
    department: 'Testing',
    position: 'API Tester'
  },
  stakeholder: {
    name: 'API Stakeholder Test',
    email: 'stakeholder@api.com',
    role: 'Project Sponsor',
    organization: 'API Test Corp',
    phone: '+66-2-123-4567'
  },
  expense: {
    project_id: '1',
    date: '2024-02-15',
    amount: 1500,
    category: 'travel',
    description: 'API test expense',
    receiptUrl: ''
  }
};

class APITester {
  constructor() {
    this.results = [];
    this.authToken = null;
  }

  async makeRequest(method, endpoint, data = null, includeAuth = true) {
    return new Promise((resolve, reject) => {
      const url = `${API_BASE}${endpoint}`;
      const postData = data ? JSON.stringify(data) : null;

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'API-Tester/1.0'
        }
      };

      if (includeAuth && this.authToken) {
        options.headers['Authorization'] = `Bearer ${this.authToken}`;
      }

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
              data: data,
              headers: res.headers
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              data: { error: 'Invalid JSON response' },
              headers: res.headers
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

  async testStakeholdersAPI() {
    console.log('👥 Testing Stakeholders API CRUD...');
    const results = { module: 'Stakeholders API', tests: [] };

    try {
      // Test CREATE
      console.log('  ➕ Testing POST /api/stakeholders');
      const createResult = await this.makeRequest('POST', '/stakeholders', TEST_DATA.stakeholder, false);
      
      if (createResult.statusCode === 201) {
        console.log('    ✅ Stakeholder created successfully');
        results.tests.push({
          operation: 'CREATE',
          status: 'PASS',
          statusCode: createResult.statusCode,
          data: createResult.data
        });

        const stakeholderId = createResult.data.id;

        // Test READ
        console.log('  👁️ Testing GET /api/stakeholders');
        const readResult = await this.makeRequest('GET', '/stakeholders', null, false);
        
        if (readResult.statusCode === 200 && Array.isArray(readResult.data)) {
          console.log(`    ✅ Found ${readResult.data.length} stakeholders`);
          results.tests.push({
            operation: 'READ',
            status: 'PASS',
            statusCode: readResult.statusCode,
            count: readResult.data.length
          });
        } else {
          console.log('    ❌ Failed to read stakeholders');
          results.tests.push({
            operation: 'READ',
            status: 'FAIL',
            statusCode: readResult.statusCode,
            error: readResult.data.error || 'Unknown error'
          });
        }

        // Test UPDATE
        console.log('  ✏️ Testing PUT /api/stakeholders');
        const updateData = { ...TEST_DATA.stakeholder, name: 'Updated API Stakeholder' };
        const updateResult = await this.makeRequest('PUT', `/stakeholders?id=${stakeholderId}`, updateData, false);
        
        if (updateResult.statusCode === 200) {
          console.log('    ✅ Stakeholder updated successfully');
          results.tests.push({
            operation: 'UPDATE',
            status: 'PASS',
            statusCode: updateResult.statusCode,
            data: updateResult.data
          });
        } else {
          console.log('    ❌ Failed to update stakeholder');
          results.tests.push({
            operation: 'UPDATE',
            status: 'FAIL',
            statusCode: updateResult.statusCode,
            error: updateResult.data.error || 'Unknown error'
          });
        }

        // Test DELETE
        console.log('  🗑️ Testing DELETE /api/stakeholders');
        const deleteResult = await this.makeRequest('DELETE', `/stakeholders?id=${stakeholderId}`, null, false);
        
        if (deleteResult.statusCode === 200) {
          console.log('    ✅ Stakeholder deleted successfully');
          results.tests.push({
            operation: 'DELETE',
            status: 'PASS',
            statusCode: deleteResult.statusCode,
            data: deleteResult.data
          });
        } else {
          console.log('    ❌ Failed to delete stakeholder');
          results.tests.push({
            operation: 'DELETE',
            status: 'FAIL',
            statusCode: deleteResult.statusCode,
            error: deleteResult.data.error || 'Unknown error'
          });
        }

      } else {
        console.log('    ❌ Failed to create stakeholder');
        results.tests.push({
          operation: 'CREATE',
          status: 'FAIL',
          statusCode: createResult.statusCode,
          error: createResult.data.error || 'Unknown error'
        });
      }

    } catch (error) {
      console.log('    ❌ Stakeholders API test error:', error.message);
      results.tests.push({
        operation: 'API_ERROR',
        status: 'FAIL',
        error: error.message
      });
    }

    this.results.push(results);
    return results;
  }

  async testExpensesAPI() {
    console.log('💰 Testing Expenses API CRUD...');
    const results = { module: 'Expenses API', tests: [] };

    try {
      // Test CREATE
      console.log('  ➕ Testing POST /api/expenses');
      const createResult = await this.makeRequest('POST', '/expenses', TEST_DATA.expense, false);
      
      if (createResult.statusCode === 201 || createResult.statusCode === 200) {
        console.log('    ✅ Expense created successfully');
        results.tests.push({
          operation: 'CREATE',
          status: 'PASS',
          statusCode: createResult.statusCode,
          data: createResult.data
        });

        // Test READ
        console.log('  👁️ Testing GET /api/expenses');
        const readResult = await this.makeRequest('GET', '/expenses', null, false);
        
        if (readResult.statusCode === 200 && Array.isArray(readResult.data)) {
          console.log(`    ✅ Found ${readResult.data.length} expenses`);
          results.tests.push({
            operation: 'READ',
            status: 'PASS',
            statusCode: readResult.statusCode,
            count: readResult.data.length
          });
        } else {
          console.log('    ❌ Failed to read expenses');
          results.tests.push({
            operation: 'READ',
            status: 'FAIL',
            statusCode: readResult.statusCode,
            error: readResult.data.error || 'Unknown error'
          });
        }

      } else {
        console.log('    ❌ Failed to create expense');
        results.tests.push({
          operation: 'CREATE',
          status: 'FAIL',
          statusCode: createResult.statusCode,
          error: createResult.data.error || 'Unknown error'
        });
      }

    } catch (error) {
      console.log('    ❌ Expenses API test error:', error.message);
      results.tests.push({
        operation: 'API_ERROR',
        status: 'FAIL',
        error: error.message
      });
    }

    this.results.push(results);
    return results;
  }

  async testAdminUsersAPI() {
    console.log('👥 Testing Admin Users API CRUD...');
    const results = { module: 'Admin Users API', tests: [] };

    try {
      // Test CREATE
      console.log('  ➕ Testing POST /api/admin/users');
      const createResult = await this.makeRequest('POST', '/admin/users', TEST_DATA.user, false);
      
      if (createResult.statusCode === 201 || createResult.statusCode === 200) {
        console.log('    ✅ User created successfully');
        results.tests.push({
          operation: 'CREATE',
          status: 'PASS',
          statusCode: createResult.statusCode,
          data: createResult.data
        });

        const userId = createResult.data.id || createResult.data.user?.id;

        if (userId) {
          // Test READ
          console.log('  👁️ Testing GET /api/admin/users');
          const readResult = await this.makeRequest('GET', '/admin/users', null, false);
          
          if (readResult.statusCode === 200 && readResult.data.users) {
            console.log(`    ✅ Found ${readResult.data.users.length} users`);
            results.tests.push({
              operation: 'READ',
              status: 'PASS',
              statusCode: readResult.statusCode,
              count: readResult.data.users.length
            });
          } else {
            console.log('    ❌ Failed to read users');
            results.tests.push({
              operation: 'READ',
              status: 'FAIL',
              statusCode: readResult.statusCode,
              error: readResult.data.error || 'Unknown error'
            });
          }

          // Test UPDATE
          console.log('  ✏️ Testing PATCH /api/admin/users');
          const updateData = { ...TEST_DATA.user, name: 'Updated API User' };
          const updateResult = await this.makeRequest('PATCH', `/admin/users/${userId}`, updateData, false);
          
          if (updateResult.statusCode === 200) {
            console.log('    ✅ User updated successfully');
            results.tests.push({
              operation: 'UPDATE',
              status: 'PASS',
              statusCode: updateResult.statusCode,
              data: updateResult.data
            });
          } else {
            console.log('    ❌ Failed to update user');
            results.tests.push({
              operation: 'UPDATE',
              status: 'FAIL',
              statusCode: updateResult.statusCode,
              error: updateResult.data.error || 'Unknown error'
            });
          }

          // Test DELETE
          console.log('  🗑️ Testing DELETE /api/admin/users');
          const deleteResult = await this.makeRequest('DELETE', `/admin/users/${userId}`, null, false);
          
          if (deleteResult.statusCode === 200) {
            console.log('    ✅ User deleted successfully');
            results.tests.push({
              operation: 'DELETE',
              status: 'PASS',
              statusCode: deleteResult.statusCode,
              data: deleteResult.data
            });
          } else {
            console.log('    ❌ Failed to delete user');
            results.tests.push({
              operation: 'DELETE',
              status: 'FAIL',
              statusCode: deleteResult.statusCode,
              error: deleteResult.data.error || 'Unknown error'
            });
          }
        }

      } else {
        console.log('    ❌ Failed to create user');
        results.tests.push({
          operation: 'CREATE',
          status: 'FAIL',
          statusCode: createResult.statusCode,
          error: createResult.data.error || 'Unknown error'
        });
      }

    } catch (error) {
      console.log('    ❌ Admin Users API test error:', error.message);
      results.tests.push({
        operation: 'API_ERROR',
        status: 'FAIL',
        error: error.message
      });
    }

    this.results.push(results);
    return results;
  }

  generateReport() {
    console.log('\n📊 API Test Results Summary:');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    for (const moduleResult of this.results) {
      console.log(`\n📋 ${moduleResult.module}:`);
      
      for (const test of moduleResult.tests) {
        totalTests++;
        
        if (test.status === 'PASS') {
          passedTests++;
          console.log(`  ✅ ${test.operation}: PASS (${test.statusCode})`);
        } else {
          failedTests++;
          console.log(`  ❌ ${test.operation}: FAIL (${test.statusCode})`);
          if (test.error) {
            console.log(`     Error: ${test.error}`);
          }
        }
      }
    }

    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

    console.log('\n🎯 Overall Summary:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${successRate}%`);

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: `${successRate}%`
      },
      modules: this.results
    };

    const fs = require('fs');
    fs.writeFileSync('api-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: api-test-report.json');

    return report;
  }

  async runAllTests() {
    console.log('🚀 Starting API CRUD Tests...\n');
    console.log('🌐 Testing against:', BASE_URL);
    console.log('⏰ Started at:', new Date().toLocaleString(), '\n');

    try {
      // Test all API endpoints
      await this.testStakeholdersAPI();
      await this.testExpensesAPI();
      await this.testAdminUsersAPI();

      // Generate final report
      this.generateReport();

    } catch (error) {
      console.log('❌ Test execution failed:', error.message);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;
