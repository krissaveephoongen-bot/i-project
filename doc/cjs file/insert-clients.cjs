const { Client } = require('pg');

// Use the connection string
const connectionString = "postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function insertClients() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const clients = [
      {
        name: 'กรมทางหลวง',
        email: 'saraban@doh.go.th',
        phone: '02-354-6668',
        taxId: '0994000160237',
        address: '2/486 ถนนศรีอยุธยา แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400'
      },
      {
        name: 'กรมทางหลวงชนบท',
        email: 'saraban@drr.go.th',
        phone: '02-551-5000',
        taxId: '0994000160245',
        address: '9 ถนนพหลโยธิน แขวงอนุสาวรีย์ เขตบางเขน กรุงเทพฯ 10220'
      }
    ];

    for (const c of clients) {
        const query = `
            INSERT INTO clients (name, email, phone, "taxId", address)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name;
        `;
        const values = [c.name, c.email, c.phone, c.taxId, c.address];
        
        try {
            const res = await client.query(query, values);
            console.log(`✅ Inserted client: ${res.rows[0].name} (ID: ${res.rows[0].id})`);
        } catch (insertErr) {
            console.error(`❌ Failed to insert ${c.name}:`, insertErr.message);
        }
    }

  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

insertClients();
