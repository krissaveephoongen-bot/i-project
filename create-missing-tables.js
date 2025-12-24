const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function createMissingTables() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        budget DECIMAL(12, 2),
        created_by UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ projects table created');

    // Create project_tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        assigned_to UUID,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ project_tasks table created');

    // Create time_entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id),
        task_id UUID REFERENCES project_tasks(id),
        user_id UUID REFERENCES "User"(id),
        date DATE NOT NULL,
        hours DECIMAL(5, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ time_entries table created');

    // Create worklogs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS worklogs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES "User"(id),
        project_id UUID REFERENCES projects(id),
        task_id UUID REFERENCES project_tasks(id),
        date DATE NOT NULL,
        hours DECIMAL(5, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ worklogs table created');

    // Create teams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by UUID REFERENCES "User"(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ teams table created');

    // Create team_members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id),
        user_id UUID NOT NULL REFERENCES "User"(id),
        role VARCHAR(50),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, user_id)
      );
    `);
    console.log('✓ team_members table created');

    console.log('\n✅ All tables created successfully!');
    await client.end();
  } catch (error) {
    console.error('Error:', error);
    await client.end();
    process.exit(1);
  }
}

createMissingTables();
