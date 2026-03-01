const { Client } = require('pg');

// Use the connection string
const connectionString = "postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function forceReloadSchema() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Force schema reload by altering table comment
    const timestamp = new Date().toISOString();
    const sql = `
      COMMENT ON TABLE clients IS 'Client organizations and contacts (Force Reloaded at ${timestamp})';
    `;
    
    console.log('--- Forcing Schema Reload by Updating Table Comment ---');
    console.log(`Timestamp: ${timestamp}`);
    await client.query(sql);
    console.log('Table comment updated successfully.');
    console.log('This operation forces PostgREST to refresh its schema cache.');

  } catch (err) {
    console.error('Error executing schema reload:', err);
  } finally {
    await client.end();
  }
}

forceReloadSchema();
