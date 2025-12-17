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

async function queryUsers() {
  const client = await pool.connect();
  try {
    console.log('🔍 Querying users from the database...');
    
    // Query to get all users with their roles
    const result = await client.query(`
      SELECT 
        id,
        name,
        email,
        role,
        "employeeCode",
        "isActive",
        "createdAt",
        "updatedAt"
      FROM users
      ORDER BY "createdAt" DESC
    `);

    if (result.rows.length === 0) {
      console.log('ℹ️ No users found in the database.');
      return;
    }

    console.log('\n📋 Users in the database:');
    console.log('='.repeat(120));
    console.log(
      'ID'.padEnd(38) +
      ' | ' +
      'Name'.padEnd(20) +
      ' | ' +
      'Email'.padEnd(30) +
      ' | ' +
      'Role'.padEnd(10) +
      ' | ' +
      'Active'.padEnd(6) +
      ' | ' +
      'Created At'
    );
    console.log('='.repeat(120));

    result.rows.forEach((user) => {
      console.log(
        user.id.padEnd(38) +
        ' | ' +
        (user.name || '').padEnd(20) +
        ' | ' +
        (user.email || '').padEnd(30) +
        ' | ' +
        (user.role || '').padEnd(10) +
        ' | ' +
        (user.isActive ? '✅' : '❌').padEnd(6) +
        ' | ' +
        new Date(user.createdAt).toLocaleString()
      );
    });

    console.log('\n✅ Query completed successfully!');
    console.log(`📊 Total users: ${result.rows.length}`);
  } catch (error) {
    console.error('❌ Error querying users:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the query
queryUsers();
