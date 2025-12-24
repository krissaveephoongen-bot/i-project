#!/usr/bin/env node

/**
 * Test Login with Real Database Users
 * Connects to database and tests authentication with actual users
 */

const { PrismaClient } = require('@prisma/client');
const http = require('http');
const bcryptjs = require('bcryptjs');

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Configuration
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 5000;
const API_URL = `http://${API_HOST}:${API_PORT}`;

const prisma = new PrismaClient();

async function getAllUsers() {
  try {
    console.log(`${colors.cyan}🔍 Fetching users from database...${colors.reset}\n`);
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      },
      take: 20
    });

    return users;
  } catch (error) {
    console.error(`${colors.red}❌ Error fetching users: ${error.message}${colors.reset}`);
    return [];
  }
}

function displayUsers(users) {
  if (users.length === 0) {
    console.log(`${colors.yellow}⚠ No users found in database${colors.reset}\n`);
    return;
  }

  console.log(`${colors.cyan}${colors.bold}Available Users (${users.length}):${colors.reset}\n`);
  console.log(`${colors.cyan}Index  │ Name                    │ Email                      │ Role      │ Status${colors.reset}`);
  console.log(`${colors.cyan}───────┼─────────────────────────┼────────────────────────────┼───────────┼────────${colors.reset}`);
  
  users.forEach((user, index) => {
    const name = user.name.padEnd(23);
    const email = user.email.padEnd(26);
    const role = user.role.padEnd(9);
    const status = user.status;
    
    const statusColor = status === 'active' ? colors.green : colors.yellow;
    console.log(`  ${index}    │ ${name} │ ${email} │ ${role} │ ${statusColor}${status}${colors.reset}`);
  });
  
  console.log(`\n`);
}

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
            duration,
            success: res.statusCode === 200
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            response: responseData,
            duration,
            success: false,
            parseError: true
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: null,
        error: error.message,
        duration: Date.now() - startTime,
        success: false
      });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testLogin(user, password) {
  console.log(`${colors.blue}Testing Login:${colors.reset}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  User: ${user.name} (${user.role})`);
  console.log(`  Status: ${user.status}`);
  console.log();

  const result = await makeRequest('/auth/login', 'POST', {
    email: user.email,
    password: password
  });

  if (result.error) {
    console.log(`${colors.red}❌ ERROR: ${result.error}${colors.reset}`);
    return false;
  }

  if (result.status === 200 && result.success) {
    console.log(`${colors.green}✓ Login Successful${colors.reset}`);
    console.log(`  Status Code: ${result.status}`);
    console.log(`  Duration: ${result.duration}ms`);
    
    if (result.response.token) {
      console.log(`  Token: ${result.response.token.substring(0, 50)}...`);
    }
    
    if (result.response.user) {
      console.log(`  User: ${result.response.user.name} (${result.response.user.role})`);
    }
    
    return true;
  } else {
    console.log(`${colors.red}❌ Login Failed${colors.reset}`);
    console.log(`  Status Code: ${result.status}`);
    console.log(`  Message: ${result.response.message || 'Unknown error'}`);
    return false;
  }
}

async function interactiveTest(users) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log(`${colors.yellow}Enter user index to test (0-${users.length - 1}), or 'q' to quit:${colors.reset}`);
    
    rl.question(`${colors.cyan}> ${colors.reset}`, async (answer) => {
      if (answer.toLowerCase() === 'q') {
        rl.close();
        resolve(false);
        return;
      }

      const index = parseInt(answer);
      if (isNaN(index) || index < 0 || index >= users.length) {
        console.log(`${colors.red}Invalid index${colors.reset}\n`);
        rl.close();
        resolve(false);
        return;
      }

      const selectedUser = users[index];
      console.log();

      rl.question(`${colors.cyan}Enter password to test (or leave blank to skip): ${colors.reset}`, async (password) => {
        console.log();
        
        if (password) {
          await testLogin(selectedUser, password);
        } else {
          console.log(`${colors.yellow}Skipped${colors.reset}\n`);
        }
        
        rl.close();
        resolve(true);
      });
    });
  });
}

async function autoTest(users) {
  console.log(`${colors.yellow}Auto-testing with default credentials...${colors.reset}\n`);
  
  const testPassword = process.env.TEST_USER_PASSWORD;
if (!testPassword) {
  throw new Error('TEST_USER_PASSWORD environment variable is required');
}
  let successCount = 0;
  let failCount = 0;

  for (const user of users.slice(0, 3)) { // Test first 3 users
    console.log(`${colors.blue}─────────────────────────────────────${colors.reset}`);
    const success = await testLogin(user, testPassword);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log();
  }

  console.log(`${colors.cyan}═══════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Successful: ${successCount}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════${colors.reset}\n`);
}

async function main() {
  console.log(`${colors.bold}${colors.cyan}🔐 Real Database User Login Testing${colors.reset}\n`);
  console.log(`${colors.cyan}Server: ${API_URL}${colors.reset}\n`);

  // Get users
  const users = await getAllUsers();

  if (users.length === 0) {
    console.log(`${colors.red}No users found in database${colors.reset}`);
    console.log(`${colors.yellow}Please create a test user first:${colors.reset}\n`);
    console.log(`Run in database:${colors.reset}`);
    console.log(`SQL:${colors.reset}`);
    console.log(`  INSERT INTO users (name, email, password, role, status)`);
    console.log(`  VALUES ('Test User', 'test@example.com', '[HASHED_PASSWORD]', 'user', 'active');\n`);
    
    await prisma.$disconnect();
    process.exit(1);
  }

  // Display users
  displayUsers(users);

  // Show menu
  console.log(`${colors.cyan}${colors.bold}Options:${colors.reset}`);
  console.log(`  1. Interactive mode (choose user and test)`);
  console.log(`  2. Auto test (test first 3 users with default password)`);
  console.log(`  3. Exit\n`);

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`${colors.cyan}Choose option (1-3): ${colors.reset}`, async (answer) => {
    console.log();
    
    if (answer === '1') {
      rl.close();
      const continueTest = await interactiveTest(users);
    } else if (answer === '2') {
      rl.close();
      await autoTest(users);
    } else {
      console.log(`${colors.yellow}Exiting...${colors.reset}`);
      rl.close();
    }

    await prisma.$disconnect();
    process.exit(0);
  });
}

// Run
main().catch(async (error) => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  await prisma.$disconnect();
  process.exit(1);
});
