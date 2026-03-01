const { Client } = require('pg');

const connectionString =
  process.env.TEST_DATABASE_URL ||
  'postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?uselibpqcompat=true&sslmode=require';

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const res = await client.query('select 1 as ok');
    console.log(res.rows[0]);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
