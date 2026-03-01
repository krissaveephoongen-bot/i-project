// Try to get service role key from Supabase dashboard or generate new one
const https = require('https');

async function getServiceRoleKey() {
  console.log('🔑 Getting Service Role Key for new project...\n');
  
  const PROJECT_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw';
  
  try {
    // Test if we can access the database with anon key
    console.log('1️⃣ Testing database access with anon key:');
    const testResponse = await fetch(`${PROJECT_URL}/rest/v1/projects?select=count`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    
    if (testResponse.ok) {
      const count = testResponse.headers.get('content-range')?.split('/')[1] || '0';
      console.log(`✅ Database accessible - Found ${count} projects`);
    } else {
      console.log(`❌ Database access failed: ${testResponse.status}`);
    }
    
    // Try to create a test record to see if we need service role key
    console.log('\n2️⃣ Testing if service role key is needed:');
    
    const testRecord = {
      id: 'test-service-key-' + Date.now(),
      name: 'Test Service Key',
      email: `test${Date.now()}@example.com`,
      role: 'employee',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const createResponse = await fetch(`${PROJECT_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testRecord)
    });
    
    if (createResponse.ok) {
      console.log('✅ Anon key has sufficient permissions');
      
      // Clean up test record
      await fetch(`${PROJECT_URL}/rest/v1/users?id=eq.${testRecord.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      console.log('📋 Instructions for Service Role Key:');
      console.log('1. Go to Supabase Dashboard: https://vaunihijmwwkhqagjqjd.supabase.co');
      console.log('2. Go to Settings → API');
      console.log('3. Copy the "service_role" key');
      console.log('4. Run: echo "SERVICE_ROLE_KEY_HERE" | vercel env add SUPABASE_SERVICE_ROLE_KEY production');
      
    } else {
      const error = await createResponse.text();
      console.log(`❌ Anon key insufficient: ${error}`);
      console.log('📋 Service Role Key is required for server operations');
      console.log('1. Go to Supabase Dashboard: https://vaunihijmwwkhqagjqjd.supabase.co');
      console.log('2. Go to Settings → API');
      console.log('3. Copy the "service_role" key');
      console.log('4. Run: echo "SERVICE_ROLE_KEY_HERE" | vercel env add SUPABASE_SERVICE_ROLE_KEY production');
    }
    
    console.log('\n🔗 Supabase Dashboard: https://vaunihijmwwkhqagjqjd.supabase.co');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getServiceRoleKey().catch(console.error);
