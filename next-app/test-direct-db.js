const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testDirectConnection() {
  try {
    console.log('Testing direct PostgreSQL connection...');
    
    // Get active projects
    const projectsQuery = `
      SELECT id, name, status 
      FROM projects 
      WHERE status NOT IN ('completed', 'cancelled') 
      ORDER BY name
    `;
    
    const projectsResult = await pool.query(projectsQuery);
    const projects = projectsResult.rows;
    
    console.log('Projects found:', projects.length);
    console.log('Projects:', projects);
    
    // Get active tasks for these projects
    const projectIds = projects.map(p => p.id);
    let tasks = [];
    
    if (projectIds.length > 0) {
      const tasksQuery = `
        SELECT id, title, project_id, status 
        FROM tasks 
        WHERE project_id = ANY($1) 
        AND status NOT IN ('completed', 'cancelled')
      `;
      
      const tasksResult = await pool.query(tasksQuery, [projectIds]);
      tasks = tasksResult.rows;
      
      console.log('Tasks found:', tasks.length);
      console.log('Tasks:', tasks);
    }
    
    // Map tasks to projects
    const tasksMap = {};
    for (const t of tasks) {
      const name = t.title || t.id;
      const pid = t.project_id;
      if (pid) {
        if (!tasksMap[pid]) tasksMap[pid] = [];
        tasksMap[pid].push({ id: t.id, name });
      }
    }

    // Construct response
    const result = projects.map((p) => ({
      id: p.id,
      name: p.name || "Untitled Project",
      is_billable: false,
      tasks: tasksMap[p.id] || [],
    }));
    
    console.log('Final result:', result);
    
  } catch (error) {
    console.error('Direct connection error:', error);
  } finally {
    await pool.end();
  }
}

testDirectConnection();
