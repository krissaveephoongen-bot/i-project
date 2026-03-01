const { db } = require('./lib/db');
const { users } = require('./lib/schema');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');

async function fixPassword() {
  console.log('🔧 Fixing password for jakgrits.ph@appworks.co.th...\n');
  
  const correctHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  
  // Update password
  const result = await db
    .update(users)
    .set({ password: correctHash })
    .where(eq(users.email, 'jakgrits.ph@appworks.co.th'));
  
  console.log('✅ Password updated in database');
  console.log('Affected rows:', result.rowCount);
  
  // Verify
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'jakgrits.ph@appworks.co.th'));
  
  console.log('\n📋 User verification:');
  console.log('Email:', user.email);
  console.log('Password hash:', user.password);
  
  // Test password
  const testPassword = 'AppWorks@123!';
  const isValid = await bcrypt.compare(testPassword, user.password);
  console.log('\n🔐 Password validation:');
  console.log('Test password:', testPassword);
  console.log('Is valid:', isValid);
  
  if (isValid) {
    console.log('\n✅ Login should now work!');
  } else {
    console.log('\n❌ Password still not matching');
  }
}

fixPassword().catch(console.error);
