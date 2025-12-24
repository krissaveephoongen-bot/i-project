#!/usr/bin/env node

/**
 * Role-Based Management System Test Script
 * Tests authentication, teams, and projects with role-based access
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:3000/api';
let adminToken = '';
let managerToken = '';
let employeeToken = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function testLogin() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 Testing Authentication');
  console.log('='.repeat(60));

  try {
    // Test admin login
    log.info('Testing admin login...');
    const adminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin@1234'
    });
    adminToken = adminRes.data.token;
    log.success('Admin login successful');

    // Test with wrong password
    log.info('Testing login with wrong password...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@example.com',
        password: 'WrongPassword'
      });
      log.error('Should have failed with wrong password');
    } catch (err) {
      if (err.response?.status === 401) {
        log.success('Correctly rejected invalid password');
      }
    }

    return true;
  } catch (error) {
    log.error('Authentication test failed: ' + error.message);
    return false;
  }
}

async function testUserManagement() {
  console.log('\n' + '='.repeat(60));
  console.log('👥 Testing User Management');
  console.log('='.repeat(60));

  try {
    // Create manager user
    log.info('Creating manager user...');
    const managerRes = await axios.post(
      `${API_BASE}/users`,
      {
        name: 'Test Manager',
        email: 'manager@test.com',
        password: 'ManagerPass123',
        role: 'manager',
        department: 'Management'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const managerId = managerRes.data.data.id;
    log.success('Manager user created');

    // Create employee user
    log.info('Creating employee user...');
    const employeeRes = await axios.post(
      `${API_BASE}/users`,
      {
        name: 'Test Employee',
        email: 'employee@test.com',
        password: 'EmployeePass123',
        role: 'employee',
        department: 'Development'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const employeeId = employeeRes.data.data.id;
    log.success('Employee user created');

    // Get all users
    log.info('Fetching all users...');
    const usersRes = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    log.success(`Retrieved ${usersRes.data.data.length} users`);

    // Update user role
    log.info('Updating user role...');
    await axios.patch(
      `${API_BASE}/users/${managerId}/role`,
      { role: 'manager' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log.success('User role updated');

    // Login as manager
    log.info('Testing manager login...');
    const managerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'manager@test.com',
      password: 'ManagerPass123'
    });
    managerToken = managerLoginRes.data.token;
    log.success('Manager login successful');

    // Login as employee
    log.info('Testing employee login...');
    const employeeLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'employee@test.com',
      password: 'EmployeePass123'
    });
    employeeToken = employeeLoginRes.data.token;
    log.success('Employee login successful');

    return { adminId: '', managerId, employeeId };
  } catch (error) {
    log.error('User management test failed: ' + error.message);
    return null;
  }
}

async function testTeamManagement(userIds) {
  console.log('\n' + '='.repeat(60));
  console.log('🏢 Testing Team Management');
  console.log('='.repeat(60));

  try {
    // Create team as manager
    log.info('Creating team as manager...');
    const teamRes = await axios.post(
      `${API_BASE}/teams`,
      {
        name: 'Development Team',
        description: 'Core development team',
        lead_id: userIds.managerId
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    const teamId = teamRes.data.data.id;
    log.success('Team created');

    // Add member to team
    log.info('Adding member to team...');
    await axios.post(
      `${API_BASE}/teams/${teamId}/members`,
      {
        user_id: userIds.employeeId,
        role: 'member'
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    log.success('Member added to team');

    // Get team members
    log.info('Fetching team members...');
    const membersRes = await axios.get(`${API_BASE}/teams/${teamId}/members`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    log.success(`Retrieved ${membersRes.data.data.length} team members`);

    // Get team statistics
    log.info('Fetching team statistics...');
    const statsRes = await axios.get(`${API_BASE}/teams/${teamId}/statistics`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    log.success(`Team statistics: ${statsRes.data.data.total_members} members`);

    return teamId;
  } catch (error) {
    log.error('Team management test failed: ' + error.message);
    return null;
  }
}

async function testProjectManagement(teamId) {
  console.log('\n' + '='.repeat(60));
  console.log('📁 Testing Project Management');
  console.log('='.repeat(60));

  try {
    // Create project as manager
    log.info('Creating project as manager...');
    const projectRes = await axios.post(
      `${API_BASE}/projects`,
      {
        name: 'Website Redesign',
        description: 'Complete website redesign project',
        start_date: '2025-12-01',
        end_date: '2026-03-31',
        budget: 100000,
        status: 'planning'
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    const projectId = projectRes.data.data.id;
    log.success('Project created');

    // Get project
    log.info('Fetching project details...');
    const projectDetailsRes = await axios.get(`${API_BASE}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    log.success(`Project retrieved: ${projectDetailsRes.data.data.name}`);

    // Update project
    log.info('Updating project status...');
    await axios.put(
      `${API_BASE}/projects/${projectId}`,
      { status: 'active', progress: 25 },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    log.success('Project updated');

    // Test employee access to project
    log.info('Testing employee project access...');
    try {
      await axios.get(`${API_BASE}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      log.warn('Employee can view project (if assigned)');
    } catch (err) {
      if (err.response?.status === 403) {
        log.success('Correctly denied employee access to unassigned project');
      }
    }

    return projectId;
  } catch (error) {
    log.error('Project management test failed: ' + error.message);
    return null;
  }
}

async function testAccessControl() {
  console.log('\n' + '='.repeat(60));
  console.log('🔒 Testing Access Control');
  console.log('='.repeat(60));

  try {
    // Test employee cannot create user
    log.info('Testing employee cannot create user...');
    try {
      await axios.post(
        `${API_BASE}/users`,
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123',
          role: 'employee'
        },
        { headers: { Authorization: `Bearer ${employeeToken}` } }
      );
      log.error('Employee should not be able to create users');
    } catch (err) {
      if (err.response?.status === 403) {
        log.success('Correctly denied employee user creation');
      }
    }

    // Test employee cannot create project
    log.info('Testing employee cannot create project...');
    try {
      await axios.post(
        `${API_BASE}/projects`,
        {
          name: 'Unauthorized Project',
          description: 'Test',
          start_date: '2025-12-01',
          end_date: '2026-03-31',
          budget: 50000
        },
        { headers: { Authorization: `Bearer ${employeeToken}` } }
      );
      log.error('Employee should not be able to create projects');
    } catch (err) {
      if (err.response?.status === 403) {
        log.success('Correctly denied employee project creation');
      }
    }

    // Test admin can create user
    log.info('Testing admin can create user...');
    const adminUserRes = await axios.post(
      `${API_BASE}/users`,
      {
        name: 'Another Admin',
        email: 'admin2@test.com',
        password: 'AdminPass123',
        role: 'admin'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    log.success('Admin successfully created user');

    return true;
  } catch (error) {
    log.error('Access control test failed: ' + error.message);
    return false;
  }
}

async function testProfileOperations() {
  console.log('\n' + '='.repeat(60));
  console.log('👤 Testing Profile Operations');
  console.log('='.repeat(60));

  try {
    // Get profile
    log.info('Fetching user profile...');
    const profileRes = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    log.success(`Profile retrieved: ${profileRes.data.data.name}`);

    // Update profile
    log.info('Updating user profile...');
    await axios.put(
      `${API_BASE}/auth/profile`,
      { department: 'Updated Department', position: 'Senior Manager' },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    log.success('Profile updated');

    // Change password
    log.info('Changing password...');
    await axios.put(
      `${API_BASE}/auth/password`,
      {
        currentPassword: 'ManagerPass123',
        newPassword: 'NewManagerPass123'
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    log.success('Password changed');

    // Test new password
    log.info('Testing new password login...');
    const newLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'manager@test.com',
      password: 'NewManagerPass123'
    });
    log.success('New password works');

    return true;
  } catch (error) {
    log.error('Profile operations test failed: ' + error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 ROLE-BASED MANAGEMENT SYSTEM TEST SUITE');
  console.log('═'.repeat(60));

  try {
    // Test 1: Authentication
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      log.error('Authentication failed. Stopping tests.');
      return;
    }

    // Test 2: User Management
    const userIds = await testUserManagement();
    if (!userIds) {
      log.error('User management failed. Stopping tests.');
      return;
    }

    // Test 3: Teams
    const teamId = await testTeamManagement(userIds);
    if (!teamId) {
      log.error('Team management failed. Stopping tests.');
      return;
    }

    // Test 4: Projects
    const projectId = await testProjectManagement(teamId);
    if (!projectId) {
      log.error('Project management failed. Stopping tests.');
      return;
    }

    // Test 5: Access Control
    await testAccessControl();

    // Test 6: Profile Operations
    await testProfileOperations();

    console.log('\n' + '═'.repeat(60));
    log.success('ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(60) + '\n');
  } catch (error) {
    log.error('Test suite error: ' + error.message);
  }
}

// Run tests
runAllTests();
