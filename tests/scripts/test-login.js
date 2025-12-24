#!/usr/bin/env node

/**
 * Login API Testing Script
 * Tests the authentication endpoint directly
 */

const http = require('http');

// Configuration
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 5000;
const API_URL = `http://${API_HOST}:${API_PORT}`;

// Test credentials - use environment variables for sensitive data
const getTestCredentials = () => {
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;
  
  if (!testEmail) {
    throw new Error('TEST_USER_EMAIL environment variable is required');
  }
  if (!testPassword) {
    throw new Error('TEST_USER_PASSWORD environment variable is required');
  }
  
  return [
    {
      name: 'Valid Login',
      credentials: {
        email: testEmail,
        password: testPassword
      },
      expectedStatus: 200,
      expectSuccess: true
    },
    {
      name: 'Invalid Email',
      credentials: {
        email: 'invalid-test-user@example.com',
        password: testPassword
      },
      expectedStatus: 401,
      expectSuccess: false
    },
    {
      name: 'Wrong Password',
      credentials: {
        email: testEmail,
        password: 'WrongPassword123'
      },
      expectedStatus: 401,
      expectSuccess: false
    },
    {
      name: 'Missing Email',
      credentials: {
        password: testPassword
      },
      expectedStatus: 400,
      expectSuccess: false
    },
    {
      name: 'Missing Password',
      credentials: {
        email: testEmail
      },
      expectedStatus: 400,
      expectSuccess: false
    }
  ];
};

const TEST_CASES = getTestCredentials();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function makeRequest(testCase) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(testCase.credentials);

    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const response = JSON.parse(data);
          resolve({
            testCase,
            status: res.statusCode,
            response,
            duration,
            passed: res.statusCode === testCase.expectedStatus && response.success === testCase.expectSuccess
          });
        } catch (error) {
          resolve({
            testCase,
            status: res.statusCode,
            response: data,
            duration,
            passed: false,
            error: 'Failed to parse response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        testCase,
        status: null,
        error: error.message,
        duration: Date.now() - startTime,
        passed: false
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log(`${colors.cyan}🔐 Login API Testing${colors.reset}`);
  console.log(`${colors.cyan}Server: ${API_URL}${colors.reset}\n`);

  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of TEST_CASES) {
    process.stdout.write(`Testing: ${testCase.name}... `);
    
    const result = await makeRequest(testCase);

    if (result.error) {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      console.log(`  ${colors.red}Error: ${result.error}${colors.reset}`);
      failedCount++;
    } else if (result.passed) {
      console.log(`${colors.green}✓ PASSED${colors.reset} (${result.duration}ms)`);
      
      if (result.response.token) {
        console.log(`  ${colors.cyan}Token: ${result.response.token.substring(0, 30)}...${colors.reset}`);
      }
      
      if (result.response.user) {
        console.log(`  ${colors.cyan}User: ${result.response.user.name} (${result.response.user.role})${colors.reset}`);
      }
      
      passedCount++;
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset}`);
      console.log(`  ${colors.red}Expected status: ${result.testCase.expectedStatus}, got: ${result.status}${colors.reset}`);
      console.log(`  ${colors.red}Message: ${result.response.message || 'Unknown error'}${colors.reset}`);
      failedCount++;
    }
    
    console.log();
  }

  // Summary
  console.log(`${colors.cyan}═══════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}Test Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Passed: ${passedCount}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedCount}${colors.reset}`);
  console.log(`Total: ${passedCount + failedCount}\n`);

  if (failedCount === 0) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some tests failed${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
