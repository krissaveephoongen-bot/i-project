import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSchema() {
  const schemaPath = path.join(__dirname, '../supabase-schema.sql')
  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8')

  console.log('Running schema SQL...')

  const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL })

  if (error) {
    console.error('Error running schema:', error)
    // Fallback: try splitting and running statements
    const statements = schemaSQL.split(';').filter(s => s.trim())
    for (const stmt of statements) {
      if (stmt.trim()) {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: stmt + ';' })
        if (stmtError) {
          console.error('Error on statement:', stmt, stmtError)
        }
      }
    }
  } else {
    console.log('Schema executed successfully')
  }
}

runSchema().catch(console.error)