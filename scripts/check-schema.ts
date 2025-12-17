import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // For development only
  },
});

async function checkSchema() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking database schema...');
    
    // Get all columns from users table
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    if (result.rows.length === 0) {
      console.log('ℹ️ No columns found in users table.');
      return;
    }

    console.log('\n📋 Users table columns:');
    console.log('='.repeat(60));
    console.log(
      'Column Name'.padEnd(30) +
      ' | ' +
      'Data Type'.padEnd(20) +
      ' | ' +
      'Nullable'
    );
    console.log('='.repeat(60));

    result.rows.forEach((row) => {
      console.log(
        row.column_name.padEnd(30) +
        ' | ' +
        row.data_type.padEnd(20) +
        ' | ' +
        row.is_nullable
      );
    });

    // Get sample data
    const sampleData = await client.query('SELECT * FROM users LIMIT 1');
    if (sampleData.rows.length > 0) {
      console.log('\n📋 Sample user data:');
      console.log('='.repeat(60));
      console.log(JSON.stringify(sampleData.rows[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
checkSchema();
