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

async function queryProjects() {
  try {
    console.log('🔍 Querying production database for projects...\n');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting projects:', countError.message);
      return;
    }
    
    console.log(`📊 Total Projects: ${count || 0}\n`);
    
    // Get all projects with details
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching projects:', error.message);
      return;
    }
    
    if (!projects || projects.length === 0) {
      console.log('⚠️ No projects found in database');
      return;
    }
    
    console.log('📋 Project Details:');
    console.log('─'.repeat(80));
    
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Progress: ${project.progress || 0}%`);
      console.log(`   Budget: ${project.budget || 0}`);
      console.log(`   Spent: ${project.spent || 0}`);
      console.log(`   SPI: ${project.spi || 'N/A'}`);
      console.log(`   Created: ${project.created_at || project.createdAt || 'N/A'}`);
      console.log(`   Updated: ${project.updated_at || project.updatedAt || 'N/A'}`);
      console.log('');
    });
    
    // Check milestones
    console.log('🎯 Checking Milestones...');
    const { data: milestones, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .limit(10);
    
    if (milestoneError) {
      console.error('❌ Error fetching milestones:', milestoneError.message);
    } else {
      console.log(`📊 Total Milestones: ${milestones?.length || 0}`);
      if (milestones && milestones.length > 0) {
        console.log('Recent milestones:');
        milestones.forEach(m => {
          console.log(`  - ${m.name} (Project: ${m.project_id}) - ${m.status}`);
        });
      }
    }
    
    // Check SPI/CPI snapshots
    console.log('\n📈 Checking SPI/CPI Snapshots...');
    const { data: snapshots, error: snapshotError } = await supabase
      .from('spi_cpi_daily_snapshot')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (snapshotError) {
      console.error('❌ Error fetching snapshots:', snapshotError.message);
    } else {
      console.log(`📊 Total Snapshots: ${snapshots?.length || 0}`);
      if (snapshots && snapshots.length > 0) {
        console.log('Recent snapshots:');
        snapshots.forEach(s => {
          console.log(`  - Date: ${s.date}, Project: ${s.projectId}, SPI: ${s.spi}, CPI: ${s.cpi}`);
        });
      }
    }
    
  } catch (err) {
    console.error('❌ Query error:', err.message);
  }
}

queryProjects();
