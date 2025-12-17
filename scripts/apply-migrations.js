const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigrations() {
  // Initialize Supabase client
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Read all migration files
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Important: sort to apply migrations in order

    console.log(`Found ${migrationFiles.length} migration(s) to apply`);

    // Apply each migration
    for (const file of migrationFiles) {
      console.log(`\nApplying migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute the migration
      const { data, error } = await supabase.rpc('pg_temp.exec_sql', { sql });
      
      if (error) {
        console.error(`❌ Error applying migration ${file}:`, error);
        process.exit(1);
      }
      
      console.log(`✅ Applied migration: ${file}`);
    }

    console.log('\n🎉 All migrations applied successfully!');
  } catch (error) {
    console.error('❌ An error occurred:', error);
    process.exit(1);
  }
}

applyMigrations();
