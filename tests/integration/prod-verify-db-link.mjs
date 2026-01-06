import postgres from 'postgres';

const API_BASE = (process.env.API_BASE_URL || 'https://ticket-apw-api.vercel.app/api').trim().replace(/\/+$/, '');
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

function randEmail() {
  const ts = Date.now();
  return `smoke.test.${ts}@example.com`;
}

async function httpJson(path, init) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, init);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { url, res, body };
}

async function run() {
  const email = randEmail();
  const password = 'Temp#12345';
  const name = 'API-DB Link Probe';
  console.log('Probe email:', email);

  // 1) Register via API
  const reg = await httpJson('/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  console.log('API register:', { status: reg.res.status, body: reg.body });
  if (!(reg.res.status === 201 || reg.res.status === 200)) {
    console.log('Registration did not succeed, aborting verification.');
    process.exit(1);
  }

  // 2) Check in Neon DB
  const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 });
  try {
    const rows = await sql`select id, email, name, role, is_active from users where lower(email)=lower(${email}) limit 1`;
    console.log('DB lookup:', rows);
    const linked = rows.length === 1;
    console.log('VERDICT:', linked ? 'API uses this Neon database' : 'API does NOT use this Neon database');

    // 3) Cleanup inserted user (optional)
    if (linked) {
      await sql`delete from users where lower(email)=lower(${email})`;
      console.log('Cleanup: deleted probe user');
    }
    process.exit(linked ? 0 : 2);
  } finally {
    await sql.end({ timeout: 2 });
  }
}

run().catch((e) => { console.error('Error:', e.message); process.exit(1); });
