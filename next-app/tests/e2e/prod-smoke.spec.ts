import { test, expect } from '@playwright/test'

const PROD_URL = 'https://i-projects.skin'
const EMAIL = 'jakgrits.ph@appworks.co.th'
const PASSWORD = 'AppWorks@123!'

test.describe('Prod Smoke Test', () => {
  test('login and core pages render', async ({ page }) => {
    test.setTimeout(120000)

    // 1) Login
    await page.goto(`${PROD_URL}/staff/login`, { waitUntil: 'domcontentloaded' })

    // Fill email
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
    await expect(emailInput.first()).toBeVisible()
    await emailInput.first().fill(EMAIL)

    // Fill password
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]')
    await expect(passwordInput.first()).toBeVisible()
    await passwordInput.first().fill(PASSWORD)

    // Submit
    const roleButton = page.getByRole('button', { name: /เข้าสู่ระบบ|login|sign in/i })
    let clicked = false
    if (await roleButton.first().isVisible().catch(() => false)) {
      await roleButton.first().click()
      clicked = true
    }
    if (!clicked) {
      const submitBtn = page.locator('button[type="submit"]')
      await expect(submitBtn.first()).toBeVisible()
      await submitBtn.first().click()
    }

    await page.waitForLoadState('networkidle')

    // Expect dashboard
    const dashboardHeading = page.locator('text=ภาพรวมโครงการ').first()
    const dashboardAlt = page.locator('text=Dashboard').first()
    await expect(dashboardHeading.or(dashboardAlt)).toBeVisible({ timeout: 30000 })

    // 2) Navigate to Projects
    await page.goto(`${PROD_URL}/projects`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await expect(async () => {
      expect(page.url()).toContain('/projects')
    }).toPass()

    // 3) Approvals: Expenses
    await page.goto(`${PROD_URL}/approvals/expenses`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await expect(async () => {
      expect(page.url()).toContain('/approvals/expenses')
    }).toPass()

    // 4) Approvals: Timesheets
    await page.goto(`${PROD_URL}/approvals/timesheets`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    await expect(async () => {
      expect(page.url()).toContain('/approvals/timesheets')
    }).toPass()

    // 5) Notifications popover appears (in-app only approval/log)
    // Try opening bell in header if present
    const bellBtn = page.locator('button svg[data-lucide="bell"]').first()
    if (await bellBtn.isVisible().catch(() => false)) {
      await bellBtn.click()
      const notifHeader = page.locator('text=การแจ้งเตือน').first()
      await expect(notifHeader).toBeVisible()
    }
  })
})
