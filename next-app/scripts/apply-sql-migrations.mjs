import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { Client } from 'pg'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  dotenv.config({ path: envPath })
}

async function runSql(client, sql, name) {
  await client.query(sql)
  console.log(`[ok] ${name}`)
}

async function main() {
  loadEnv()
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }
  let cleanUrl = url.replace(/([?&])uselibpqcompat=true(&|$)/i, '$1').replace(/([?&])sslmode=require(&|$)/i, '$1')
  cleanUrl = cleanUrl.replace(/\?\&/, '?').replace(/\&\&/, '&').replace(/\?$/, '')
  const client = new Client({ connectionString: cleanUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const migrationsDir = path.resolve(process.cwd(), 'db', 'migrations')
    const order = [
      '20260211_expand_enums.sql',
      '20260211_milestones_add_columns.sql',
      '20260211_add_rejected_reason.sql',
      '20260211_fk_referential_actions.sql',
      '20260211_fk_restrict_patch.sql',
      '20260211_fk_restrict_force.sql',
      '20260211_restrict_triggers.sql',
      '2026-02-20_internal_office_project.sql',
    ]
    const diag = await client.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema='public' AND column_name IN (
        'taskid','projectid','userid','approvedby','managerid','clientid','assignedto','parenttaskid'
      )
      ORDER BY table_name, column_name;
    `)
    console.log('Column diagnostics:', JSON.stringify(diag.rows, null, 2))
    for (const file of order) {
      const full = path.join(migrationsDir, file)
      if (!fs.existsSync(full)) {
        console.warn(`[skip] missing ${file}`)
        continue
      }
      const sql = fs.readFileSync(full, 'utf8')
      await runSql(client, sql, file)
    }
    console.log('All migrations applied successfully')
  } catch (e) {
    console.error('Migration error:', e.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch(e => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
