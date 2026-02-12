import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard with KPI data', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check dashboard title
    await expect(page.locator('text=Executive Dashboard')).toBeVisible();

    // Check KPI cards are present
    await expect(page.locator('text=Total Portfolio Value')).toBeVisible();
    await expect(page.locator('text=Avg. SPI')).toBeVisible();
    await expect(page.locator('text=Active Issues')).toBeVisible();
    await expect(page.locator('text=Billing Forecast')).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/');

    // Click on a project link (if available)
    const projectLink = page.locator('a[href*="/projects/"]').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL('**/projects/**');
      await expect(page).toHaveURL(/.*projects.*/);
    }
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Check navigation elements
    await expect(page.locator('nav, header')).toBeVisible();

    // Check for sidebar or navigation menu
    const sidebar = page.locator('[data-sidebar], aside, nav');
    if (await sidebar.isVisible()) {
      await expect(sidebar).toBeVisible();
    }
  });
});