// Quick test after environment update
const fetch = require('node-fetch');

async function testAfterUpdate() {
  console.log('🧪 Testing after environment update...');
  
  try {
    const response = await fetch('https://i-projects.skin/api/dashboard/portfolio');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Portfolio API working!');
      console.log(`📊 Projects: ${data.rows?.length || 0}`);
      
      if (data.rows && data.rows.length > 0) {
        const sample = data.rows[0];
        console.log(`📊 Sample: ${sample.name}`);
        
        if (sample.name.includes('เว็บไซต์') || sample.name.includes('ระบบ')) {
          console.log('🎉 SUCCESS! Using new database with Thai project names');
        } else {
          console.log('⚠️ Still using old database');
        }
      }
    } else {
      console.log(`❌ API Error: ${response.status}`);
    }
    
    // Test Executive Report
    const execResponse = await fetch('https://i-projects.skin/api/projects/executive-report');
    console.log(`📊 Executive Report: ${execResponse.status}`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAfterUpdate();
