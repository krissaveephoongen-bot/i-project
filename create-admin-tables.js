const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  try {
    await client.connect();
    console.log('Connected to database\n');

    // 1. Check and create teams table with status column
    console.log('Creating teams table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        lead_id UUID REFERENCES "User"(id),
        status VARCHAR(50) DEFAULT 'active',
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ teams table ready\n');

    // 2. Check and create team_members table
    console.log('Creating team_members table...');
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
    console.log('✓ team_members table ready\n');

    // 3. Create activity_log table (different from activity_logs)
    console.log('Creating activity_log table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        user_id UUID REFERENCES "User"(id),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ activity_log table ready\n');

    // 4. Create users table if it doesn't have all needed columns
    console.log('Checking users table structure...');
    const usersCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' OR table_name='User'
    `);
    
    if (usersCheck.rows.length === 0) {
      console.log('⚠️  Neither "users" nor "User" table found - skipping user table checks');
    } else {
      console.log('✓ users/User table exists\n');
    }

    // 5. Create admin_logs table for audit
    console.log('Creating admin_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID REFERENCES "User"(id),
        action VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100),
        resource_id UUID,
        changes JSONB,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ admin_logs table ready\n');

    // 6. Create project_members table (for project access control)
    console.log('Creating project_members table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id),
        user_id UUID NOT NULL REFERENCES "User"(id),
        role VARCHAR(50),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      );
    `);
    console.log('✓ project_members table ready\n');

    console.log('=' . repeat(60));
    console.log('\n✅ All admin tables created successfully!\n');
    console.log('Created tables:');
    console.log('  - teams (with status column for filtering)');
    console.log('  - team_members (for team membership)');
    console.log('  - activity_log (for audit trail)');
    console.log('  - admin_logs (for admin audit)');
    console.log('  - project_members (for project access control)');
    console.log('\n');

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

createTables();
