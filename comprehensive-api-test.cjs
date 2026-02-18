const https = require('https');

function testAPI(endpoint, name, method = 'GET', data = null) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${name} (${method} ${endpoint})...`);
    
    const options = {
      hostname: 'i-projects.skin',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`✅ ${name} - Status: ${res.statusCode}`);
          
          // Analyze different API responses
          if (endpoint.includes('portfolio')) {
            console.log(`📊 Projects: ${parsed.rows?.length || 0}`);
            console.log(`💰 Cashflow entries: ${parsed.cashflow?.length || 0}`);
            console.log(`📈 SPI Trend points: ${parsed.spiTrend?.length || 0}`);
            console.log(`📋 SPI Snaps: ${parsed.spiSnaps?.length || 0}`);
            
            if (parsed.rows?.length > 0) {
              const totalBudget = parsed.rows.reduce((sum, p) => sum + (p.budget || 0), 0);
              const totalSpent = parsed.rows.reduce((sum, p) => sum + (p.actual || 0), 0);
              console.log(`💸 Total Budget: ${totalBudget.toLocaleString()}`);
              console.log(`💳 Total Spent: ${totalSpent.toLocaleString()}`);
              
              parsed.rows.slice(0, 3).forEach((p, i) => {
                console.log(`   ${i+1}. ${p.name} - ${p.status} - SPI: ${p.spi}`);
              });
            }
          } else if (endpoint.includes('activities')) {
            console.log(`📝 Activities: ${parsed.length || 0}`);
            parsed.slice(0, 3).forEach((a, i) => {
              console.log(`   ${i+1}. ${a.type || a.event_type} - ${a.date || a.created_at}`);
            });
          } else if (endpoint.includes('executive-report')) {
            console.log(`📈 Executive Report available: ${!!parsed}`);
            if (parsed) {
              console.log(`   Total Projects: ${parsed.totalProjects || 0}`);
              console.log(`   Active Projects: ${parsed.activeProjects || 0}`);
            }
          } else if (endpoint.includes('weekly-summary')) {
            console.log(`📅 Weekly Summary: ${parsed.summary?.length || 0} weeks`);
          } else {
            console.log(`📄 Response size: ${responseData.length} chars`);
            console.log(`📋 Keys: ${Object.keys(parsed).join(', ')}`);
          }
        } catch (e) {
          console.log(`❌ ${name} - JSON Parse Error: ${e.message}`);
          console.log(`Raw response: ${responseData.substring(0, 200)}...`);
        }
        resolve({ name, status: res.statusCode, success: res.statusCode === 200 });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name} - Network Error: ${err.message}`);
      resolve({ name, status: 0, success: false, error: err.message });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testDatabaseDirectly() {
  console.log('\n🗄️  Testing Database Connection...');
  
  // Test SPI/CPI Snapshot job
  try {
    console.log('🔄 Triggering SPI/CPI Snapshot job...');
    await testAPI('/api/jobs/spi-cpi-snapshot', 'SPI/CPI Snapshot', 'POST');
  } catch (e) {
    console.log('❌ SPI/CPI Snapshot failed:', e.message);
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Comprehensive Dashboard API Test\n');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  const tests = [
    { endpoint: '/api/dashboard/portfolio', name: 'Portfolio API' },
    { endpoint: '/api/dashboard/activities', name: 'Activities API' },
    { endpoint: '/api/projects/executive-report', name: 'Executive Report API' },
    { endpoint: '/api/projects/weekly-summary', name: 'Weekly Summary API' },
    { endpoint: '/api/jobs/spi-cpi-snapshot', name: 'SPI/CPI Snapshot', method: 'POST' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testAPI(test.endpoint, test.name, test.method || 'GET');
    results.push(result);
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('='.repeat(50));
  results.forEach(r => {
    const status = r.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${r.name} (${r.status})`);
  });
  
  const passed = results.filter(r => r.success).length;
  console.log(`\n🎯 Overall: ${passed}/${results.length} APIs working`);
  
  if (passed === results.length) {
    console.log('✅ All APIs are working correctly!');
    console.log('💡 If dashboard still shows empty, this is a FRONTEND caching issue.');
    console.log('🔧 Solution: Hard refresh browser (Ctrl+Shift+R) or clear cache');
  } else {
    console.log('❌ Some APIs failed - check backend logs');
  }
  
  await testDatabaseDirectly();
}

runComprehensiveTest().catch(console.error);
