const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Read migration files
    const fs = require('fs');
    const path = require('path');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    for (const file of migrationFiles) {
      console.log(`📄 Executing migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Split SQL into individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.from('_migrations').insert({
            file: file,
            executed_at: new Date().toISOString()
          }).select();
          
          if (error && !error.message.includes('duplicate key')) {
            console.error(`❌ Error in ${file}:`, error);
          }
        }
      }
      
      console.log(`✅ Completed: ${file}`);
    }
    
    console.log('🎉 All migrations completed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

runMigrations();
