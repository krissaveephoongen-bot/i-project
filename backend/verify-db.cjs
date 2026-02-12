const postgres = require('postgres');
const { config } = require('dotenv');

config({ path: '.env.development' });

const { DATABASE_URL } = process.env;
const sql = postgres(DATABASE_URL, { ssl: 'prefer', max: 1 });

async function main() {
  console.log('🔍 Checking database connection...\n');
  console.log('DATABASE_URL:', DATABASE_URL?.substring(0, 50) + '...\n');
  
  const users = await sql`SELECT email, role FROM users`;
  console.log(`✅ Connected! Found ${users.length} users:\n`);
  
  users.forEach(u => console.log(`  - ${u.email} (${u.role})`));
}

main()
  .catch(e => console.error('❌ Error:', e.message))
  .finally(() => sql.end());
