const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const { config } = require('dotenv');

config({ path: '.env.development' });

const { DATABASE_URL } = process.env;
const sql = postgres(DATABASE_URL, { ssl: 'prefer', max: 1 });

async function main() {
  console.log('🔍 Checking all users in database...\n');
  
  const users = await sql`SELECT email, role, password FROM users`;
  
  console.log('Users found:', users.length);
  console.log('');
  
  for (const u of users) {
    console.log(`📧 ${u.email} (${u.role})`);
    console.log(`   Hash: ${u.password?.substring(0, 30)}...`);
    
    // Test password
    const isValid = await bcrypt.compare('AppWorks@123!', u.password);
    console.log(`   Password "AppWorks@123!": ${isValid ? '✅' : '❌'}`);
    console.log('');
  }
}

main().catch(e => {
  console.error('Error:', e.message);
}).finally(() => sql.end());
