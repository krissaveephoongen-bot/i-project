
// Test Projects Create API after adding category column
const https = require('https');

async function testProjectsCreate() {
  console.log('🔍 ทดสอบ Projects Create API...');
  
  try {
    const response = await fetch('https://i-projects.skin/api/projects/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Project ' + Date.now(),
        code: 'TEST-' + Date.now(),
        description: 'Test project description',
        status: 'Planning',
        priority: 'medium',
        category: 'Testing'
      })
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Projects Create API สำเร็จ!');
      console.log(`   Project ID: ${result.id}`);
      console.log(`   Project Name: ${result.name}`);
      console.log(`   Category: ${result.category}`);
    } else {
      const error = await response.text();
      console.log('❌ Projects Create API ล้มเหลว:');
      console.log(`   Error: ${error}`);
      
      if (error.includes('category')) {
        console.log('   🔍 อาจจะยังมีปัญหากับคอลัมน์ category');
      }
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testProjectsCreate().catch(console.error);
