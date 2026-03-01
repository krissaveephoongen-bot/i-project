const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load dev environment
const devEnv = fs.readFileSync('.env', 'utf8');
const devLines = devEnv.split('\n');
devLines.forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/\"/g, '');
      process.env[key] = value;
    }
  }
});

// Load prod environment
const prodEnv = fs.readFileSync('.env.production', 'utf8');
const prodLines = prodEnv.split('\n');
const prodVars = {};
prodLines.forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/\"/g, '');
      prodVars[key] = value;
    }
  }
});

async function syncDevToProd() {
  try {
    console.log('🔄 Syncing data from dev to production...');
    
    // Connect to dev database
    const devSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Connect to prod database
    const prodSupabase = createClient(
      prodVars.NEXT_PUBLIC_SUPABASE_URL,
      prodVars.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get projects from dev
    const { data: devProjects, error: devError } = await devSupabase
      .from('projects')
      .select('*');
    
    if (devError) {
      console.error('❌ Error fetching dev projects:', devError.message);
      return;
    }
    
    console.log(`📊 Found ${devProjects?.length || 0} projects in dev`);
    
    if (!devProjects || devProjects.length === 0) {
      console.log('⚠️ No projects in dev to sync');
      return;
    }
    
    // Insert projects into prod
    const { error: insertError } = await prodSupabase
      .from('projects')
      .insert(devProjects);
    
    if (insertError) {
      console.error('❌ Error inserting projects to prod:', insertError.message);
      return;
    }
    
    console.log(`✅ Successfully synced ${devProjects.length} projects to production`);
    
    // Verify sync
    const { data: prodProjects, error: verifyError } = await prodSupabase
      .from('projects')
      .select('id, name')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying sync:', verifyError.message);
    } else {
      console.log('✅ Verification - Production projects:');
      prodProjects?.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id})`);
      });
    }
    
  } catch (err) {
    console.error('❌ Sync error:', err.message);
  }
}

syncDevToProd();
