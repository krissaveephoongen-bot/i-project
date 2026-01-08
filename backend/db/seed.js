// backend/db/seed.js
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/schema.js';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables from .env.development
config({ path: '.env.development' });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Make sure you have a .env.development file.');
}

const db = drizzle(postgres(DATABASE_URL, { ssl: 'prefer', max: 1 }), { schema });

const main = async () => {
  console.log('🌱 Starting database seeding...');

  try {
    // --------------------
    // Deleting existing data
    // --------------------
    console.log('🗑️  Deleting existing data...');
    await db.delete(schema.tasks);
    await db.delete(schema.projects);
    await db.delete(schema.clients);
    await db.delete(schema.users);
    console.log('✅ Existing data deleted.');

    // --------------------
    // Seeding Users
    // --------------------
    console.log('👤 Seeding users...');
    const hashedPassword = await bcrypt.hash('AppWorks@123!', 10);
    const users = await db.insert(schema.users).values([
      {
        name: 'Admin User',
        email: 'jakgrits.ph@appworks.co.th',
        password: hashedPassword,
        role: 'admin',
        position: 'System Administrator',
      },
      {
        name: 'Manager Mike',
        email: 'manager@example.com',
        password: hashedPassword,
        role: 'manager',
        position: 'Project Manager',
      },
      {
        name: 'Employee Emma',
        email: 'employee@example.com',
        password: hashedPassword,
        role: 'employee',
        position: 'Software Engineer',
      },
    ]).returning();
    console.log(`✅ ${users.length} users seeded.`);
    const adminUser = users.find(u => u.role === 'admin');
    const managerUser = users.find(u => u.role === 'manager');
    const employeeUser = users.find(u => u.role === 'employee');

    // --------------------
    // Seeding Clients
    // --------------------
    console.log('🏢 Seeding clients...');
    const clients = await db.insert(schema.clients).values([
      { name: 'Innovate Corp' },
      { name: 'Quantum Solutions' },
    ]).returning();
    console.log(`✅ ${clients.length} clients seeded.`);

    // --------------------
    // Seeding Projects
    // --------------------
    console.log('📁 Seeding projects...');
    const projects = await db.insert(schema.projects).values([
      {
        name: 'Project Phoenix',
        description: 'A revolutionary new platform for enterprise.',
        status: 'in_progress',
        budget: '100000',
        managerId: managerUser.id,
        clientId: clients[0].id,
      },
      {
        name: 'Project Neptune',
        description: 'Data analytics and visualization tool.',
        status: 'todo',
        budget: '75000',
        managerId: managerUser.id,
        clientId: clients[1].id,
      },
    ]).returning();
    console.log(`✅ ${projects.length} projects seeded.`);

    // --------------------
    // Seeding Tasks
    // --------------------
    console.log('✓ Seeding tasks...');
    const tasks = await db.insert(schema.tasks).values([
      // Tasks for Project Phoenix
      {
        title: 'Design UI/UX Mockups',
        projectId: projects[0].id,
        status: 'done',
        priority: 'high',
        assignedTo: employeeUser.id,
        createdBy: managerUser.id,
      },
      {
        title: 'Develop Authentication Module',
        projectId: projects[0].id,
        status: 'in_progress',
        priority: 'high',
        assignedTo: employeeUser.id,
        createdBy: managerUser.id,
      },
      {
        title: 'Setup Database Schema',
        projectId: projects[0].id,
        status: 'in_review',
        priority: 'medium',
        assignedTo: employeeUser.id,
        createdBy: managerUser.id,
      },
      // Tasks for Project Neptune
      {
        title: 'Integrate with Data Warehouse',
        projectId: projects[1].id,
        status: 'todo',
        priority: 'high',
        assignedTo: employeeUser.id,
        createdBy: managerUser.id,
      },
      {
        title: 'Create Charting Components',
        projectId: projects[1].id,
        status: 'todo',
        priority: 'medium',
        assignedTo: employeeUser.id,
        createdBy: managerUser.id,
      },
    ]).returning();
    console.log(`✅ ${tasks.length} tasks seeded.`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ An error occurred during database seeding:');
    console.error(error);
    process.exit(1);
  } finally {
    console.log('🔚 Seeding script finished.');
    // The script should exit automatically. If it hangs, we might need to explicitly close the connection.
  }
};

main();
