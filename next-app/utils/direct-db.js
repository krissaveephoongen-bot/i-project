// Direct PostgreSQL connection for server actions
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function queryProjectsDirectly() {
  try {
    const query = `
      SELECT id, name, status 
      FROM projects 
      WHERE status NOT IN ('Completed', 'completed', 'Cancelled', 'cancelled') 
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Direct query error:', error);
    return [];
  }
}

export async function queryTasksDirectly(projectIds) {
  try {
    const query = `
      SELECT id, title as name, project_id, status 
      FROM tasks 
      WHERE project_id = ANY($1) 
      AND status NOT IN ('Completed', 'completed', 'Cancelled', 'cancelled')
    `;
    
    const result = await pool.query(query, [projectIds]);
    return result.rows;
  } catch (error) {
    console.error('Direct tasks query error:', error);
    return [];
  }
}
