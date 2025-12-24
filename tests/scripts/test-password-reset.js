#!/usr/bin/env node

/**
 * Password Reset API Testing Script
 * Tests the admin password reset endpoint
 */

const http = require('http');

// Configuration
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 5000;
const API_URL = `http://${API_HOST}:${API_PORT}`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function makeRequest(path, method, data) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        try {
          const response = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            response,
            duration
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            response: responseData,
            duration,
            error: 'Failed to parse response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: null,
        error: error.message,
        duration: Date.now() - startTime
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testPasswordReset() {
  console.log(`${colors.cyan}🔐 Password Reset Testing${colors.reset}`);
  console.log(`${colors.cyan}Server: ${API_URL}${colors.reset}\n`);

  // Test data
  const testUserId = 'test-user-id'; // Replace with actual user ID
  const newPassword = process.env.TEST_USER_NEW_PASSWORD || 'NewSecurePassword123!';
  
  if (!process.env.TEST_USER_NEW_PASSWORD) {
    console.warn('⚠️  TEST_USER_NEW_PASSWORD not set, using default');
  }

  console.log(`${colors.yellow}Note: Update TEST_USER_ID with an actual user ID from your database${colors.reset}\n`);

  // Test 1: Valid password reset
  console.log(`${colors.blue}Test 1: Valid Password Reset${colors.reset}`);
  console.log(`User ID: ${testUserId}`);
  console.log(`New Password: ${newPassword}\n`);

  const result1 = await makeRequest(
    `/api/prisma/users/${testUserId}/admin-reset-password`,
    'POST',
    { newPassword: newPassword }
  );

  if (result1.error) {
    console.log(`${colors.red}❌ ERROR: ${result1.error}${colors.reset}`);
  } else if (result1.status === 200) {
    console.log(`${colors.green}✓ Status: ${result1.status}${colors.reset}`);
    console.log(`${colors.green}✓ Message: ${result1.response.message}${colors.reset}`);
    if (result1.response.user) {
      console.log(`${colors.cyan}User: ${result1.response.user.name} (${result1.response.user.email})${colors.reset}`);
    }
  } else if (result1.status === 404) {
    console.log(`${colors.yellow}⚠ User not found (expected if using test ID)${colors.reset}`);
    console.log(`${colors.yellow}To test: Replace 'test-user-id' with an actual ID${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Status: ${result1.status}${colors.reset}`);
    console.log(`${colors.red}${result1.response.error || 'Unknown error'}${colors.reset}`);
  }

  console.log(`${colors.cyan}Duration: ${result1.duration}ms${colors.reset}\n`);

  // Test 2: Missing password
  console.log(`${colors.blue}Test 2: Missing Password (should fail)${colors.reset}`);
  
  const result2 = await makeRequest(
    `/api/prisma/users/${testUserId}/admin-reset-password`,
    'POST',
    {}
  );

  if (result2.status === 400) {
    console.log(`${colors.green}✓ Correctly rejected${colors.reset}`);
    console.log(`${colors.cyan}Error: ${result2.response.error}${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Should have returned 400, got ${result2.status}${colors.reset}`);
  }

  console.log();

  // Instructions
  console.log(`${colors.cyan}═══════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}How to Test Properly${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.yellow}Step 1: Get a real user ID${colors.reset}`);
  console.log(`Database query:`);
  console.log(`  SELECT id, name, email FROM users LIMIT 5;\n`);

  console.log(`${colors.yellow}Step 2: Update the test script${colors.reset}`);
  console.log(`Edit this file and replace 'test-user-id' with actual user ID\n`);

  console.log(`${colors.yellow}Step 3: Run the script${colors.reset}`);
  console.log(`  node scripts/test-password-reset.js\n`);

  console.log(`${colors.yellow}Step 4: Verify the password was changed${colors.reset}`);
  console.log(`Login with the user and new password:\n`);

  console.log(`  curl -X POST http://localhost:5000/auth/login \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{`);
  console.log(`      "email": "user-email@example.com",`);
  console.log(`      "password": "${newPassword}"`);
  console.log(`    }'\n`);

  console.log(`${colors.cyan}Manual Testing in UI${colors.reset}`);
  console.log(`1. Navigate to Project Manager Users page`);
  console.log(`2. Find a user and click the key icon (Reset Password)`);
  console.log(`3. Enter new password and confirm`);
  console.log(`4. Click "Set Password"`);
  console.log(`5. Copy the displayed password`);
  console.log(`6. Login with the copied password\n`);
}

// Run tests
testPasswordReset().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
