const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load production environment
const env = fs.readFileSync('.env.production', 'utf8');
const lines = env.split('\n');
lines.forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/\"/g, '');
      process.env[key] = value;
    }
  }
});

async function checkProjects() {
  try {
    console.log('🔍 Checking projects table...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Count projects
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting projects:', countError.message);
      return;
    }
    
    console.log(`📊 Total projects: ${count || 0}`);
    
    // Try to get sample project with common column names
    const commonColumns = ['id', 'name', 'created_at', 'updatedat', 'updated_at', 'createdAt', 'updatedAt'];
    
    for (const col of commonColumns) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`id, ${col}`)
          .limit(1);
        
        if (!error) {
          console.log(`✅ Column '${col}' exists`);
          if (data && data.length > 0) {
            console.log('Sample project:', data[0]);
          }
          break;
        }
      } catch (e) {
        // Continue to next column
      }
    }
    
    // Get all projects with just id and name
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching projects:', error.message);
    } else {
      console.log('✅ Projects found:');
      projects?.forEach(p => {
        console.log(`  - ID: ${p.id}, Name: ${p.name || 'No name'}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Check error:', err.message);
  }
}

checkProjects();
