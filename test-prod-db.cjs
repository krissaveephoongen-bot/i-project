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

async function testProductionDB() {
  try {
    console.log('🔗 Testing production database connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, updatedAt, updated_at, progress, spi')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching projects:', error.message);
      return;
    }
    
    console.log(`✅ Found ${projects?.length || 0} projects`);
    projects?.forEach(p => {
      console.log(`  - ${p.name} (Updated: ${p.updatedAt || p.updated_at})`);
    });
    
    // Test snapshots
    const { data: snapshots, error: snapError } = await supabase
      .from('spi_cpi_daily_snapshot')
      .select('*')
      .order('date', { ascending: false })
      .limit(3);
    
    if (snapError) {
      console.error('❌ Error fetching snapshots:', snapError.message);
    } else {
      console.log(`✅ Found ${snapshots?.length || 0} snapshots`);
      snapshots?.forEach(s => {
        console.log(`  - Date: ${s.date}, Projects: ${s.projectId}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

testProductionDB();
