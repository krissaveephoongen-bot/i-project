const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const sql = postgres(DATABASE_URL, { ssl: 'prefer', max: 1 });

async function main() {
  console.log('🔄 Updating all users password to "AppWorks@123!"...\n');
  
  // Get all users
  const users = await sql`SELECT id, email FROM users`;
  console.log(`Found ${users.length} users\n`);
  
  const correctHash = await bcrypt.hash('AppWorks@123!', 10);
  console.log(`New hash: ${correctHash}\n`);
  
  let updated = 0;
  for (const u of users) {
    await sql`UPDATE users SET password = ${correctHash} WHERE id = ${u.id}`;
    console.log(`✅ ${u.email}`);
    updated++;
  }
  
  console.log(`\n📊 Total: ${updated} users updated`);
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => sql.end());
