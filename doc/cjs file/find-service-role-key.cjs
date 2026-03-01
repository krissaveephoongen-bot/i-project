// Try to find service role key from the same page
const https = require('https');

async function findServiceRoleKey() {
  console.log('🔍 Looking for Service Role Key on the API page...\n');
  
  try {
    // The service role key should be on the same page as the publishable key
    // Let's check if we can access any admin endpoints with the current setup
    
    const PROJECT_URL = 'https://vaunihijmwwkhqagjqjd.supabase.co';
    const PUBLISHABLE_KEY = 'sb_publishable_MXBRHnc3b8kCjjsVaacMfQ_WwT_5g15';
    
    console.log('📋 Current credentials:');
    console.log(`   Project URL: ${PROJECT_URL}`);
    console.log(`   Publishable Key: ${PUBLISHABLE_KEY}`);
    
    // Test if we can access admin functions
    console.log('\n🔍 Testing admin access...');
    
    // Try to access system tables (requires service role)
    const adminTest = await fetch(`${PROJECT_URL}/rest/v1/pg_stat_user_tables`, {
      headers: {
        'apikey': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${PUBLISHABLE_KEY}`
      }
    });
    
    if (adminTest.ok) {
      console.log('✅ Publishable key has admin access (unusual but good for us!)');
      const tables = await adminTest.json();
      console.log(`📊 Found ${tables.length} system tables`);
    } else {
      console.log('❌ Publishable key lacks admin access (expected)');
      console.log('📋 Service Role Key is required for server operations');
    }
    
    // Test current database connection
    console.log('\n🔍 Testing database connection...');
    const dbTest = await fetch(`${PROJECT_URL}/rest/v1/projects?select=count`, {
      headers: {
        'apikey': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${PUBLISHABLE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    
    if (dbTest.ok) {
      const count = dbTest.headers.get('content-range')?.split('/')[1] || '0';
      console.log(`✅ Database accessible - Found ${count} projects`);
    } else {
      console.log(`❌ Database access failed: ${dbTest.status}`);
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Go to Supabase Dashboard: https://vaunihijmwwkhqagjqjd.supabase.co');
    console.log('2. Go to Settings → API');
    console.log('3. Look for "service_role" key (usually longer JWT token)');
    console.log('4. Copy the service role key');
    console.log('5. Run: echo "SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production');
    
    console.log('\n🔗 Direct link to API settings:');
    console.log('https://vaunihijmwwkhqagjqjd.supabase.co/project/default/settings/api');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findServiceRoleKey().catch(console.error);
