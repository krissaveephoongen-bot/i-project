import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function fixColumns() {
  const connectionString = process.env.DATABASE_URL || 
    'postgres://user:password@localhost:5432/project_management';

  console.log('Fixing database columns...');
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Add avatar column to users table if it doesn't exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
    `);

    // Change role column type from enum to TEXT if it's currently an enum
    await pool.query(`
      ALTER TABLE users ALTER COLUMN role TYPE TEXT;
    `);

    // Add manager_id column to projects table if it doesn't exist
    await pool.query(`
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);

    console.log('Database columns fixed successfully!');
  } catch (error) {
    console.error('Error fixing database columns:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixColumns().catch(console.error);