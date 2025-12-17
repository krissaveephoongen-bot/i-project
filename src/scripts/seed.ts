import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../lib/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/project_management',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (optional - comment out if you want to preserve data)
    // await db.delete(schema.activityLog);
    // await db.delete(schema.tasks);
    // await db.delete(schema.projects);
    // await db.delete(schema.users);

    // Create sample users
    console.log('👥 Creating users...');
    const users = await db
      .insert(schema.users)
      .values([
        {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          role: 'admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        },
        {
          name: 'Bob Smith',
          email: 'bob@example.com',
          role: 'manager',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        },
        {
          name: 'Carol White',
          email: 'carol@example.com',
          role: 'user',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
        },
        {
          name: 'David Brown',
          email: 'david@example.com',
          role: 'user',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        },
        {
          name: 'Eva Davis',
          email: 'eva@example.com',
          role: 'user',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva',
        },
      ])
      .returning();

    console.log(`✅ Created ${users.length} users`);

    // Create sample projects
    console.log('📁 Creating projects...');
    const now = new Date();
    const projects = await db
      .insert(schema.projects)
      .values([
        {
          name: 'Website Redesign',
          description: 'Complete redesign of the company website',
          status: 'in_progress',
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
          managerId: users[0].id,
        },
        {
          name: 'Mobile App Development',
          description: 'Native iOS and Android apps',
          status: 'in_progress',
          startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
          managerId: users[1].id,
        },
        {
          name: 'Database Migration',
          description: 'Migrate from MySQL to PostgreSQL',
          status: 'todo',
          startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
          managerId: users[0].id,
        },
      ])
      .returning();

    console.log(`✅ Created ${projects.length} projects`);

    // Create sample tasks
    console.log('📋 Creating tasks...');
    const tasks = await db
      .insert(schema.tasks)
      .values([
        {
          title: 'Design homepage mockup',
          description: 'Create high-fidelity mockups for the new homepage',
          status: 'done',
          priority: 'high',
          projectId: projects[0].id,
          assignedTo: users[2].id,
          createdBy: users[0].id,
          dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Setup development environment',
          description: 'Configure Node.js, React, and development tools',
          status: 'done',
          priority: 'high',
          projectId: projects[1].id,
          assignedTo: users[3].id,
          createdBy: users[1].id,
          dueDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Create user authentication screens',
          description: 'Build login, signup, and password reset screens',
          status: 'in_progress',
          priority: 'high',
          projectId: projects[1].id,
          assignedTo: users[2].id,
          createdBy: users[1].id,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Write API documentation',
          description: 'Document all REST API endpoints',
          status: 'in_progress',
          priority: 'medium',
          projectId: projects[0].id,
          assignedTo: users[4].id,
          createdBy: users[0].id,
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Performance optimization',
          description: 'Optimize database queries and frontend performance',
          status: 'todo',
          priority: 'medium',
          projectId: projects[1].id,
          assignedTo: users[3].id,
          createdBy: users[1].id,
          dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Plan migration strategy',
          description: 'Create detailed plan for database migration',
          status: 'todo',
          priority: 'high',
          projectId: projects[2].id,
          assignedTo: users[2].id,
          createdBy: users[0].id,
          dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        },
      ])
      .returning();

    console.log(`✅ Created ${tasks.length} tasks`);

    // Create activity logs
    console.log('📊 Creating activity logs...');
    await db
      .insert(schema.activityLog)
      .values([
        {
          entityType: 'project',
          entityId: projects[0].id,
          type: 'create',
          action: `Created project "${projects[0].name}"`,
          userId: users[0].id,
        },
        {
          entityType: 'task',
          entityId: tasks[0].id,
          type: 'create',
          action: `Created task "${tasks[0].title}"`,
          userId: users[0].id,
        },
        {
          entityType: 'task',
          entityId: tasks[0].id,
          type: 'status_change',
          action: 'Marked task as done',
          description: 'Status changed from in_progress to done',
          userId: users[2].id,
        },
      ]);

    console.log('✅ Created activity logs');

    console.log('✨ Database seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
