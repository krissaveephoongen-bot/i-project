const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load dev environment from .env
const env = fs.readFileSync('.env', 'utf8');
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

async function checkDevProjects() {
  try {
    console.log('🔍 Checking development database...');
    
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
    
    console.log(`📊 Total projects in dev: ${count || 0}`);
    
    // Get sample projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, progress, budget, spi')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching projects:', error.message);
    } else {
      console.log('✅ Development projects:');
      projects?.forEach(p => {
        console.log(`  - ${p.name} (Progress: ${p.progress}%, Budget: ${p.budget}, SPI: ${p.spi})`);
      });
    }
    
  } catch (err) {
    console.error('❌ Check error:', err.message);
  }
}

checkDevProjects();
