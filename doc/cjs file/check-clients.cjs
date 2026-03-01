const { Client } = require('pg');

// Use the connection string
const connectionString = "postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function checkClients() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const query = `
      SELECT id, name, email, "taxId", "createdAt"
      FROM clients
      ORDER BY "createdAt" DESC
      LIMIT 5;
    `;
    
    console.log('Executing query:', query);
    const res = await client.query(query);
    
    console.log('\n--- Recent Clients ---');
    if (res.rows.length === 0) {
        console.log("No clients found.");
    } else {
        console.table(res.rows);
    }

  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await client.end();
  }
}

checkClients();
