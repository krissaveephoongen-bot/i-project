import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';

dotenv.config();

async function initFreshDatabase() {
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
    console.log('🆕 Initializing fresh database with default data...\n');

    // Create initial admin user
    console.log('Creating admin user...');
    const adminUser = await db.execute(sql`
      INSERT INTO users (name, email, role, created_at, updated_at)
      VALUES ('Administrator', 'admin@local.dev', 'admin', NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email;
    `);
    console.log('✅ Admin user created/exists');

    // Create sample team members
    console.log('Creating sample team members...');
    const users = [
      { name: 'John Manager', email: 'john@local.dev', role: 'manager' },
      { name: 'Sarah Developer', email: 'sarah@local.dev', role: 'developer' },
      { name: 'Mike Designer', email: 'mike@local.dev', role: 'designer' },
      { name: 'Lisa Developer', email: 'lisa@local.dev', role: 'developer' },
    ];

    for (const user of users) {
      try {
        await db.execute(sql`
          INSERT INTO users (name, email, role, created_at, updated_at)
          VALUES (${user.name}, ${user.email}, ${user.role}, NOW(), NOW())
          ON CONFLICT (email) DO NOTHING;
        `);
        console.log(`  ✅ ${user.name} (${user.email})`);
      } catch (e) {
        console.log(`  ℹ️  ${user.email} already exists`);
      }
    }

    // Create sample clients
    console.log('\nCreating sample clients...');
    const clients = [
      {
        name: 'TechCorp Solutions',
        email: 'contact@techcorp.local',
        phone: '(555) 123-4567',
        industry: 'Technology',
      },
      {
        name: 'Digital Marketing Inc',
        email: 'hello@digital.local',
        phone: '(555) 234-5678',
        industry: 'Marketing',
      },
      {
        name: 'Retail Plus',
        email: 'info@retailplus.local',
        phone: '(555) 345-6789',
        industry: 'Retail',
      },
    ];

    for (const client of clients) {
      try {
        await db.execute(sql`
          INSERT INTO clients (name, email, phone, industry, created_at, updated_at)
          VALUES (${client.name}, ${client.email}, ${client.phone}, ${client.industry}, NOW(), NOW())
          ON CONFLICT DO NOTHING;
        `);
        console.log(`  ✅ ${client.name}`);
      } catch (e) {
        console.log(`  ℹ️  ${client.name} already exists`);
      }
    }

    console.log('\n✨ ✨ ✨ FRESH DATABASE INITIALIZED ✨ ✨ ✨\n');
    console.log('Initial data:');
    console.log('  • 1 Admin user');
    console.log('  • 4 Team members');
    console.log('  • 3 Sample clients');
    console.log('\nYou can now create your first project!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initFreshDatabase().catch(console.error);
