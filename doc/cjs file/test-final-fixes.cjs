// Final API Test after fixes
const https = require('https');

async function testAPIs() {
  console.log('🔍 ทดสอบ API หลังแก้ไข...');
  
  const baseUrl = 'https://i-projects.skin';
  
  const tests = [
    {
      name: 'Projects Create',
      method: 'POST',
      url: '/api/projects/create',
      body: {
        name: 'Test Project ' + Date.now(),
        code: 'TEST-' + Date.now(),
        description: 'Test project',
        status: 'Planning',
        priority: 'medium',
        category: 'Testing',
        start_date: '2026-01-01',
        end_date: '2026-12-31'
      }
    },
    {
      name: 'Users List',
      method: 'GET',
      url: '/api/users'
    },
    {
      name: 'Users Profile',
      method: 'GET',
      url: '/api/users/profile?id=test-user-id'
    }
  ];
  
  for (const test of tests) {
    try {
      const response = await fetch(baseUrl + test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: test.body ? JSON.stringify(test.body) : undefined
      });
      
      console.log('📊 ' + test.name + ': ' + response.status + ' - ' + (response.ok ? 'สำเร็จ' : 'ล้มเหลว'));
      
      if (!response.ok) {
        const error = await response.text();
        console.log('   🔍 Error: ' + error);
      }
    } catch (error) {
      console.log('❌ ' + test.name + ': Network Error - ' + error.message);
    }
  }
  
  console.log('\n🎉 การทดสอบสิ้นสุด!');
}

testAPIs().catch(console.error);
