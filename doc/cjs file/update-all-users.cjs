const { db } = require('./lib/db');
const { users } = require('./lib/schema');
const { eq } = require('drizzle-orm');

const correctHash = '$2b$10$2HPQ1EDY3iZqBNrOG5wdbO6CRhY/LqOejv/eNyhz2WHKmHCGwlnV2';

const userEmails = [
  'thanongsak.th@appworks.co.th',
  'pratya.fu@appworks.co.th',
  'jakgrits.ph@appworks.co.th',
  'employee@company.com'
];

async function main() {
  console.log('🔄 Updating all user passwords...\n');
  
  let updated = 0;
  for (const email of userEmails) {
    const result = await db
      .update(users)
      .set({ password: correctHash })
      .where(eq(users.email, email));
    console.log(`✅ ${email}: ${result.rowCount} row(s) updated`);
    updated += result.rowCount || 0;
  }
  
  console.log(`\n📊 Total: ${updated} user(s) updated`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
