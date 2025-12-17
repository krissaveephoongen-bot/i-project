const { Client } = require('pg');

// Neon database connection string
const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_6FSH4YyQIoeb@ep-muddy-cherry-ah612m1a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function globalSetup() {
  try {
    console.log('Setting up test database...');

    // Create a new client
    const client = new Client({
      connectionString: NEON_CONNECTION_STRING,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();
    console.log('Connected to Neon database successfully');

    // Create test user if not exists
    const checkUser = await client.query(`
      SELECT * FROM users WHERE email = 'admin@example.com'
    `);

    if (checkUser.rows.length === 0) {
      await client.query(`
        INSERT INTO users (email, password, name, role)
        VALUES ('admin@example.com', $1, 'Test Admin', 'admin')
      `, ['password123']); // In real app, this would be hashed
      console.log('Created test user');
    }

    // Create test project if not exists
    const checkProject = await client.query(`
      SELECT * FROM projects WHERE name = 'E2E Test Project'
    `);

    if (checkProject.rows.length === 0) {
      await client.query(`
        INSERT INTO projects (name, description, status, created_by)
        VALUES ('E2E Test Project', 'Project created by E2E tests', 'active', 1)
      `);
      console.log('Created test project');
    }

    await client.end();
    console.log('Database setup completed');

  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}

module.exports = globalSetup;