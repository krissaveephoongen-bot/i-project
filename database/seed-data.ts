import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/lib/schema';
import { statusEnum, priorityEnum } from '../src/lib/schema';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function seedDatabase() {
  // Get connection string from environment variables
  const connectionString = process.env.DATABASE_URL || 
    'postgres://user:password@localhost:5432/project_management';

  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool, { schema });

  try {
    await db.transaction(async (tx) => {
      console.log('Seeding database with sample data...');

      // Clear existing data
      console.log('Clearing existing data...');
      await tx.delete(schema.tasks).execute();
      await tx.delete(schema.projects).execute();
      await tx.delete(schema.users).execute();

      // Create sample users
      console.log('Creating sample users...');
      const users = [
        {
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        {
          name: 'Project Manager',
          email: 'pm@example.com',
          role: 'user',
        },
        {
          name: 'Developer One',
          email: 'dev1@example.com',
          role: 'user',
        },
        {
          name: 'Developer Two',
          email: 'dev2@example.com',
          role: 'user',
        },
      ];

      const createdUsers = await Promise.all(
        users.map(user => 
          tx.insert(schema.users)
            .values(user)
            .returning()
            .then(res => res[0])
        )
      );

      // Create sample projects
      console.log('Creating sample projects...');
      const projects = [
        {
          name: 'Website Redesign',
          description: 'Complete redesign of the company website with modern UI/UX',
          status: 'in_progress' as const,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          managerId: createdUsers[1].id,
        },
        {
          name: 'Mobile App Development',
          description: 'Build a cross-platform mobile application',
          status: 'todo' as const,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          managerId: createdUsers[1].id,
        },
      ];

      const createdProjects = await Promise.all(
        projects.map(project =>
          tx.insert(schema.projects)
            .values(project)
            .returning()
            .then(res => res[0])
        )
      );

      // Create sample tasks
      console.log('Creating sample tasks...');
      const tasks = [
        // Tasks for Website Redesign
        {
          title: 'Design Homepage',
          description: 'Create wireframes and mockups for the homepage',
          status: 'in_progress' as const,
          priority: 'high' as const,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          projectId: createdProjects[0].id,
          assignedTo: createdUsers[2].id,
          createdBy: createdUsers[1].id,
        },
        {
          title: 'Implement Authentication',
          description: 'Set up user authentication system',
          status: 'todo' as const,
          priority: 'high' as const,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          projectId: createdProjects[0].id,
          assignedTo: createdUsers[3].id,
          createdBy: createdUsers[1].id,
        },
        // Tasks for Mobile App
        {
          title: 'Set up Development Environment',
          description: 'Configure React Native development environment',
          status: 'todo' as const,
          priority: 'medium' as const,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          projectId: createdProjects[1].id,
          assignedTo: createdUsers[2].id,
          createdBy: createdUsers[1].id,
        },
      ];

      await Promise.all(
        tasks.map(task =>
          tx.insert(schema.tasks)
            .values(task)
            .returning()
        )
      );

      console.log('Database seeded successfully!');
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase().catch(console.error);
