// Test direct connection to new database
const https = require('https');

const NEW_SUPABASE_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';

async function testNewDatabase() {
  console.log('🔍 Testing direct connection to new database...\n');
  
  try {
    // Test projects
    console.log('1️⃣ Testing projects:');
    const projectsResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/projects?select=id,name,status,spi,budget,spent&limit=3`, {
      headers: {
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
      }
    });
    
    if (projectsResponse.ok) {
      const projects = await projectsResponse.json();
      console.log(`   ✅ Found ${projects.length} projects`);
      projects.forEach(p => console.log(`   - ${p.name} (${p.status}) - SPI: ${p.spi}`));
    } else {
      console.log(`   ❌ Projects error: ${projectsResponse.status}`);
    }
    
    // Test risks table structure
    console.log('\n2️⃣ Testing risks table:');
    const risksResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/risks?select=*&limit=1`, {
      headers: {
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
      }
    });
    
    if (risksResponse.ok) {
      const risks = await risksResponse.json();
      console.log(`   ✅ Risks table accessible`);
      if (risks.length > 0) {
        const columns = Object.keys(risks[0]);
        console.log(`   📋 Columns: ${columns.join(', ')}`);
      } else {
        console.log(`   📋 Table exists but empty`);
      }
    } else {
      const error = await risksResponse.text();
      console.log(`   ❌ Risks error: ${error}`);
    }
    
    // Test SPI/CPI snapshots
    console.log('\n3️⃣ Testing SPI/CPI snapshots:');
    const snapshotsResponse = await fetch(`${NEW_SUPABASE_URL}/rest/v1/spi_cpi_daily_snapshot?select=projectid,date,spi,cpi&limit=3`, {
      headers: {
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
      }
    });
    
    if (snapshotsResponse.ok) {
      const snapshots = await snapshotsResponse.json();
      console.log(`   ✅ Found ${snapshots.length} snapshots`);
      snapshots.forEach(s => console.log(`   - Project ${s.projectid} on ${s.date}: SPI=${s.spi}, CPI=${s.cpi}`));
    } else {
      const error = await snapshotsResponse.text();
      console.log(`   ❌ Snapshots error: ${error}`);
    }
    
    console.log('\n✅ Direct database connection test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNewDatabase().catch(console.error);
