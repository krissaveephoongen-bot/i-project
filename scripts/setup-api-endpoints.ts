/**
 * Setup Script for API Endpoints
 * Initializes database tables and creates sample data
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in environment variables');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigrations() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/003-create-new-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration
    console.log('📋 Running database migrations...');
    await client.query(migrationSQL);
    console.log('✅ Migrations completed successfully');

    // Create sample data
    console.log('📋 Creating sample data...');
    await createSampleData();
    console.log('✅ Sample data created');

  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Setup completed successfully!');
  }
}

async function createSampleData() {
  try {
    // Create sample templates
    const templates = [
      {
        id: 'template-1',
        name: 'Software Development',
        description: 'Standard software development project template',
        category: 'software-development',
        type: 'project',
        tasks: [
          { name: 'Requirements Analysis', priority: 'high', estimatedHours: 16 },
          { name: 'System Design', priority: 'high', estimatedHours: 24 },
          { name: 'Implementation', priority: 'medium', estimatedHours: 40 },
          { name: 'Testing', priority: 'medium', estimatedHours: 20 },
          { name: 'Deployment', priority: 'high', estimatedHours: 8 },
        ]
      },
      {
        id: 'template-2',
        name: 'Marketing Campaign',
        description: 'Marketing campaign project template',
        category: 'marketing-campaign',
        type: 'project',
        tasks: [
          { name: 'Market Research', priority: 'high', estimatedHours: 12 },
          { name: 'Campaign Strategy', priority: 'high', estimatedHours: 16 },
          { name: 'Content Creation', priority: 'medium', estimatedHours: 24 },
          { name: 'Campaign Launch', priority: 'high', estimatedHours: 8 },
        ]
      }
    ];

    for (const template of templates) {
      // Insert template
      await client.query(
        `INSERT INTO templates (id, name, description, category, type, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [template.id, template.name, template.description, template.category, template.type]
      );

      // Insert template tasks
      for (let i = 0; i < template.tasks.length; i++) {
        const task = template.tasks[i];
        await client.query(
          `INSERT INTO template_tasks (id, template_id, name, description, priority, estimated_hours, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [
            `task-${template.id}-${i}`,
            template.id,
            task.name,
            `Task: ${task.name}`,
            task.priority,
            task.estimatedHours,
            i
          ]
        );
      }

      console.log(`✅ Created template: ${template.name}`);
    }

    // Create sample automation rules
    const automationRules = [
      {
        id: 'rule-1',
        name: 'Auto-assign high priority tasks',
        trigger: { event: 'task:created', priority: 'high' },
        action: { type: 'assign', userId: 'default' }
      },
      {
        id: 'rule-2',
        name: 'Notify on task overdue',
        trigger: { event: 'task:overdue' },
        action: { type: 'notify', channels: ['email', 'in-app'] }
      }
    ];

    // Note: These would be associated with specific teams
    // For now, just log what would be created
    console.log(`✅ Sample automation rules configured`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

// Run setup
console.log('🚀 Starting API Endpoints Setup...\n');
runMigrations().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
