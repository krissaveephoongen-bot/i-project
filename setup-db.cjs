const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const testUsers = [
  {
    id: '0dfc2e1b-0d5f-40e2-99ca-0721ea5ec8dc',
    email: 'jakgrits.ph@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Jakgrits Phoongen',
    role: 'admin',
    position: 'Project Manager',
    department: 'Project management',
  },
  {
    id: '82df756a-4d46-4e49-b927-bb165d7dc489',
    email: 'thanongsak.th@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Thanongsak Thongkwid',
    role: 'manager',
    position: 'Vice President',
    department: 'Project management',
  },
];

async function setupDatabase() {
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
    console.log('Setting up database tables...\n');

    // Create users table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
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
    `);

    console.log('✓ Users table created/verified\n');

    console.log('Adding test users...\n');

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await client.query(
        `INSERT INTO "users" (id, name, email, password, role, position, department, "isActive", status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO UPDATE SET password = $4, role = $5
         RETURNING id, email, name`,
        [user.id, user.name, user.email, hashedPassword, user.role, user.position, user.department, true, 'active']
      );

      console.log(`✓ Added/Updated user: ${user.email}`);
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
    await client.end();
  }
}

setupDatabase();
