const { db } = require('./lib/db');
const { users } = require('./lib/schema');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');

async function main() {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'jakgrits.ph@appworks.co.th'));
  
  console.log('User email:', user.email);
  console.log('Stored hash:', user.password);
  
  const testPassword = 'AppWorks@123!';
  const isValid = await bcrypt.compare(testPassword, user.password);
  
  console.log('Password test:');
  console.log('  Input:', testPassword);
  console.log('  Match:', isValid);
  
  if (isValid) {
    console.log('\n✅ Login should work now!');
  } else {
    console.log('\n❌ Password still not matching');
  }
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
