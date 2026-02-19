const { Client } = require('pg');

// Use the connection string
const connectionString = "postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function fixSchemaTimestamps() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Fix Timestamp columns default values
    const sql = `
      ALTER TABLE clients ALTER COLUMN "createdAt" SET DEFAULT NOW();
      ALTER TABLE clients ALTER COLUMN "updatedAt" SET DEFAULT NOW();
    `;
    console.log('--- Fixing Timestamp columns default values ---');
    await client.query(sql);
    console.log('Updated "createdAt" and "updatedAt" columns to use NOW() by default.');

  } catch (err) {
    console.error('Error fixing schema:', err);
  } finally {
    await client.end();
  }
}

fixSchemaTimestamps();
