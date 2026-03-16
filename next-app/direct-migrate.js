const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  try {
    console.log('🔄 Starting direct SQL migrations...');
    
    const fs = require('fs');
    const path = require('path');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    for (const file of migrationFiles) {
      console.log(`📄 Executing migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Use raw SQL execution via POST to Supabase REST API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({ sql_query: sql })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Error in ${file}:`, error);
      } else {
        console.log(`✅ Completed: ${file}`);
      }
    }
    
    console.log('🎉 All migrations completed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

runMigrations();
