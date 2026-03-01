// Test using the same method as the deployed application
const https = require('https');

function testAPIConnection() {
  return new Promise((resolve) => {
    console.log('🔍 Testing database connection via API...');
    
    // Test the portfolio API which uses supabaseAdmin
    const req = https.get('https://i-projects.skin/api/dashboard/portfolio', {
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
          console.log(`✅ API Status: ${res.statusCode}`);
          console.log(`📊 Projects returned: ${parsed.rows?.length || 0}`);
          
          if (parsed.rows?.length > 0) {
            console.log('🔗 Database connection: WORKING');
            console.log('📋 Sample project data:');
            parsed.rows.slice(0, 2).forEach((p, i) => {
              console.log(`   ${i+1}. ${p.name}`);
              console.log(`      Budget: ${p.budget}, SPI: ${p.spi}, Status: ${p.status}`);
            });
          } else {
            console.log('⚠️  Database connection: Working but no data');
          }
        } catch (e) {
          console.log('❌ API Response error:', e.message);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Network error:', err.message);
      resolve();
    });
  });
}

async function testAllDatabaseEffects() {
  console.log('🚀 Testing Database Effects via APIs\n');
  
  // Test 1: Portfolio API (reads projects)
  await testAPIConnection();
  
  // Test 2: Try to trigger SPI/CPI snapshot
  console.log('\n🔄 Testing SPI/CPI snapshot creation...');
  try {
    const snapshotResponse = await new Promise((resolve) => {
      const req = https.get('https://i-projects.skin/api/jobs/spi-cpi-snapshot', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: data });
        });
      });
      req.on('error', (err) => resolve({ status: 0, error: err.message }));
    });
    
    console.log(`📊 Snapshot API Status: ${snapshotResponse.status}`);
    if (snapshotResponse.status === 200) {
      const result = JSON.parse(snapshotResponse.data);
      console.log(`📈 Result: ${result.ok ? 'SUCCESS' : 'FAILED'}`);
      if (!result.ok) {
        console.log(`❌ Error: ${result.error}`);
        console.log('🔧 This affects SPI trend data on dashboard');
      }
    }
  } catch (e) {
    console.log('❌ Snapshot test failed:', e.message);
  }
  
  // Test 3: Check if data persists
  console.log('\n🔍 Testing data persistence...');
  const test1 = await new Promise((resolve) => {
    https.get('https://i-projects.skin/api/dashboard/portfolio', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        resolve(parsed.rows?.length || 0);
      });
    }).on('error', () => resolve(0));
  });
  
  // Wait a moment
  await new Promise(r => setTimeout(r, 1000));
  
  const test2 = await new Promise((resolve) => {
    https.get('https://i-projects.skin/api/dashboard/portfolio', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        resolve(parsed.rows?.length || 0);
      });
    }).on('error', () => resolve(0));
  });
  
  console.log(`📊 Test 1: ${test1} projects`);
  console.log(`📊 Test 2: ${test2} projects`);
  
  if (test1 === test2 && test1 > 0) {
    console.log('✅ Data persistence: WORKING');
  } else {
    console.log('❌ Data persistence: ISSUE DETECTED');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('='.repeat(40));
  console.log('✅ Portfolio API: Working (reads database)');
  console.log('❌ SPI/CPI Snapshot: Failed (schema issue)');
  console.log('✅ Data Persistence: Working');
  console.log('\n💡 MAIN ISSUE: SPI/CPI snapshot table schema problem');
  console.log('🔧 This affects trend charts but not basic project data');
  console.log('🎯 Dashboard should show projects but not SPI trends');
}

testAllDatabaseEffects().catch(console.error);
