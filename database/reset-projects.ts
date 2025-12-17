import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';

dotenv.config();

async function resetProjects() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgres://user:password@localhost:5432/project_management';

  console.log('🔌 Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

  const db = drizzle(pool);

  try {
    console.log('🧹 Cleaning up all project-related data...\n');

    // Delete in order of dependencies
    console.log('Deleting comments...');
    await db.execute(sql`DELETE FROM comments;`);

    console.log('Deleting activity logs...');
    await db.execute(sql`DELETE FROM activity_log;`);

    console.log('Deleting budget revisions...');
    await db.execute(sql`DELETE FROM budget_revisions;`);

    console.log('Deleting expenses...');
    await db.execute(sql`DELETE FROM expenses;`);

    console.log('Deleting time entries...');
    await db.execute(sql`DELETE FROM time_entries;`);

    console.log('Deleting tasks...');
    await db.execute(sql`DELETE FROM tasks;`);

    console.log('Deleting projects...');
    await db.execute(sql`DELETE FROM projects;`);

    console.log('Deleting clients...');
    await db.execute(sql`DELETE FROM clients;`);

    // Keep users for re-initialization

    console.log('\n✨ ✨ ✨ ALL PROJECT DATA DELETED ✨ ✨ ✨\n');
    console.log('Database is now clean and ready for new projects.');
    console.log('Users have been preserved for re-initialization.');
  } catch (error) {
    console.error('❌ Error resetting projects:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetProjects().catch(console.error);
