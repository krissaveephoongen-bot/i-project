import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // Test querying the users table if it exists
    try {
      const usersResult = await client.query('SELECT COUNT(*) as user_count FROM users');
      console.log(`📊 Found ${usersResult.rows[0].user_count} users in the database`);
    } catch (e) {
      console.log('ℹ️ Users table not found or empty. Run migrations to create tables.');
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  } finally {
    await pool.end();
  }
}

testConnection()
  .then(({ success }) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
