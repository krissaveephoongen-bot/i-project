import { test, expect } from '@playwright/test';

// Real user credentials for Neon database
const REAL_USER = {
  email: process.env.TEST_USER_EMAIL || 'admin@example.com',
  password: process.env.TEST_USER_PASSWORD || 'password123'
};

test.describe('Authentication Flow with Real Data', () => {
  test('should allow user to login with real credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in real login credentials
    await page.fill('input[name="email"]', REAL_USER.email);
    await page.fill('input[name="password"]', REAL_USER.password);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation and check if we're logged in
    await page.waitForURL(/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();

    // Verify we can see real data
    await expect(page.locator('text=Projects')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Click login button
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });
});