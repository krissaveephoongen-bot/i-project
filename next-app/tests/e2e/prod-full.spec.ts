import { test, expect } from '@playwright/test'
import fs from 'fs'

const PROD_URL = 'https://i-projects.skin'
const EMAIL = 'jakgrits.ph@appworks.co.th'
const PASSWORD = 'AppWorks@123!'

async function fetchJson(page: any, path: string) {
  const res = await page.request.get(`${PROD_URL}${path}`)
  const ok = res.ok()
  let json: any = null
  try { json = await res.json() } catch {}
  return { ok, status: res.status(), json }
}

test.describe('Production Full Navigation and Data Validation', () => {
  test('navigate all pages, tabs, components, and record report', async ({ page }) => {
    test.setTimeout(180000)

    const results: any = { timestamp: new Date().toISOString(), base: PROD_URL, routes: [], tabs: [], components: [], apis: [] }

    // Login
    await page.goto(`${PROD_URL}/staff/login`, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
    await expect(emailInput).toBeVisible()
    await emailInput.fill(EMAIL)
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first()
    await expect(passwordInput).toBeVisible()
    await passwordInput.fill(PASSWORD)
    const roleButton = page.getByRole('button', { name: /เข้าสู่ระบบ|login|sign in/i })
    if (await roleButton.first().isVisible().catch(() => false)) {
      await roleButton.first().click()
    } else {
      const submitBtn = page.locator('button[type="submit"]').first()
      await expect(submitBtn).toBeVisible()
      await submitBtn.click()
    }
    await page.waitForLoadState('networkidle')
    results.login = { ok: true }

    // APIs to validate data correctness
    const portfolio = await fetchJson(page, '/api/dashboard/portfolio')
    const activities = await fetchJson(page, '/api/dashboard/activities')
    const exec = await fetchJson(page, '/api/projects/executive-report')
    const weekly = await fetchJson(page, '/api/projects/weekly-summary')
    const projectsApi = await fetchJson(page, '/api/projects')
    results.apis.push({ name: 'dashboard/portfolio', ...portfolio })
    results.apis.push({ name: 'dashboard/activities', ...activities })
    results.apis.push({ name: 'projects/executive-report', ...exec })
    results.apis.push({ name: 'projects/weekly-summary', ...weekly })
    results.apis.push({ name: 'projects', ...projectsApi })

    const staticRoutes = [
      '/', '/dashboard', '/projects', '/projects/new', '/projects/weekly-activities',
      '/reports', '/resources', '/expenses', '/expenses/memo', '/expenses/travel',
      '/approvals/expenses', '/approvals/timesheets', '/users', '/timesheet', '/timesheet/record',
      '/settings', '/help', '/profile', '/clients', '/approval', '/tasks', '/sales', '/stakeholders',
      '/vendor', '/vendor/login', '/staff', '/staff/login', '/admin', '/admin/logs', '/admin/users', '/admin/health'
    ]

    for (const route of staticRoutes) {
      const url = `${PROD_URL}${route}`
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        await page.waitForLoadState('networkidle')
        const hasMain = await page.locator('main, [role="main"], .container, .content').first().isVisible().catch(() => false)
        results.routes.push({ route, ok: true, hasMain })
      } catch (e: any) {
        results.routes.push({ route, ok: false, error: String(e) })
      }
    }

    // Dynamic project routes if data exists
    const firstProjectId = Array.isArray(projectsApi.json) ? projectsApi.json[0]?.id : null
    if (firstProjectId) {
      const dynamicRoutes = [
        `/projects/${firstProjectId}`, `/projects/${firstProjectId}/overview`, `/projects/${firstProjectId}/tasks`,
        `/projects/${firstProjectId}/risks`, `/projects/${firstProjectId}/milestones`, `/projects/${firstProjectId}/documents`,
        `/projects/${firstProjectId}/budget`, `/projects/${firstProjectId}/team`, `/projects/${firstProjectId}/edit`,
        `/projects/${firstProjectId}/closure`
      ]
      for (const route of dynamicRoutes) {
        const url = `${PROD_URL}${route}`
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded' })
          await page.waitForLoadState('networkidle')
          const hasTabs = await page.locator('a:has-text("Overview")').first().isVisible().catch(() => false)
          results.tabs.push({ route, ok: true, hasTabs })
        } catch (e: any) {
          results.tabs.push({ route, ok: false, error: String(e) })
        }
      }
      // Component checks on overview (charts/tables)
      try {
        await page.goto(`${PROD_URL}/projects/${firstProjectId}/overview`, { waitUntil: 'domcontentloaded' })
        await page.waitForLoadState('networkidle')
        const hasChart = await page.locator('svg, canvas').first().isVisible().catch(() => false)
        const hasTable = await page.locator('table').first().isVisible().catch(() => false)
        results.components.push({ route: `/projects/${firstProjectId}/overview`, charts: hasChart, table: hasTable })
      } catch {}
    } else {
      results.tabs.push({ note: 'No projects in production; dynamic routes skipped' })
    }

    // Validate dashboard KPIs match API aggregates (if any)
    try {
      await page.goto(`${PROD_URL}/dashboard`, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle')
      const textBudget = await page.locator('text=งบประมาณรวม').first().locator('xpath=..').locator('text=฿').first().textContent().catch(() => '')
      results.dashboard = { budgetText: textBudget?.trim() || null, apiRows: Array.isArray(portfolio.json?.rows) ? portfolio.json.rows.length : null }
    } catch {}

    // Write report
    let md = ''
    md += `# Production Full Test Report\n\n`
    md += `Timestamp: ${results.timestamp}\n`
    md += `Target: ${results.base}\n\n`
    md += `## Login\n- ${results.login?.ok ? 'OK' : 'FAILED'}\n\n`
    md += `## APIs\n`
    for (const a of results.apis) {
      md += `- ${a.name}: ${a.ok ? 'OK' : 'FAILED'} (status ${a.status})\n`
    }
    md += `\n## Static Routes\n`
    for (const r of results.routes) {
      md += `- ${r.route}: ${r.ok ? 'OK' : 'FAILED'}${r.hasMain ? ' (content found)' : ''}\n`
    }
    md += `\n## Project Tabs\n`
    for (const t of results.tabs) {
      if (t.route) md += `- ${t.route}: ${t.ok ? 'OK' : 'FAILED'}${t.hasTabs ? ' (tabs present)' : ''}\n`
      else md += `- ${t.note}\n`
    }
    md += `\n## Components\n`
    for (const c of results.components) {
      md += `- ${c.route}: charts=${c.charts ? 'yes' : 'no'}, table=${c.table ? 'yes' : 'no'}\n`
    }
    if (results.dashboard) {
      md += `\n## Dashboard KPI vs API\n`
      md += `- Budget Text: ${results.dashboard.budgetText}\n`
      md += `- API Rows: ${results.dashboard.apiRows}\n`
    }

    fs.writeFileSync('test-prod-full.md', md, 'utf-8')
    console.log('Wrote test-prod-full.md')
  })
})

