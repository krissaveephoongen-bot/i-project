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

async function simpleQuery() {
  try {
    console.log('🔍 Simple database query...\n');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Try basic query with just id and name
    console.log('📊 Checking projects table...');
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name')
      .limit(10);
    
    if (error) {
      console.error('❌ Error:', error.message);
      
      // Try even simpler - just count
      console.log('\n🔢 Trying count only...');
      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Count error:', countError.message);
      } else {
        console.log(`✅ Project count: ${count || 0}`);
      }
      
    } else {
      console.log(`✅ Found ${projects?.length || 0} projects:`);
      projects?.forEach((p, i) => {
        console.log(`  ${i + 1}. ID: ${p.id}, Name: ${p.name || 'No name'}`);
      });
    }
    
    // Check if we can get any columns
    console.log('\n🔍 Trying to discover table structure...');
    try {
      const { data: sample, error: sampleError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Sample error:', sampleError.message);
      } else if (sample && sample.length > 0) {
        console.log('✅ Available columns:', Object.keys(sample[0]));
        console.log('Sample data:', sample[0]);
      } else {
        console.log('⚠️ No sample data available');
      }
    } catch (e) {
      console.error('❌ Structure check failed:', e.message);
    }
    
  } catch (err) {
    console.error('❌ Query error:', err.message);
  }
}

simpleQuery();
