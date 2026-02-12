import path from 'path'
import dotenv from 'dotenv'
import { Client } from 'pg'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  dotenv.config({ path: envPath })
}

function cleanUrl(url) {
  let u = url
  u = u.replace(/([?&])uselibpqcompat=true(&|$)/i, '$1')
  u = u.replace(/([?&])sslmode=require(&|$)/i, '$1')
  u = u.replace(/\?\&/, '?').replace(/\&\&/, '&').replace(/\?$/, '')
  return u
}

async function main() {
  loadEnv()
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL not set')
    process.exit(1)
  }
  const client = new Client({ connectionString: cleanUrl(url), ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const targets = [
      { table: 'public.time_entries', fk: 'time_entries_projectId_fkey', col: '"projectId"', ref: 'public.projects(id)' },
      { table: 'public.time_entries', fk: 'time_entries_userId_fkey', col: '"userId"', ref: 'public.users(id)' },
      { table: 'public.time_entries', fk: 'time_entries_taskId_fkey', col: '"taskId"', ref: 'public.tasks(id)' },
      { table: 'public.tasks', fk: 'tasks_projectId_fkey', col: '"projectId"', ref: 'public.projects(id)' },
    ]
    for (const t of targets) {
      const cur = await client.query(`SELECT conname, confdeltype FROM pg_constraint WHERE conname=$1`, [t.fk])
      const conf = cur.rows[0]?.confdeltype || null
      if (conf === 'r') {
        console.log(`[skip] ${t.fk} already RESTRICT`)
        continue
      }
      console.log(`[fix] ${t.fk} confdeltype=${conf || 'none'} -> RESTRICT`)
      await client.query(`ALTER TABLE ${t.table} DROP CONSTRAINT IF EXISTS ${t.fk}`)
      await client.query(`ALTER TABLE ${t.table} ADD CONSTRAINT ${t.fk} FOREIGN KEY (${t.col}) REFERENCES ${t.ref} ON DELETE RESTRICT`)
      const verify = await client.query(`SELECT conname, confdeltype FROM pg_constraint WHERE conname=$1`, [t.fk])
      console.log(`[ok] ${t.fk} => ${verify.rows[0]?.confdeltype}`)
    }
  } catch (e) {
    console.error('Fix error:', e.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch(e => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
