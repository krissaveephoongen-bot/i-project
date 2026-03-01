const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const sql = postgres(DATABASE_URL, { ssl: 'prefer', max: 1 });

async function main() {
  console.log('🔍 Verifying all users password...\n');
  
  const users = await sql`SELECT email, role, password FROM users`;
  
  console.log(`Found ${users.length} users\n`);
  
  let allValid = true;
  for (const u of users) {
    const isValid = await bcrypt.compare('AppWorks@123!', u.password);
    console.log(`${isValid ? '✅' : '❌'} ${u.email} (${u.role})`);
    if (!isValid) allValid = false;
  }
  
  console.log(`\n${allValid ? '✅ All passwords are correct!' : '❌ Some passwords are incorrect'}`);
}

main()
  .catch(e => console.error('Error:', e.message))
  .finally(() => sql.end());
