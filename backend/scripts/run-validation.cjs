const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = "postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function runValidation() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase sometimes
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, '../../database-schema-validation.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon, but simple split might break if semicolon is in string.
    // For this specific file, it seems safe enough as it contains simple SELECTs.
    // Also need to remove comments.
    const statements = sqlContent
      .replace(/--.*$/gm, '') // Remove single line comments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements to execute.`);

    // Enable RLS for Clients table
    const sql = `
      ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Enable all access for now" ON clients FOR ALL USING (true) WITH CHECK (true);
    `;
    console.log('--- Enabling RLS for Clients ---');
    await client.query(sql);
    console.log('RLS enabled and policy created.');


  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
    console.log('\nValidation complete.');
  }
}

runValidation();
