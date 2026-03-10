import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if we're on the dashboard or login page
    const currentUrl = page.url();

    if (currentUrl.includes('/login')) {
      // If redirected to login, perform login
      await page.fill('input[type="email"]', 'jakgrits.ph@appworks.co.th');
      await page.fill('input[type="password"]', 'AppWorks@123!');
      await page.click('button[type="submit"]');

      // Wait for navigation to dashboard
      await page.waitForURL('**/');
    }

    // Verify we're on the dashboard
    await expect(page).toHaveURL('/');

    // Check for dashboard elements
    await expect(page.locator('text=Executive Dashboard')).toBeVisible();
  });

  test('should show login page for unauthenticated users', async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();

    // Navigate to protected route
    await page.goto('/profile');

    // Should redirect to login
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/.*login.*/);
  });
});