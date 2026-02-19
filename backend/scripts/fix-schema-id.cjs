const { Client } = require('pg');

// Use the connection string
const connectionString = "postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function fixSchemaId() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Fix ID column default value
    const sql = `
      ALTER TABLE clients ALTER COLUMN id SET DEFAULT gen_random_uuid();
    `;
    console.log('--- Fixing "id" column default value ---');
    await client.query(sql);
    console.log('Updated "id" column to use gen_random_uuid() by default.');

  } catch (err) {
    console.error('Error fixing schema:', err);
  } finally {
    await client.end();
  }
}

fixSchemaId();
