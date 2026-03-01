const { Client } = require('pg');

// Use the connection string from .env.development or hardcoded if necessary
const connectionString = "postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function reloadSchema() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Force schema reload by altering table comment
    const sql = `
      COMMENT ON TABLE clients IS 'Client organizations and contacts (Schema Reloaded at ${new Date().toISOString()})';
    `;
    console.log('--- Forcing Schema Reload by Commenting ---');
    await client.query(sql);
    console.log('Table comment updated. This should trigger automatic schema reload.');

  } catch (err) {
    console.error('Error reloading schema:', err);
  } finally {
    await client.end();
  }
}

reloadSchema();
