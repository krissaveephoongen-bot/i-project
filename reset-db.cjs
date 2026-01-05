const { Client } = require('pg');
require('dotenv').config();

async function resetDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    console.log('Dropping all tables...\n');

    // Drop tables in correct order (respecting foreign key dependencies)
    const tables = [
      'comments',
      'activity_log',
      'budget_revisions',
      'expenses',
      'time_entries',
      'tasks',
      'projects',
      'clients',
      'users',
    ];

    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`✓ Dropped table: ${table}`);
      } catch (error) {
        console.log(`✓ Table already dropped: ${table}`);
      }
    }

    console.log('\n✓ All tables dropped successfully!');
    console.log('\nNow run: npx drizzle-kit push');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
