// backend/db/seed-data-only.js
// Seed only projects, tasks, expenses, clients without touching users

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/schema.js';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';

// Load environment variables from .env.development
config({ path: '.env.development' });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Make sure you have a .env.development file.');
}

const db = drizzle(postgres(DATABASE_URL, { ssl: 'prefer', max: 1 }), { schema });

const main = async () => {
  console.log('🌱 Starting database seeding (preserving existing users)...');

  try {
    // Only delete projects, tasks, expenses, clients
    console.log('🗑️  Clearing project-related data...');
    await db.delete(schema.tasks);
    await db.delete(schema.projects);
    await db.delete(schema.expenses);
    await db.delete(schema.clients);
    console.log('✅ Project data cleared.');

    // Get existing users (don't delete them)
    console.log('👥 Getting existing users...');
    const existingUsers = await db.select().from(schema.users).limit(10);
    console.log(`✅ Found ${existingUsers.length} existing users.`);
    
    const adminUser = existingUsers[0] || { id: 'default-admin' };
    const managerUser = existingUsers[1] || { id: 'default-manager' };
    const employeeUser = existingUsers[2] || { id: 'default-employee' };

    // --------------------
    // Seeding Clients
    // --------------------
    console.log('🏢 Seeding clients...');
    const clients = await db.insert(schema.clients).values([
      { 
        name: 'Innovate Corp',
        email: 'contact@innovatecorp.com',
        phone: '+1-555-0101',
        address: '123 Tech Street, San Francisco, CA',
      },
      { 
        name: 'Quantum Solutions',
        email: 'info@quantumsol.com',
        phone: '+1-555-0102',
        address: '456 Logic Ave, Boston, MA',
      },
      { 
        name: 'Digital Transformation Ltd',
        email: 'hello@digitrans.io',
        phone: '+1-555-0103',
        address: '789 Future Blvd, Seattle, WA',
      },
    ]).returning();
    console.log(`✅ ${clients.length} clients seeded.`);

    // --------------------
    // Seeding Projects
    // --------------------
    console.log('📁 Seeding projects...');
    const projects = await db.insert(schema.projects).values([
      {
        name: 'Project Phoenix',
        description: 'A revolutionary new platform for enterprise solutions.',
        status: 'active',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        budget: '500000',
        progress: 65,
        managerId: adminUser.id,
        clientId: clients[0].id,
        category: 'Enterprise Solutions',
        priority: 'high',
      },
      {
        name: 'Project Neptune',
        description: 'Advanced data analytics and visualization tool.',
        status: 'active',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-10-30'),
        budget: '350000',
        progress: 45,
        managerId: managerUser.id,
        clientId: clients[1].id,
        category: 'Data Analytics',
        priority: 'high',
      },
      {
        name: 'Project Aurora',
        description: 'Cloud infrastructure modernization.',
        status: 'planning',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        budget: '750000',
        progress: 15,
        managerId: adminUser.id,
        clientId: clients[2].id,
        category: 'Infrastructure',
        priority: 'medium',
      },
      {
        name: 'Project Horizon',
        description: 'Mobile application development.',
        status: 'active',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-09-15'),
        budget: '200000',
        progress: 85,
        managerId: managerUser.id,
        clientId: clients[0].id,
        category: 'Mobile Development',
        priority: 'medium',
      },
    ]).returning();
    console.log(`✅ ${projects.length} projects seeded.`);

    // --------------------
    // Seeding Tasks
    // --------------------
    console.log('✅ Seeding tasks...');
    const tasks = await db.insert(schema.tasks).values([
      {
        title: 'Design system architecture',
        description: 'Create comprehensive design system for the platform',
        projectId: projects[0].id,
        status: 'in_progress',
        dueDate: new Date('2024-03-15'),
        assignedTo: managerUser.id,
        createdBy: adminUser.id,
        priority: 'high',
      },
      {
        title: 'Backend API development',
        description: 'Build REST API endpoints for core features',
        projectId: projects[0].id,
        status: 'in_progress',
        dueDate: new Date('2024-04-30'),
        assignedTo: employeeUser.id,
        createdBy: adminUser.id,
        priority: 'high',
      },
      {
        title: 'Frontend UI implementation',
        description: 'Implement responsive UI components',
        projectId: projects[1].id,
        status: 'in_progress',
        dueDate: new Date('2024-05-15'),
        assignedTo: existingUsers[3]?.id || adminUser.id,
        createdBy: adminUser.id,
        priority: 'medium',
      },
      {
        title: 'Database optimization',
        description: 'Optimize database queries and indexes',
        projectId: projects[1].id,
        status: 'todo',
        dueDate: new Date('2024-06-30'),
        assignedTo: adminUser.id,
        createdBy: adminUser.id,
        priority: 'medium',
      },
      {
        title: 'Security audit',
        description: 'Conduct comprehensive security audit',
        projectId: projects[0].id,
        status: 'todo',
        dueDate: new Date('2024-07-15'),
        assignedTo: managerUser.id,
        createdBy: adminUser.id,
        priority: 'high',
      },
      {
        title: 'Unit tests',
        description: 'Write comprehensive unit tests',
        projectId: projects[2].id,
        status: 'todo',
        dueDate: new Date('2024-08-15'),
        assignedTo: employeeUser.id,
        createdBy: adminUser.id,
        priority: 'medium',
      },
      {
        title: 'Documentation',
        description: 'Create API and system documentation',
        projectId: projects[3].id,
        status: 'in_progress',
        dueDate: new Date('2024-09-01'),
        assignedTo: adminUser.id,
        createdBy: adminUser.id,
        priority: 'low',
      },
    ]).returning();
    console.log(`✅ ${tasks.length} tasks seeded.`);

    // --------------------
    // Seeding Expenses
    // --------------------
    console.log('💰 Seeding expenses...');
    const expenses = await db.insert(schema.expenses).values([
      {
        description: 'Annual software licenses for development tools',
        projectId: projects[0].id,
        userId: adminUser.id,
        amount: '15000',
        category: 'equipment',
        status: 'approved',
        date: new Date('2024-01-10'),
        approvedBy: managerUser.id,
      },
      {
        description: 'Development server and workstations',
        projectId: projects[0].id,
        userId: managerUser.id,
        amount: '45000',
        category: 'equipment',
        status: 'approved',
        date: new Date('2024-01-15'),
        approvedBy: adminUser.id,
      },
      {
        description: 'Team training for new technologies',
        projectId: projects[1].id,
        userId: employeeUser.id,
        amount: '8500',
        category: 'training',
        status: 'pending',
        date: new Date('2024-02-20'),
      },
      {
        description: 'Client meeting and conference attendance',
        projectId: projects[0].id,
        userId: managerUser.id,
        amount: '12000',
        category: 'travel',
        status: 'approved',
        date: new Date('2024-03-01'),
        approvedBy: adminUser.id,
      },
      {
        description: 'Cloud platform costs',
        projectId: projects[2].id,
        userId: adminUser.id,
        amount: '5500',
        category: 'equipment',
        status: 'approved',
        date: new Date('2024-03-10'),
        approvedBy: managerUser.id,
      },
      {
        description: 'Office supplies and materials',
        projectId: projects[1].id,
        userId: employeeUser.id,
        amount: '2300',
        category: 'supplies',
        status: 'pending',
        date: new Date('2024-03-15'),
      },
    ]).returning();
    console.log(`✅ ${expenses.length} expenses seeded.`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`
✅ Clients created: ${clients.length}
✅ Projects created: ${projects.length}
✅ Tasks created: ${tasks.length}
✅ Expenses created: ${expenses.length}
✅ Existing users preserved: ${existingUsers.length}

Your dropdowns should now work!
Navigate to https://i-projects.skin/projects to verify.
    `);

  } catch (error) {
    console.error('❌ An error occurred during database seeding:');
    console.error(error);
    process.exit(1);
  }
};

main();
