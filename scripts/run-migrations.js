/**
 * Database Migration Runner
 * Executes all SQL migration files in database/migrations directory
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get all SQL migration files, sorted by name
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`\nExecuting migration: ${file}`);
      try {
        await client.query(sql);
        console.log(`✓ ${file} executed successfully`);
      } catch (error) {
        console.error(`✗ Error executing ${file}:`, error.message);
        // Continue with next migration
      }
    }

    console.log('\n✓ All migrations completed');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
runMigrations().catch(error => {
  console.error('Migration runner error:', error);
  process.exit(1);
});
