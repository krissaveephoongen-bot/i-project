const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const { config } = require('dotenv');

config({ path: '.env.development' });

const { DATABASE_URL } = process.env;
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
