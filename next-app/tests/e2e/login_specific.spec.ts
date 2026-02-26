import { test, expect } from "@playwright/test";

test("Login with specific credentials", async ({ page }) => {
  await page.goto("/staff/login");

  // Wait for the email input to be visible
  await page.waitForSelector('input[type="email"]');

  // Fill in credentials using generic selectors as placeholder might change
  await page.fill('input[type="email"]', "jakgrits.ph@appworks.co.th");
  await page.fill('input[type="password"]', "AppWorks@123!");

  // Click login button (submit type)
  await page.click('button[type="submit"]');

  // Wait for navigation or success message
  // Assuming successful login redirects to dashboard or shows user name
  // Increased timeout to account for potential redirects or slow loading
  await expect(page).toHaveURL("/", { timeout: 15000 });

  // Optional: Check if a specific element exists that confirms login (e.g., sidebar, user profile)
  // await expect(page.getByText('Projects')).toBeVisible();
});
