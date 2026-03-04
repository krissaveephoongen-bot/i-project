const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    console.log('Checking tables...');
    
    // List all tables
    const tablesQuery = `
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    const tablesResult = await pool.query(tablesQuery);
    console.log('Tables:', tablesResult.rows);
    
    // Check if projects table exists and get its structure
    if (tablesResult.rows.some(t => t.table_name === 'projects')) {
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
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkTables();
