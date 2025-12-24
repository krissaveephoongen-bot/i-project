const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function fixSchema() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if is_deleted column exists in projects table
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='projects' AND column_name='is_deleted'
    `);

    if (result.rows.length === 0) {
      console.log('Adding is_deleted column to projects...');
      await client.query(`
        ALTER TABLE projects 
        ADD COLUMN is_deleted BOOLEAN DEFAULT false
      `);
      console.log('✓ is_deleted column added to projects');
    }

    // Check teams table
    const teamsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='teams' AND column_name='is_deleted'
    `);

    if (teamsResult.rows.length === 0) {
      console.log('Adding is_deleted column to teams...');
      await client.query(`
        ALTER TABLE teams 
        ADD COLUMN is_deleted BOOLEAN DEFAULT false,
        ADD COLUMN status VARCHAR(50) DEFAULT 'active'
      `);
      console.log('✓ is_deleted column added to teams');
    }

    // Check project_tasks table
    const tasksResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='project_tasks' AND column_name='is_deleted'
    `);

    if (tasksResult.rows.length === 0) {
      console.log('Adding is_deleted column to project_tasks...');
      await client.query(`
        ALTER TABLE project_tasks 
        ADD COLUMN is_deleted BOOLEAN DEFAULT false
      `);
      console.log('✓ is_deleted column added to project_tasks');
    }

    console.log('\n✅ Database schema fixed!');
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

fixSchema();
