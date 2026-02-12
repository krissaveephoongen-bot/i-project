const { db } = require('./lib/db');
const { users } = require('./lib/schema');
const { eq } = require('drizzle-orm');

async function main() {
  // Correct hash for "AppWorks@123!"
  const correctHash = '$2b$10$2HPQ1EDY3iZqBNrOG5wdbO6CRhY/LqOejv/eNyhz2WHKmHCGwlnV2';
  
  // Update jakgrits.ph
  const result = await db
    .update(users)
    .set({ password: correctHash })
    .where(eq(users.email, 'jakgrits.ph@appworks.co.th'));
  
  console.log('✅ jakgrits.ph password updated, rows:', result.rowCount);
  
  // Also update employee@company
  const result2 = await db
    .update(users)
    .set({ password: correctHash })
    .where(eq(users.email, 'employee@company.com'));
  
  console.log('✅ employee@company.com password updated, rows:', result2.rowCount);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
