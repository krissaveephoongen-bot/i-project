import { test, expect } from '@playwright/test'

const PROD_URL = 'https://i-projects.skin'
const EMAIL = 'jakgrits.ph@appworks.co.th'
const PASSWORD = 'AppWorks@123!'

test.describe('Timesheet Smoke', () => {
  test('login, /timesheet UI tabs, and /timesheet/record basic form', async ({ page }) => {
    test.setTimeout(180000)

    // Login helper with retry
    const doLogin = async () => {
      await page.goto(`${PROD_URL}/staff/login`, { waitUntil: 'networkidle' })
      await expect(page.locator('#email')).toBeVisible()
      await page.fill('#email', EMAIL)
      await expect(page.locator('#password')).toBeVisible()
      await page.fill('#password', PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForLoadState('networkidle')
    }

    await doLogin()
    // Navigate to /timesheet (retry login if redirected)
    const gotoTimesheet = async () => {
      await page.goto(`${PROD_URL}/timesheet`, { waitUntil: 'networkidle' })
      if (page.url().includes('/staff/login')) {
        await doLogin()
        await page.goto(`${PROD_URL}/timesheet`, { waitUntil: 'networkidle' })
      }
    }
    await gotoTimesheet()
    await expect(page.url()).toMatch(/\/timesheet/)

    // Header title
    await expect(page.getByText('บันทึกเวลาทำงาน (Timesheet)')).toBeVisible()

    // Tabs should exist
    const monthlyTab = page.getByRole('tab', { name: 'มุมมองรายเดือน' })
    const weeklyTab = page.getByRole('tab', { name: 'สรุปรายสัปดาห์' })
    const activitiesTab = page.getByRole('tab', { name: 'ประวัติกิจกรรม' })
    await expect(monthlyTab).toBeVisible()
    await expect(weeklyTab).toBeVisible()
    await expect(activitiesTab).toBeVisible()

    // Try toggle edit mode and open day editor if available
    const editBtn = page.getByRole('button', { name: /แก้ไขเวลา|Edit/i })
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click()
      // Click any editable cell (if present)
      const editableCell = page.locator('td div.cursor-pointer').first()
      if (await editableCell.isVisible().catch(() => false)) {
        await editableCell.click()
        // Modal should be visible; cancel out
        await expect(page.getByRole('dialog')).toBeVisible()
        const cancelBtn = page.getByRole('button', { name: /ยกเลิก|Cancel/i })
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click()
        }
      }
    }

    // Switch tabs to verify content mounts without crashing
    await weeklyTab.click()
    await page.waitForLoadState('networkidle')
    await expect(weeklyTab).toHaveAttribute('data-state', 'active')
    // Weekly: ensure table exists and search button works
    const weeklySearch = page.getByRole('button', { name: /ค้นหา|Search/i })
    if (await weeklySearch.isVisible().catch(() => false)) {
      await weeklySearch.click()
      await page.waitForLoadState('networkidle')
    }
    await expect(page.locator('table')).toBeVisible()

    await activitiesTab.click()
    await page.waitForLoadState('networkidle')
    await expect(activitiesTab).toHaveAttribute('data-state', 'active')
    const actSearch = page.getByRole('button', { name: /ค้นหา|Search/i })
    if (await actSearch.isVisible().catch(() => false)) {
      await actSearch.click()
      await page.waitForLoadState('networkidle')
    }
    await expect(page.locator('table')).toBeVisible()

    await monthlyTab.click()
    await page.waitForLoadState('networkidle')
    await expect(monthlyTab).toHaveAttribute('data-state', 'active')

    // Navigate to /timesheet/record
    await page.goto(`${PROD_URL}/timesheet/record`, { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/.*\/timesheet\/record/)

    // Basic header and form controls visible
    await expect(page.getByText('บันทึกข้อมูลการทำงาน (Timesheet)')).toBeVisible()
    // Expect at least one date input
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput.first()).toBeVisible()
    // Expect description textarea
    const textareas = page.locator('textarea')
    await expect(textareas.first()).toBeVisible()
  })
})

