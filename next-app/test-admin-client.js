const { createAdminClient } = require('./utils/supabase/server');
require('dotenv').config({ path: '.env.local' });

async function testAdminClient() {
  try {
    console.log('Testing admin client...');
    
    const supabase = createAdminClient();
    
    console.log('\nFetching projects with admin client...');
    
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('id, name, status')
      .not('status', 'in', '("Completed","completed","Cancelled","cancelled")')
      .order('name');
    
    if (projError) {
      console.error('Error fetching projects:', projError);
      return;
    }
    
    console.log('Projects found:', projects?.length || 0);
    console.log('Projects:', projects);
    
    // Test tasks query
    if (projects && projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, project_id, status')
        .in('project_id', projectIds)
        .not('status', 'in', '("Completed","completed","Cancelled","cancelled")');
        
      if (taskError) {
        console.error('Error fetching tasks:', taskError);
      } else {
        console.log('Tasks found:', tasks?.length || 0);
        console.log('Tasks:', tasks);
      }
    }
    
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testAdminClient();
