import postgres from 'postgres';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const testUsers = [
  {
    id: '0dfc2e1b-0d5f-40e2-99ca-0721ea5ec8dc',
    email: 'jakgrits.ph@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Jakgrits Phoongen',
    role: 'admin',
  },
  {
    id: '82df756a-4d46-4e49-b927-bb165d7dc489',
    email: 'thanongsak.th@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Thanongsak Thongkwid',
    role: 'manager',
  },
];

async function resetDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    console.log('Dropping all tables...\n');

    // Drop tables in correct order
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
        await sql`DROP TABLE IF EXISTS ${sql(table)} CASCADE`;
        console.log(`✓ Dropped table: ${table}`);
      } catch (error) {
        console.log(`  (table already dropped)`);
      }
    }

    console.log('\n✓ All tables dropped successfully!');
    console.log('\nCreating users table...\n');

    // Create users table
    await sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "objectId" TEXT UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'employee',
        avatar TEXT,
        department TEXT,
        position TEXT,
        "employeeCode" TEXT,
        "hourlyRate" NUMERIC(10, 2) DEFAULT '0.00',
        phone TEXT,
        status TEXT DEFAULT 'active',
        "isActive" BOOLEAN DEFAULT true,
        "isDeleted" BOOLEAN DEFAULT false,
        "failedLoginAttempts" INTEGER DEFAULT 0,
        "lastLogin" TIMESTAMP,
        "lockedUntil" TIMESTAMP,
        "resetToken" TEXT,
        "resetTokenExpiry" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    console.log('✓ Users table created\n');
    console.log('Adding test users...\n');

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await sql`
        INSERT INTO users (id, name, email, password, role, "isActive", status)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword}, ${user.role}, true, 'active')
        ON CONFLICT (email) DO UPDATE SET password = ${hashedPassword}
      `;

      console.log(`✓ Added user: ${user.email}`);
    }

    console.log('\n✓ Database setup complete!');
    console.log('\nYou can now login with:');
    testUsers.forEach(user => {
      console.log(`\n  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

resetDatabase();
