const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './next-app/.env.production' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  try {
    console.log('🔍 Checking production database...');
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, updatedAt')
      .order('updatedAt', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log(`✅ Found ${projects?.length || 0} projects in production:`);
    projects?.forEach(p => {
      console.log(`- ${p.name} (updated: ${p.updatedAt})`);
    });
    
    // Check dashboard API response
    console.log('\n🌐 Testing dashboard API...');
    const response = await fetch('https://i-projects.skin/api/dashboard/portfolio');
    const data = await response.json();
    
    console.log(`📊 API Response - Projects: ${data.rows?.length || 0}`);
    console.log(`💰 Total Budget: ${data.cashflow?.totalBudget || 'N/A'}`);
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

checkData();
