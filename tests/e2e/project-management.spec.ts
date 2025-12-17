import { test, expect } from '@playwright/test';

// Real test data
const TEST_PROJECT = {
  name: 'E2E Test Project',
  description: 'Project created by E2E tests for real data testing'
};

const TEST_TASK = {
  title: 'E2E Test Task',
  description: 'Task created by E2E tests'
};

test.describe('Project Management with Real Data', () => {
  test('should create and manage a project with real data', async ({ page }) => {
    // Login first with real credentials
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);

    // Create project with real data
    await page.click('text=Create Project');
    await page.fill('input[name="name"]', TEST_PROJECT.name);
    await page.fill('textarea[name="description"]', TEST_PROJECT.description);
    await page.click('button:has-text("Create")');

    // Verify project creation with real data
    await expect(page.locator(`text=${TEST_PROJECT.name}`)).toBeVisible();
    await expect(page).toHaveURL(/projects/);

    // Add tasks with real data
    await page.click('text=Add Task');
    await page.fill('input[name="title"]', TEST_TASK.title);
    await page.click('button:has-text("Add")');

    // Verify task creation with real data
    await expect(page.locator(`text=${TEST_TASK.title}`)).toBeVisible();
  });

  test('should edit and delete a project with real data', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to projects
    await page.click('text=Projects');
    await expect(page.locator(`text=${TEST_PROJECT.name}`)).toBeVisible();

    // Edit project with real data
    await page.click('text=Edit');
    const updatedName = `${TEST_PROJECT.name} (Updated)`;
    await page.fill('input[name="name"]', updatedName);
    await page.click('button:has-text("Save")');
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();

    // Delete project with real data
    await page.click('text=Delete');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator(`text=${updatedName}`)).not.toBeVisible();
  });
});