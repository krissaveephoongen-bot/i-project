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
  {
    id: 'cc4d0a66-5984-459f-92d8-32d4563bf9f1',
    email: 'pratya.fu@appworks.co.th',
    password: 'AppWorks@123!',
    name: 'Pratya Fufueng',
    role: 'manager',
    position: 'Senior Project Manager',
    department: 'Project management',
  },
];

async function addTestUsers() {
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
    console.log('Adding test users...\n');

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      try {
        const result = await client.query(
          `INSERT INTO "users" (id, name, email, password, role, position, department, "isActive", status, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
           ON CONFLICT (email) DO UPDATE SET password = $4
           RETURNING id, email, name`,
          [user.id, user.name, user.email, hashedPassword, user.role, user.position, user.department, true, 'active']
        );

        console.log(`✓ Added user: ${user.email}`);
      } catch (error) {
        console.error(`✗ Error adding user ${user.email}:`, error.message);
      }
    }

    console.log('\n✓ Test users setup complete!');
    console.log('\nYou can now login with:');
    testUsers.forEach(user => {
      console.log(`\n  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addTestUsers();
