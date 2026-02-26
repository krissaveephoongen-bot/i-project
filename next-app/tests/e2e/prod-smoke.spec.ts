import { test, expect } from "@playwright/test";

const PROD_URL = "https://i-projects.skin";
const EMAIL = "jakgrits.ph@appworks.co.th";
const PASSWORD = "AppWorks@123!";

test.describe("Prod Smoke Test", () => {
  test("login and core pages render", async ({ page }) => {
    test.setTimeout(120000);

    // 1) Login
    await page.goto(`${PROD_URL}/staff/login`, { waitUntil: "networkidle" });

    // Fill email using specific ID
    const emailInput = page.locator("#email");
    await expect(emailInput).toBeVisible();
    await emailInput.fill(EMAIL);

    // Fill password using specific ID
    const passwordInput = page.locator("#password");
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(PASSWORD);

    // Click submit button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    console.log("Logged in successfully, URL:", page.url());
    expect(page.url()).toContain(PROD_URL);

    // 2) Navigate to Projects
    await page.goto(`${PROD_URL}/projects`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/projects/);
    console.log("Projects page loaded:", page.url());

    // 3) Navigate to Tasks
    await page.goto(`${PROD_URL}/tasks`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/tasks/);
    console.log("Tasks page loaded:", page.url());

    // 4) Navigate to Timesheet
    await page.goto(`${PROD_URL}/timesheet`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/timesheet/);
    console.log("Timesheet page loaded:", page.url());

    // 5) Navigate to Expenses
    await page.goto(`${PROD_URL}/expenses`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/expenses/);
    console.log("Expenses page loaded:", page.url());

    // 6) Navigate to Approvals
    await page.goto(`${PROD_URL}/approvals/expenses`, {
      waitUntil: "networkidle",
    });
    await expect(page).toHaveURL(/.*\/approvals/);
    console.log("Approvals page loaded:", page.url());

    // 7) Navigate to Reports
    await page.goto(`${PROD_URL}/reports`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/reports/);
    console.log("Reports page loaded:", page.url());

    // 8) Navigate to Clients
    await page.goto(`${PROD_URL}/clients`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/clients/);
    console.log("Clients page loaded:", page.url());

    console.log("All smoke tests passed!");
  });
});
