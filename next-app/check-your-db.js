const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.vaunihijmwwkhqagjqjd:AppWorks@123!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function checkYourDatabase() {
  try {
    console.log('Checking your database structure...');
    
    // Check if projects table exists and get its structure
    const projectsStructureQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY ordinal_position
    `;
    const projectsStructureResult = await pool.query(projectsStructureQuery);
    console.log('Projects table structure:', projectsStructureResult.rows);
    
    // Try to get count
    const countQuery = `SELECT COUNT(*) as count FROM projects`;
    const countResult = await pool.query(countQuery);
    console.log('Projects count:', countResult.rows[0].count);
    
    // Get all projects if any
    if (countResult.rows[0].count > 0) {
      const allProjectsQuery = `SELECT * FROM projects LIMIT 5`;
      const allProjectsResult = await pool.query(allProjectsQuery);
      console.log('Sample projects:', allProjectsResult.rows);
    }
    
    // Check tasks table structure
    const tasksStructureQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      ORDER BY ordinal_position
    `;
    const tasksStructureResult = await pool.query(tasksStructureQuery);
    console.log('Tasks table structure:', tasksStructureResult.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkYourDatabase();
