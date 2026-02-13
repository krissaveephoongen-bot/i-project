const fs = require('fs')

const PROD_URL = 'https://i-projects.skin'
const EMAIL = 'jakgrits.ph@appworks.co.th'
const PASSWORD = 'AppWorks@123!'

async function login() {
  try {
    const res = await fetch(`${PROD_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    })
    const json = await res.json().catch(() => ({}))
    return { ok: res.ok, json }
  } catch (e) {
    return { ok: false, json: { error: String(e) } }
  }
}

async function getJson(path) {
  try {
    const res = await fetch(`${PROD_URL}${path}`, { method: 'GET' })
    const json = await res.json().catch(() => null)
    return { ok: res.ok, json, status: res.status }
  } catch (e) {
    return { ok: false, json: null, error: String(e) }
  }
}

async function getText(path) {
  try {
    const res = await fetch(`${PROD_URL}${path}`, { method: 'GET' })
    const text = await res.text()
    return { ok: res.ok, text, status: res.status }
  } catch (e) {
    return { ok: false, text: '', error: String(e) }
  }
}

function analyzePortfolio(rows = []) {
  const issues = []
  let b = 0, c = 0, a = 0, rm = 0
  for (const r of rows) {
    const budget = Number(r.budget || 0)
    const committed = Number(r.committed || 0)
    const actual = Number(r.actual || 0)
    const remaining = Number(r.remaining || 0)
    const spi = Number(r.spi || 1)
    const cpi = Number(r.cpi || 1)

    b += budget; c += committed; a += actual; rm += remaining

    if (budget < 0 || committed < 0 || actual < 0 || remaining < 0) {
      issues.push(`Negative values for project ${r.id}: budget=${budget}, committed=${committed}, actual=${actual}, remaining=${remaining}`)
    }
    if (spi < 0 || spi > 5) {
      issues.push(`Out-of-range SPI for project ${r.id}: spi=${spi}`)
    }
    if (cpi < 0 || cpi > 5) {
      issues.push(`Out-of-range CPI for project ${r.id}: cpi=${cpi}`)
    }
    if (remaining > budget) {
      issues.push(`Remaining exceeds Budget for project ${r.id}: remaining=${remaining}, budget=${budget}`)
    }
  }
  return { totals: { budget: b, committed: c, actual: a, remaining: rm }, issues }
}

function scanPlaceholders(html = '') {
  const terms = [/\blorem\b/i, /\bplaceholder\b/i, /\bdemo\b/i, /\bmock\b/i, /\bsample\b/i, /N\/?A/i, /Dummy/i]
  const found = []
  for (const t of terms) {
    if (t.test(html)) found.push(String(t))
  }
  return found
}

async function main() {
  const results = []
  const timestamp = new Date().toISOString()

  const loginRes = await login()
  results.push({ name: 'login', ok: loginRes.ok, detail: loginRes.json })

  const portfolio = await getJson('/api/dashboard/portfolio')
  results.push({ name: 'dashboard/portfolio', ok: portfolio.ok, status: portfolio.status })

  const activities = await getJson('/api/dashboard/activities')
  results.push({ name: 'dashboard/activities', ok: activities.ok, status: activities.status, count: Array.isArray(activities.json) ? activities.json.length : null })

  const exec = await getJson('/api/projects/executive-report')
  results.push({ name: 'projects/executive-report', ok: exec.ok, status: exec.status })

  const weekly = await getJson('/api/projects/weekly-summary')
  results.push({ name: 'projects/weekly-summary', ok: weekly.ok, status: weekly.status, count: weekly.json?.summary?.length ?? null })

  const dashboardHtml = await getText('/dashboard')
  const placeholders = scanPlaceholders(dashboardHtml.text)

  const analysis = analyzePortfolio(portfolio.json?.rows || [])

  let md = ''
  md += `# Production Test Report\n\n`
  md += `Timestamp: ${timestamp}\n`
  md += `Target: ${PROD_URL}\n\n`
  md += `## Summary\n`
  md += `- Login: ${loginRes.ok ? 'OK' : 'FAILED'}\n`
  md += `- Portfolio API: ${portfolio.ok ? 'OK' : 'FAILED'} (status ${portfolio.status})\n`
  md += `- Activities API: ${activities.ok ? 'OK' : 'FAILED'} (status ${activities.status}, count=${results.find(r=>r.name==='dashboard/activities').count})\n`
  md += `- Executive Report API: ${exec.ok ? 'OK' : 'FAILED'} (status ${exec.status})\n`
  md += `- Weekly Summary API: ${weekly.ok ? 'OK' : 'FAILED'} (status ${weekly.status}, count=${results.find(r=>r.name==='projects/weekly-summary').count})\n\n`

  md += `## Dashboard Data Validation\n`
  md += `Totals (computed from rows):\n`
  md += `- Budget: ${analysis.totals.budget.toLocaleString()}\n`
  md += `- Committed: ${analysis.totals.committed.toLocaleString()}\n`
  md += `- Actual: ${analysis.totals.actual.toLocaleString()}\n`
  md += `- Remaining: ${analysis.totals.remaining.toLocaleString()}\n\n`

  if (analysis.issues.length === 0) {
    md += `No numeric anomalies detected in portfolio rows.\n\n`
  } else {
    md += `Issues detected:\n`
    for (const i of analysis.issues) md += `- ${i}\n`
    md += `\n`
  }

  md += `## Placeholder Scan (Dashboard HTML)\n`
  if (placeholders.length === 0) md += `No placeholder terms found.\n`
  else {
    md += `Found terms: ${placeholders.join(', ')}\n`
  }

  md += `\n## Next Steps\n`
  md += `- Confirm that API totals match visual KPIs on Dashboard.\n`
  md += `- Investigate any anomalies above before making code changes.\n`

  fs.writeFileSync('test-prod.md', md, 'utf-8')
  console.log('Wrote test-prod.md')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})

