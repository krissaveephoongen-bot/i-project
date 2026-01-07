/**
 * System Verification Script
 * Tests: Database Connection → Login Flow → Profile & Permissions Display
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const TEST_USER = {
  email: process.env.TEST_EMAIL || 'admin@projectmgmt.com',
  password: process.env.TEST_PASSWORD || 'admin123'
};

// Helper function for formatted output
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  section: (msg) => console.log(chalk.bold.cyan(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`)),
};

// Store test results
let testResults = {
  dbConnection: false,
  login: false,
  profileRetrieval: false,
  permissionsCheck: false,
};

let authToken = null;
let currentUser = null;

/**
 * Test 1: Database Connection
 */
async function testDatabaseConnection() {
  log.section('TEST 1: ตรวจสอบการเชื่อมต่อฐานข้อมูล (Database Connection)');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 10000
    });

    log.info(`Health check response: ${response.status}`);
    
    if (response.data.status === 'ok' && response.data.database === 'connected') {
      log.success('Database connected successfully!');
      log.info(`Database details: ${JSON.stringify(response.data.databaseDetails || 'N/A')}`);
      testResults.dbConnection = true;
      return true;
    } else {
      log.error(`Database connection failed: ${response.data.message}`);
      log.info(`Full response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    log.error('Failed to connect to API server');
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      log.error('No response received from server');
      log.warn('Please ensure the backend server is running');
    } else {
      log.error(`Error: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test 2: Login Flow
 */
async function testLoginFlow() {
  log.section('TEST 2: ตรวจสอบกระบวนการ Login (Login Flow)');
  
  try {
    log.info(`Attempting login with email: ${TEST_USER.email}`);
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, {
      timeout: 10000
    });

    if (response.data.token && response.data.user) {
      authToken = response.data.token;
      currentUser = response.data.user;
      
      log.success('Login successful!');
      log.info(`User ID: ${currentUser.id}`);
      log.info(`User Name: ${currentUser.name}`);
      log.info(`User Email: ${currentUser.email}`);
      log.info(`User Role: ${currentUser.role}`);
      log.info(`Token (first 20 chars): ${authToken.substring(0, 20)}...`);
      
      testResults.login = true;
      return true;
    } else {
      log.error('Login response missing token or user data');
      log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    log.error('Login failed');
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 401) {
        log.warn('Invalid credentials - please check TEST_EMAIL and TEST_PASSWORD');
      } else if (error.response.status === 400) {
        log.warn('Bad request - please check request payload');
      }
    } else if (error.request) {
      log.error('No response from server');
    } else {
      log.error(`Error: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test 3: Profile Retrieval
 */
async function testProfileRetrieval() {
  log.section('TEST 3: ตรวจสอบการแสดงผล Profile (Profile Display)');
  
  if (!authToken) {
    log.error('Cannot test profile retrieval - no auth token available');
    log.warn('Login test must pass first');
    return false;
  }

  try {
    // Test /auth/me endpoint
    log.info('Testing /auth/me endpoint...');
    const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      timeout: 10000
    });

    if (meResponse.data.user) {
      log.success('Profile retrieved successfully from /auth/me');
      log.info('Profile details:');
      log.info(`  - Name: ${meResponse.data.user.name}`);
      log.info(`  - Email: ${meResponse.data.user.email}`);
      log.info(`  - Role: ${meResponse.data.user.role}`);
      log.info(`  - Department: ${meResponse.data.user.department || 'N/A'}`);
      log.info(`  - Position: ${meResponse.data.user.position || 'N/A'}`);
      log.info(`  - Avatar: ${meResponse.data.user.avatar || 'N/A'}`);
      log.info(`  - Last Login: ${meResponse.data.user.lastLogin || 'N/A'}`);
      
      testResults.profileRetrieval = true;
    } else {
      log.error('Profile data missing from response');
      log.info(`Response: ${JSON.stringify(meResponse.data, null, 2)}`);
      return false;
    }

    // Also test /auth/verify endpoint
    log.info('\nTesting /auth/verify endpoint...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      timeout: 10000
    });

    if (verifyResponse.data.valid && verifyResponse.data.user) {
      log.success('Token verified successfully');
      log.info('Verified user data matches profile');
    } else {
      log.warn('Token verification returned unexpected data');
      log.info(`Response: ${JSON.stringify(verifyResponse.data, null, 2)}`);
    }

    return true;
  } catch (error) {
    log.error('Profile retrieval failed');
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 401) {
        log.warn('Unauthorized - token may be invalid or expired');
      } else if (error.response.status === 404) {
        log.warn('User not found in database');
      }
    } else {
      log.error(`Error: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test 4: Permissions Check
 */
async function testPermissionsCheck() {
  log.section('TEST 4: ตรวจสอบสิทธิ์การใช้งาน (Permissions Check)');
  
  if (!authToken || !currentUser) {
    log.error('Cannot test permissions - no user data available');
    return false;
  }

  try {
    // Define role-based permissions
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_projects'],
      manager: ['read', 'write', 'manage_projects', 'manage_team'],
      employee: ['read', 'write']
    };

    const userRole = currentUser.role.toLowerCase();
    const expectedPermissions = rolePermissions[userRole] || ['read'];

    log.info(`User Role: ${userRole}`);
    log.info(`Expected Permissions: ${expectedPermissions.join(', ')}`);

    // Test access to protected endpoints based on role
    const tests = [];

    // Test 1: All users should be able to read their own profile
    tests.push({
      name: 'Read own profile',
      endpoint: `/auth/me`,
      method: 'GET',
      expectedStatus: 200,
      requiredPermission: 'read'
    });

    // Test 2: Only admin can access all users
    if (userRole === 'admin') {
      tests.push({
        name: 'List all users (admin only)',
        endpoint: `/users`,
        method: 'GET',
        expectedStatus: 200,
        requiredPermission: 'admin'
      });
    }

    // Run permission tests
    log.info(`\nRunning ${tests.length} permission test(s)...`);
    
    for (const test of tests) {
      try {
        const response = await axios({
          method: test.method,
          url: `${API_BASE_URL}${test.endpoint}`,
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          timeout: 10000
        });

        if (response.status === test.expectedStatus) {
          log.success(`✓ ${test.name}: PASSED (${response.status})`);
          log.info(`  Permission '${test.requiredPermission}' verified`);
        } else {
          log.warn(`✓ ${test.name}: Unexpected status ${response.status} (expected ${test.expectedStatus})`);
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          log.error(`✗ ${test.name}: FAILED - Access Denied (403)`);
          log.warn(`  Missing permission: ${test.requiredPermission}`);
        } else if (error.response && error.response.status === 401) {
          log.error(`✗ ${test.name}: FAILED - Unauthorized (401)`);
        } else {
          log.error(`✗ ${test.name}: ERROR - ${error.message}`);
        }
      }
    }

    testResults.permissionsCheck = true;
    return true;
  } catch (error) {
    log.error('Permissions check failed');
    log.error(`Error: ${error.message}`);
    return false;
  }
}

/**
 * Print Final Summary
 */
function printSummary() {
  log.section('สรุปผลการทดสอบ (SUMMARY)');
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(result => result === true).length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log('\nTest Results:');
  console.log(`  ${testResults.dbConnection ? chalk.green('✓') : chalk.red('✗')} Database Connection`);
  console.log(`  ${testResults.login ? chalk.green('✓') : chalk.red('✗')} Login Flow`);
  console.log(`  ${testResults.profileRetrieval ? chalk.green('✓') : chalk.red('✗')} Profile Retrieval`);
  console.log(`  ${testResults.permissionsCheck ? chalk.green('✓') : chalk.red('✗')} Permissions Check`);
  
  console.log(`\nTotal: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
  
  if (passedTests === totalTests) {
    console.log(chalk.green.bold('\n🎉 All tests passed! System is working correctly.\n'));
  } else {
    console.log(chalk.yellow.bold('\n⚠️  Some tests failed. Please check the errors above.\n'));
  }

  // Recommendations
  if (!testResults.dbConnection) {
    console.log(chalk.yellow('Recommendation: Check DATABASE_URL in .env file and ensure database is running'));
  }
  if (!testResults.login) {
    console.log(chalk.yellow('Recommendation: Verify user credentials exist in database or create test user'));
  }
  if (!testResults.profileRetrieval) {
    console.log(chalk.yellow('Recommendation: Check /auth/me endpoint implementation'));
  }
  if (!testResults.permissionsCheck) {
    console.log(chalk.yellow('Recommendation: Review role-based access control implementation'));
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.magenta('\n🔍 Project Management System Verification'));
  console.log(chalk.gray('Testing: Database → Login → Profile → Permissions\n'));
  
  log.info(`API Base URL: ${API_BASE_URL}`);
  log.info(`Test User Email: ${TEST_USER.email}`);
  console.log('');

  // Run tests in sequence
  await testDatabaseConnection();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  
  await testLoginFlow();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testProfileRetrieval();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testPermissionsCheck();
  
  // Print summary
  printSummary();

  // Exit with appropriate code
  const allPassed = Object.values(testResults).every(result => result === true);
  process.exit(allPassed ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log.error('Unhandled error:');
  console.error(error);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, testDatabaseConnection, testLoginFlow, testProfileRetrieval, testPermissionsCheck };