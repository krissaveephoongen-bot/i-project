import { Client } from '@neondatabase/serverless';

const client = new Client('postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Add missing columns one by one
    const columns = [
      'is_project_manager boolean DEFAULT false',
      'is_supervisor boolean DEFAULT false',
      'notification_preferences jsonb',
      'timezone text DEFAULT \'Asia/Bangkok\''
    ];

    for (const col of columns) {
      try {
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col}`);
        console.log('Added column:', col.split(' ')[0]);
      } catch (e) {
        console.log('Column exists or error:', e.message.split('\n')[0]);
      }
    }

    // Verify columns
    const r = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY column_name");
    console.log('\nUsers table columns:', r.rows.map(x => x.column_name).join(', '));

    console.log('\nMigration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
