const https = require('https');

function testAPI(endpoint, name) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${name}...`);
    
    const req = https.get(`https://i-projects.skin${endpoint}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ ${name} - Status: ${res.statusCode}`);
          
          if (name === 'Portfolio') {
            console.log(`📊 Projects: ${parsed.rows?.length || 0}`);
            console.log(`💰 Budget: ${parsed.cashflow?.totalBudget || 'N/A'}`);
            if (parsed.rows?.length > 0) {
              console.log(`📋 First project: ${parsed.rows[0].name}`);
            }
          } else if (name === 'Activities') {
            console.log(`📝 Activities: ${parsed.length || 0}`);
          }
        } catch (e) {
          console.log(`❌ ${name} - JSON Parse Error: ${e.message}`);
          console.log(`Raw response: ${data.substring(0, 200)}...`);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name} - Network Error: ${err.message}`);
      resolve();
    });
  });
}

async function runTests() {
  console.log('🚀 Testing Dashboard APIs...\n');
  
  await testAPI('/api/dashboard/portfolio', 'Portfolio');
  await testAPI('/api/dashboard/activities', 'Activities');
  
  console.log('\n✅ API Tests Complete');
  console.log('\n💡 If APIs return data but dashboard shows empty, the issue is:');
  console.log('   1. Browser caching (try hard refresh: Ctrl+Shift+R)');
  console.log('   2. Frontend deployment issue');
  console.log('   3. JavaScript error in browser console');
}

runTests();
