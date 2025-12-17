/**
 * Test Authentication & Database Connection
 * Verifies the auth system is properly configured
 * Usage: npm run db:test or npx tsx scripts/test-auth-connection.ts
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';
const TEST_PIN = process.env.ADMIN_PIN || '123456';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Test 1: Database Connectivity
 */
async function testDatabaseConnection() {
  console.log('\n📝 Test 1: Database Connectivity');
  try {
    // This would require a health check endpoint
    // For now, we'll test via auth endpoints
    results.push({
      name: 'Database Connection',
      status: 'SKIP',
      error: 'Requires health check endpoint'
    });
  } catch (error: any) {
    results.push({
      name: 'Database Connection',
      status: 'FAIL',
      error: error.message
    });
  }
}

/**
 * Test 2: Login with Valid Credentials
 */
async function testLoginValid() {
  console.log('\n📝 Test 2: Login with Valid Credentials');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (response.status === 200 && response.data.token) {
      console.log('✅ Valid login successful');
      console.log('   Token:', response.data.token.substring(0, 20) + '...');
      console.log('   User:', response.data.user);

      results.push({
        name: 'Login with valid credentials',
        status: 'PASS',
        data: {
          token: response.data.token,
          user: response.data.user
        }
      });

      return response.data.token;
    } else {
      throw new Error('Unexpected response');
    }
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
    results.push({
      name: 'Login with valid credentials',
      status: 'FAIL',
      error: error.response?.data?.message || error.message
    });
    return null;
  }
}

/**
 * Test 3: Login with Invalid Credentials
 */
async function testLoginInvalid() {
  console.log('\n📝 Test 3: Login with Invalid Credentials');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: 'wrongpassword'
    });

    // Should not reach here
    results.push({
      name: 'Login with invalid credentials',
      status: 'FAIL',
      error: 'Should have rejected invalid password'
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid password');
      results.push({
        name: 'Login with invalid credentials',
        status: 'PASS'
      });
    } else {
      results.push({
        name: 'Login with invalid credentials',
        status: 'FAIL',
        error: error.message
      });
    }
  }
}

/**
 * Test 4: Verify Token
 */
async function testVerifyToken(token: string | null) {
  console.log('\n📝 Test 4: Verify Token');
  if (!token) {
    results.push({
      name: 'Verify token',
      status: 'SKIP',
      error: 'No valid token from login test'
    });
    return;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/verify`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.status === 200 && response.data.user) {
      console.log('✅ Token verification successful');
      console.log('   User:', response.data.user);

      results.push({
        name: 'Verify token',
        status: 'PASS',
        data: response.data.user
      });
    }
  } catch (error: any) {
    console.error('❌ Token verification failed:', error.message);
    results.push({
      name: 'Verify token',
      status: 'FAIL',
      error: error.response?.data?.message || error.message
    });
  }
}

/**
 * Test 5: Get User Profile
 */
async function testGetProfile(token: string | null) {
  console.log('\n📝 Test 5: Get User Profile');
  if (!token) {
    results.push({
      name: 'Get user profile',
      status: 'SKIP',
      error: 'No valid token'
    });
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 200 && response.data.data) {
      console.log('✅ Profile retrieved successfully');
      console.log('   Profile:', response.data.data);

      results.push({
        name: 'Get user profile',
        status: 'PASS',
        data: response.data.data
      });
    }
  } catch (error: any) {
    console.error('❌ Profile retrieval failed:', error.message);
    results.push({
      name: 'Get user profile',
      status: 'FAIL',
      error: error.response?.data?.message || error.message
    });
  }
}

/**
 * Test 6: PIN Verification
 */
async function testPinVerification() {
  console.log('\n📝 Test 6: PIN Verification (Admin)');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/pin-verify`, {
      pin: TEST_PIN
    });

    if (response.status === 200 && response.data.token) {
      console.log('✅ PIN verification successful');
      console.log('   Token:', response.data.token.substring(0, 20) + '...');
      console.log('   User:', response.data.user);

      results.push({
        name: 'PIN verification',
        status: 'PASS',
        data: {
          token: response.data.token,
          user: response.data.user
        }
      });
    }
  } catch (error: any) {
    console.error('❌ PIN verification failed:', error.message);
    results.push({
      name: 'PIN verification',
      status: 'FAIL',
      error: error.response?.data?.message || error.message
    });
  }
}

/**
 * Test 7: Missing Token
 */
async function testMissingToken() {
  console.log('\n📝 Test 7: Missing Token (Should Reject)');
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`);

    results.push({
      name: 'Missing token rejection',
      status: 'FAIL',
      error: 'Should have rejected request without token'
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected missing token');
      results.push({
        name: 'Missing token rejection',
        status: 'PASS'
      });
    } else {
      results.push({
        name: 'Missing token rejection',
        status: 'FAIL',
        error: error.message
      });
    }
  }
}

/**
 * Test 8: Invalid Token Format
 */
async function testInvalidTokenFormat() {
  console.log('\n📝 Test 8: Invalid Token Format');
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: 'Bearer invalid.token.format'
      }
    });

    results.push({
      name: 'Invalid token format rejection',
      status: 'FAIL',
      error: 'Should have rejected invalid token'
    });
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly rejected invalid token');
      results.push({
        name: 'Invalid token format rejection',
        status: 'PASS'
      });
    } else {
      results.push({
        name: 'Invalid token format rejection',
        status: 'FAIL',
        error: error.message
      });
    }
  }
}

/**
 * Print Results Summary
 */
function printSummary() {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const skipCount = results.filter(r => r.status === 'SKIP').length;

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${icon} ${index + 1}. ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`📈 Summary: ${passCount} passed, ${failCount} failed, ${skipCount} skipped`);
  console.log('='.repeat(60) + '\n');

  // Exit with appropriate code
  process.exit(failCount > 0 ? 1 : 0);
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Authentication & Connection Tests');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  try {
    await testDatabaseConnection();
    const token = await testLoginValid();
    await testLoginInvalid();
    await testVerifyToken(token);
    await testGetProfile(token);
    await testPinVerification();
    await testMissingToken();
    await testInvalidTokenFormat();

    printSummary();
  } catch (error: any) {
    console.error('\n❌ Unexpected error during tests:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
