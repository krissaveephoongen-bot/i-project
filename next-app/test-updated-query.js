const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.vaunihijmwwkhqagjqjd:AppWorks@123!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function testUpdatedQuery() {
  try {
    console.log('Testing updated query...');
    
    // Get active projects
    const projectsQuery = `
      SELECT id, name, status, code
      FROM projects 
      WHERE status = 'Active' AND is_archived = false
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
        AND status = 'Active'
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
      code: p.code,
      is_billable: false,
      tasks: tasksMap[p.id] || [],
    }));
    
    console.log('Final result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testUpdatedQuery();
