const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkEnumValues() {
  try {
    console.log('Checking enum values...');
    
    // Check distinct status values in projects
    const projectsStatusQuery = `SELECT DISTINCT status FROM projects`;
    const projectsResult = await pool.query(projectsStatusQuery);
    console.log('Projects status values:', projectsResult.rows);
    
    // Check distinct status values in tasks
    const tasksStatusQuery = `SELECT DISTINCT status FROM tasks`;
    const tasksResult = await pool.query(tasksStatusQuery);
    console.log('Tasks status values:', tasksResult.rows);
    
    // Get all projects without filtering
    const allProjectsQuery = `SELECT id, name, status FROM projects ORDER BY name`;
    const allProjectsResult = await pool.query(allProjectsQuery);
    console.log('All projects:', allProjectsResult.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkEnumValues();
