/**
 * API Test Script for Local Backend
 * Tests all available API endpoints including authentication
 */

import fetch from 'node-fetch';

// Configuration - Testing local backend
const API_BASE_URL = 'https://ticket-apw-api.vercel.app/api';
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let authToken = null;
let testUser = null;

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null, useAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      data,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      ok: false
    };
  }
}

// Print test result
function printResult(testName, passed, message = '') {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${status} ${colors.cyan}${testName}${colors.reset} ${message ? `- ${message}` : ''}`);
}

// Test suite
async function runTests() {
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}  Local Backend API Test Suite${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}\n`);

  // 1. Health Check
  console.log(`${colors.yellow}--- Public Endpoints ---${colors.reset}`);
  
  const healthResult = await apiRequest('/health', 'GET', null, false);
  printResult('Health Check', healthResult.status === 200, healthResult.status === 200 ? `Database: ${healthResult.data?.database || 'unknown'}` : `Status: ${healthResult.status}`);

  // 2. Root Endpoint
  const rootResult = await apiRequest('/', 'GET', null, false);
  printResult('Root Endpoint', rootResult.ok, rootResult.ok ? 'API info returned' : `Error: ${rootResult.data?.error}`);

  // 3. Authentication Tests
  console.log(`\n${colors.yellow}--- Authentication Tests ---${colors.reset}`);

  // Test Login
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    printResult('Login', false, 'Missing TEST_EMAIL/TEST_PASSWORD environment variables');
    console.log(`${colors.yellow}Note: Continuing with tests without authentication...${colors.reset}`);
  } else {
    const loginResult = await apiRequest('/auth/login', 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, false);

    if (loginResult.ok && loginResult.data.token) {
      authToken = loginResult.data.token;
      testUser = loginResult.data.user;
      printResult('Login', true, `Logged in as ${testUser?.name || testUser?.email} (${testUser?.role})`);
    } else {
      printResult('Login', false, `Error: ${loginResult.data?.error || 'Unknown error'}`);
      console.log(`${colors.yellow}Note: Continuing with tests without authentication...${colors.reset}`);
    }
  }

  // Test Verify Token
  if (authToken) {
    const verifyResult = await apiRequest('/auth/verify', 'GET', null, false);
    printResult('Verify Token', verifyResult.ok, verifyResult.ok ? 'Token is valid' : 'Token invalid');
  }

  // Test Get Current User
  if (authToken) {
    const meResult = await apiRequest('/auth/me', 'GET', null, false);
    printResult('Get Current User', meResult.ok, meResult.ok ? `User: ${meResult.data?.user?.name}` : 'Failed to get user');
  }

  // 4. User Endpoints
  console.log(`\n${colors.yellow}--- User Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const usersList = await apiRequest('/users', 'GET', null, true);
    printResult('Get Users List', usersList.ok, usersList.ok ? `Found ${Array.isArray(usersList.data) ? usersList.data.length : 0} users` : 'Failed');

    const usersMe = await apiRequest('/users/me', 'GET', null, true);
    printResult('Get My Profile', usersMe.ok, usersMe.ok ? `Profile: ${usersMe.data?.user?.name}` : 'Failed');
  }

  // 5. Project Endpoints
  console.log(`\n${colors.yellow}--- Project Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const projects = await apiRequest('/projects', 'GET', null, true);
    printResult('Get Projects', projects.ok, projects.ok ? `Found ${Array.isArray(projects.data) ? projects.data.length : 0} projects` : 'Failed');

    // Test project creation
    const newProject = await apiRequest('/projects', 'POST', {
      name: 'Test Project',
      description: 'Created by API test',
      status: 'planning',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }, true);
    printResult('Create Project', newProject.ok, newProject.ok ? `Project ID: ${newProject.data?.id}` : `Msg: ${newProject.data?.error || 'Failed'}`);
  }

  // 6. Task Endpoints
  console.log(`\n${colors.yellow}--- Task Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const tasks = await apiRequest('/tasks', 'GET', null, true);
    printResult('Get Tasks', tasks.ok, tasks.ok ? `Found ${Array.isArray(tasks.data) ? tasks.data.length : 0} tasks` : 'Failed');

    const newTask = await apiRequest('/tasks', 'POST', {
      title: 'Test Task',
      description: 'Created by API test',
      status: 'todo',
      priority: 'medium'
    }, true);
    printResult('Create Task', newTask.ok, newTask.ok ? `Task ID: ${newTask.data?.id}` : `Msg: ${newTask.data?.error || 'Failed'}`);
  }

  // 7. Customer Endpoints
  console.log(`\n${colors.yellow}--- Customer Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const customers = await apiRequest('/customers', 'GET', null, true);
    printResult('Get Customers', customers.ok, customers.ok ? `Found ${Array.isArray(customers.data) ? customers.data.length : 0} customers` : 'Failed');
  }

  // 8. Team Endpoints
  console.log(`\n${colors.yellow}--- Team Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const teams = await apiRequest('/teams', 'GET', null, true);
    printResult('Get Teams', teams.ok, teams.ok ? `Found ${Array.isArray(teams.data) ? teams.data.length : 0} teams` : 'Failed');
  }

  // 9. Analytics Endpoints
  console.log(`\n${colors.yellow}--- Analytics Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const analytics = await apiRequest('/analytics', 'GET', null, true);
    printResult('Get Analytics', analytics.ok, analytics.ok ? 'Analytics data retrieved' : `Msg: ${analytics.data?.error || 'Failed'}`);

    const dashboard = await apiRequest('/analytics/dashboard', 'GET', null, true);
    printResult('Get Dashboard Stats', dashboard.ok, dashboard.ok ? 'Dashboard data retrieved' : `Msg: ${dashboard.data?.error || 'Failed'}`);
  }

  // 10. Search Endpoints
  console.log(`\n${colors.yellow}--- Search Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const search = await apiRequest('/search?q=test', 'GET', null, true);
    printResult('Search', search.ok, search.ok ? 'Search working' : `Msg: ${search.data?.error || 'Failed'}`);
  }

  // 11. Reports Endpoints
  console.log(`\n${colors.yellow}--- Reports Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const reports = await apiRequest('/reports', 'GET', null, true);
    printResult('Get Reports', reports.ok, reports.ok ? `Found ${Array.isArray(reports.data) ? reports.data.length : 0} reports` : 'Failed');
  }

  // 12. Timesheets Endpoints
  console.log(`\n${colors.yellow}--- Timesheets Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const timesheets = await apiRequest('/timesheets', 'GET', null, true);
    printResult('Get Timesheets', timesheets.ok, timesheets.ok ? `Found ${Array.isArray(timesheets.data) ? timesheets.data.length : 0} timesheets` : 'Failed');
  }

  // 13. Expenses Endpoints
  console.log(`\n${colors.yellow}--- Expenses Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const expenses = await apiRequest('/expenses', 'GET', null, true);
    printResult('Get Expenses', expenses.ok, expenses.ok ? `Found ${Array.isArray(expenses.data) ? expenses.data.length : 0} expenses` : 'Failed');
  }

  // 14. Resource Endpoints
  console.log(`\n${colors.yellow}--- Resource Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const resources = await apiRequest('/resources', 'GET', null, true);
    printResult('Get Resources', resources.ok, resources.ok ? `Found ${Array.isArray(resources.data) ? resources.data.length : 0} resources` : 'Failed');

    const resourceUtil = await apiRequest('/resource-utilization', 'GET', null, true);
    printResult('Get Resource Utilization', resourceUtil.ok, resourceUtil.ok ? 'Data retrieved' : `Msg: ${resourceUtil.data?.error || 'Failed'}`);

    const teamCapacity = await apiRequest('/team-capacity', 'GET', null, true);
    printResult('Get Team Capacity', teamCapacity.ok, teamCapacity.ok ? 'Data retrieved' : `Msg: ${teamCapacity.data?.error || 'Failed'}`);
  }

  // 15. Performance Endpoints
  console.log(`\n${colors.yellow}--- Performance Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const performance = await apiRequest('/performance', 'GET', null, true);
    printResult('Get Performance', performance.ok, performance.ok ? 'Data retrieved' : `Msg: ${performance.data?.error || 'Failed'}`);
  }

  // 16. Project Manager Endpoints
  console.log(`\n${colors.yellow}--- Project Manager Endpoints ---${colors.reset}`);
  
  if (authToken) {
    const pm = await apiRequest('/project-managers', 'GET', null, true);
    printResult('Get Project Managers', pm.ok, pm.ok ? `Found ${Array.isArray(pm.data) ? pm.data.length : 0} PMs` : 'Failed');
  }

  // Summary
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}  Test Suite Complete${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}\n`);
  
  console.log(`${colors.cyan}Backend URL:${colors.reset} ${API_BASE_URL}`);
  console.log(`${colors.cyan}Frontend URL:${colors.reset} https://ticket-apw.vercel.app`);
  console.log(`${colors.cyan}Test User:${colors.reset} ${TEST_EMAIL}`);
  console.log(`${colors.cyan}Auth Status:${colors.reset} ${authToken ? `${colors.green}Authenticated${colors.reset}` : `${colors.red}Not Authenticated${colors.reset}`}`);
}

// Run tests
runTests().catch(console.error);
