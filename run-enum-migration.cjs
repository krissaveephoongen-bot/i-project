/**
 * Run Enum Migration Script
 * 
 * This script creates all PostgreSQL enum types in the database.
 * Run with: node run-enum-migration.cjs
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase connection - use direct connection (port 5432) with db. prefix
// Format: postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
const DATABASE_URL = 'postgresql://postgres.vaunihijmwwkhqagjqjd:AppWorks@123!@db.vaunihijmwwkhqagjqjd.supabase.co:5432/postgres';

async function runMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Supabase
    }
  });

  try {
    console.log('🔗 Connecting to database...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'backend', 'db', 'migrations', '0004_create_enums.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Running enum migration...');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify enums were created
    const result = await pool.query(`
      SELECT t.typname as enum_name, 
             array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);
    
    console.log('\n📋 Enum types in database:');
    console.log('='.repeat(60));
    
    result.rows.forEach(row => {
      console.log(`\n${row.enum_name}:`);
      console.log(`  Values: ${row.enum_values.join(', ')}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`Total enums created: ${result.rows.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // If error is about existing types, that's okay
    if (error.message.includes('already exists') || error.message.includes('duplicate_object')) {
      console.log('\n⚠️  Some enum types already exist. This is normal if running migration multiple times.');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error);
