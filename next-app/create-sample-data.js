const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: "postgresql://postgres.vaunihijmwwkhqagjqjd:AppWorks@123!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function createSampleData() {
  try {
    console.log('Creating sample data...');
    
    // Insert sample projects
    const insertProjectsQuery = `
      INSERT INTO projects (id, name, status, progress, "progressPlan", spi, "riskLevel", priority, "isArchived", "createdAt", "updatedAt")
      VALUES 
        ('proj-001', 'Website Redesign', 'active', 25, 30, 0.85, 'medium', 'medium', false, NOW(), NOW()),
        ('proj-002', 'Mobile App Development', 'active', 60, 50, 1.20, 'low', 'high', false, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    
    const projectsResult = await pool.query(insertProjectsQuery);
    console.log('Projects inserted:', projectsResult.rowCount);
    
    // Insert sample tasks
    const insertTasksQuery = `
      INSERT INTO tasks (id, title, status, priority, "projectId", "assignedTo", "createdBy", "createdAt", "updatedAt")
      VALUES 
        ('task-001', 'Design Homepage', 'todo', 'high', 'proj-001', 'user-001', 'user-001', NOW(), NOW()),
        ('task-002', 'Implement Navigation', 'in_progress', 'medium', 'proj-001', 'user-002', 'user-001', NOW(), NOW()),
        ('task-003', 'Setup React Native', 'todo', 'high', 'proj-002', 'user-001', 'user-001', NOW(), NOW()),
        ('task-004', 'Create API Integration', 'todo', 'medium', 'proj-002', 'user-002', 'user-001', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    
    const tasksResult = await pool.query(insertTasksQuery);
    console.log('Tasks inserted:', tasksResult.rowCount);
    
    // Verify the data
    const verifyProjectsQuery = `SELECT id, name, status FROM projects ORDER BY name`;
    const verifyProjectsResult = await pool.query(verifyProjectsQuery);
    console.log('Projects in database:', verifyProjectsResult.rows);
    
    const verifyTasksQuery = `SELECT id, title, "projectId", status FROM tasks ORDER BY "projectId", title`;
    const verifyTasksResult = await pool.query(verifyTasksQuery);
    console.log('Tasks in database:', verifyTasksResult.rows);
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await pool.end();
  }
}

createSampleData();
