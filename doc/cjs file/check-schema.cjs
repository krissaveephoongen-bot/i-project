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

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get projects table structure
    const { data: columns, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ Projects table columns:', Object.keys(columns[0]));
    } else {
      console.log('⚠️ No projects found, checking table info...');
      
      // Try to get table info through information schema
      const { data: tableInfo, error: infoError } = await supabase
        .rpc('get_table_columns', { table_name: 'projects' })
        .catch(() => ({ data: null, error: { message: 'RPC not available' } }));
      
      if (infoError) {
        console.log('📝 Trying direct query...');
        // Try a simple query to see what columns exist
        const { data: sample, error: sampleError } = await supabase
          .from('projects')
          .select('id')
          .limit(1);
        
        if (sampleError) {
          console.error('❌ Cannot access projects table:', sampleError.message);
        } else {
          console.log('✅ Projects table is accessible but empty');
        }
      }
    }
    
    // Check if there are any projects at all
    const { data: count, error: countError } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting projects:', countError.message);
    } else {
      console.log(`📊 Total projects: ${count?.length || 0}`);
    }
    
  } catch (err) {
    console.error('❌ Schema check error:', err.message);
  }
}

checkSchema();
