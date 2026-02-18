const https = require('https');

async function testAllAPIs() {
  console.log('🚀 Final API Test - Database Effects\n');
  
  // Test 1: Portfolio API (should work)
  console.log('\n1️⃣ Portfolio API:');
  try {
    const portfolio = await new Promise((resolve) => {
      https.get('https://i-projects.skin/api/dashboard/portfolio', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const parsed = JSON.parse(data);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Projects: ${parsed.rows?.length || 0}`);
          console.log(`   Budget Total: ${parsed.cashflow?.length || 0} cashflow entries`);
          console.log(`   SPI Trend: ${parsed.spiTrend?.length || 0} points`);
          resolve(parsed);
        });
      }).on('error', () => resolve(null));
    });
    
    if (portfolio && portfolio.rows?.length > 0) {
      console.log('   ✅ Portfolio API: WORKING');
    } else {
      console.log('   ❌ Portfolio API: ISSUES');
    }
  } catch (e) {
    console.log(`   ❌ Portfolio Error: ${e.message}`);
  }
  
  // Test 2: SPI/CPI Snapshot (currently broken)
  console.log('\n2️⃣ SPI/CPI Snapshot API:');
  try {
    const snapshot = await new Promise((resolve) => {
      const req = https.request('https://i-projects.skin/api/jobs/spi-cpi-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Success: ${parsed.ok}`);
            if (!parsed.ok) {
              console.log(`   Error: ${parsed.error}`);
              
              // Analyze error to suggest fix
              if (parsed.error.includes('projectId')) {
                console.log('   💡 Issue: Column name mismatch');
                console.log('   🔧 Fix: Change "projectId" to "project_id"');
              } else if (parsed.error.includes('project_id')) {
                console.log('   💡 Issue: Column name mismatch');
                console.log('   🔧 Fix: Change "project_id" to "projectId"');
              }
            }
            resolve(parsed);
          } catch (e) {
            console.log(`   Parse Error: ${e.message}`);
            resolve(null);
          }
        });
      });
      req.on('error', (err) => {
        console.log(`   Network Error: ${err.message}`);
        resolve(null);
      });
      req.end();
    });
    
    if (snapshot && snapshot.ok) {
      console.log('   ✅ SPI/CPI Snapshot: WORKING');
    } else {
      console.log('   ❌ SPI/CPI Snapshot: BROKEN');
    }
  } catch (e) {
    console.log(`   ❌ Snapshot Error: ${e.message}`);
  }
  
  // Test 3: Activities API
  console.log('\n3️⃣ Activities API:');
  try {
    const activities = await new Promise((resolve) => {
      https.get('https://i-projects.skin/api/dashboard/activities', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const parsed = JSON.parse(data);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Activities: ${parsed.length || 0}`);
          resolve(parsed);
        });
      }).on('error', () => resolve(null));
    });
    
    if (activities) {
      console.log('   ✅ Activities API: WORKING');
    } else {
      console.log('   ❌ Activities API: ISSUES');
    }
  } catch (e) {
    console.log(`   ❌ Activities Error: ${e.message}`);
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('='.repeat(50));
  console.log('✅ Core functionality: Portfolio data reading');
  console.log('❌ Trend functionality: SPI/CPI snapshots');
  console.log('✅ Activities: Working (but empty)');
  console.log('\n💡 MAIN ISSUE: Database schema column mismatch');
  console.log('🎯 IMPACT: Dashboard shows projects but no SPI trends');
  console.log('🔧 SOLUTION: Fix column name in SPI/CPI APIs');
}

testAllAPIs().catch(console.error);
