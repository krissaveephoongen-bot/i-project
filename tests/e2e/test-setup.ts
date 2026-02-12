import { test as baseTest } from '@playwright/test';

// Extend base test with our fixtures
export const test = baseTest.extend({
  // Add test user data
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'admin@example.com',
    password: process.env.TEST_USER_PASSWORD || 'password123',
    name: 'Test Admin'
  },

  // Add test project data
  testProject: {
    name: 'E2E Test Project',
    description: 'Project created by E2E tests',
    status: 'active'
  },

  // Add test task data
  testTask: {
    title: 'E2E Test Task',
    description: 'Task created by E2E tests',
    status: 'todo'
  }
});

// Global setup for authentication
export const setup = async () => {
  // In a real scenario, you would:
  // 1. Create test user in database
  // 2. Create test data
  // 3. Return authentication state

  console.log('Setting up test environment...');
  console.log('Using configured database connection');
};

// Global teardown
export const teardown = async () => {
  // In a real scenario, you would:
  // 1. Clean up test data
  // 2. Remove test users
  console.log('Cleaning up test environment...');
};