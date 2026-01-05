import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import * as schema from './src/lib/schema.js';
import dotenv from 'dotenv';

dotenv.config();

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

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    console.log('Adding test users...');

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      try {
        await db.insert(schema.users).values({
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          position: user.position,
          department: user.department,
          isActive: true,
          status: 'active',
        }).onConflictDoNothing();

        console.log(`✓ Added user: ${user.email}`);
      } catch (error) {
        console.log(`✓ User already exists: ${user.email}`);
      }
    }

    console.log('\n✓ Test users setup complete!');
    console.log('\nYou can now login with:');
    testUsers.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}\n`);
    });
  } catch (error) {
    console.error('Error adding test users:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addTestUsers();
