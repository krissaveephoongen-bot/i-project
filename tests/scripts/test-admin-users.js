#!/usr/bin/env node

/**
 * Admin User System - Integration Tests
 * Tests API endpoints and database operations
 * Usage: node scripts/test-admin-users.js
 */

const http = require('http');
const AdminUserService = require('../server/admin-user-service');

const BASE_URL = 'http://localhost:3001/api/admin';
const userService = new AdminUserService();

// Test configuration
const tests = [];
let passed = 0;
let failed = 0;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test runner
async function test(name, fn) {
  tests.push({ name, fn });
}

// Run all tests
async function runTests() {
  console.log('\n🧪 Admin User System - Integration Tests\n');
  console.log('═'.repeat(60));

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }

  console.log('═'.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed');
    process.exit(1);
  }
}

// Define Tests

// Test 1: Health check
test('API is running', async () => {
  const response = await makeRequest('GET', '/users/init');
  if (response.status !== 200 && response.status !== 500) {
    throw new Error(`Expected status 200 or 500, got ${response.status}`);
  }
});

// Test 2: Initialize database
test('Database initialization', async () => {
  try {
    const result = await userService.initializeTable();
    if (!result.success) {
      throw new Error('Initialization failed');
    }
  } catch (error) {
    // Table might already exist, which is OK
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
});

// Test 3: Create a test user
let testUserId;
test('Create admin user', async () => {
  // Use test password from environment variable
  const testPassword = process.env.TEST_PASSWORD;
  if (!testPassword) {
    throw new Error('TEST_PASSWORD environment variable is required');
  }
  const response = await makeRequest('POST', '/users', {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: testPassword,
    department: 'Test',
    position: 'Test Position'
  });

  if (response.status !== 201 && response.status !== 200) {
    throw new Error(`Expected 201, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (response.data && response.data.data && response.data.data.id) {
    testUserId = response.data.data.id;
  }
});

// Test 4: Get all users
test('Get all users', async () => {
  const response = await makeRequest('GET', '/users');

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response not successful');
  }

  if (!Array.isArray(response.data.data)) {
    throw new Error('Data is not an array');
  }
});

// Test 5: Filter by role
test('Get users by role', async () => {
  const response = await makeRequest('GET', '/users?role=admin');

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response not successful');
  }
});

// Test 6: Search users
test('Search users by name', async () => {
  const response = await makeRequest('GET', '/users?search=test');

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response not successful');
  }
});

// Test 7: Get user by ID (if we have a test user)
test('Get user by ID', async () => {
  if (!testUserId) {
    throw new Error('No test user ID available');
  }

  const response = await makeRequest('GET', `/users/${testUserId}`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response not successful');
  }
});

// Test 8: Update user
test('Update user', async () => {
  if (!testUserId) {
    throw new Error('No test user ID available');
  }

  const response = await makeRequest('PUT', `/users/${testUserId}`, {
    name: 'Updated Test User',
    department: 'Updated Department'
  });

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response not successful');
  }
});

// Test 9: Change user role
test('Change user role', async () => {
  if (!testUserId) {
    throw new Error('No test user ID available');
  }

  const response = await makeRequest('PATCH', `/users/${testUserId}/role`, {
    role: 'manager'
  });

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response not successful');
  }
});

// Test 10: Get statistics
test('Get user statistics', async () => {
  const response = await makeRequest('GET', '/stats');

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response not successful');
  }

  if (!response.data.data) {
    throw new Error('No statistics data returned');
  }
});

// Test 11: Bulk create users
test('Bulk create users', async () => {
  const response = await makeRequest('POST', '/users/bulk', {
    users: [
      {
        email: `bulk-test-${Date.now()}@example.com`,
        name: 'Bulk User 1',
        password: 'pass123',
        department: 'Test'
      },
      {
        email: `bulk-test-${Date.now() + 1}@example.com`,
        name: 'Bulk User 2',
        password: 'pass123',
        department: 'Test'
      }
    ]
  });

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response not successful');
  }
});

// Test 12: Delete user
test('Delete user', async () => {
  if (!testUserId) {
    throw new Error('No test user ID available');
  }

  const response = await makeRequest('DELETE', `/users/${testUserId}`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Response not successful');
  }
});

// Main execution
console.log('🚀 Starting tests...\n');
console.log('Waiting for server to be ready...\n');

// Wait for server to be ready
setTimeout(runTests, 2000);
