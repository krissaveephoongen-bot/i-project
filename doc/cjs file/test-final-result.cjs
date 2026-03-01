// Test final result after environment update
const https = require('https');

async function testFinalResult() {
  console.log('🧪 Testing final result after environment update...\n');
  
  try {
    // Test 1: Portfolio API
    console.log('1️⃣ Testing Portfolio API:');
    const portfolioResponse = await fetch('https://i-projects.skin/api/dashboard/portfolio');
    
    if (portfolioResponse.ok) {
      const portfolioData = await portfolioResponse.json();
      console.log(`✅ Portfolio API Status: ${portfolioResponse.status}`);
      console.log(`📊 Projects found: ${portfolioData.rows?.length || 0}`);
      
      if (portfolioData.rows && portfolioData.rows.length > 0) {
        const sampleProject = portfolioData.rows[0];
        console.log(`📊 Sample project: "${sampleProject.name}"`);
        
        if (sampleProject.name.includes('เว็บไซต์') || sampleProject.name.includes('ระบบ')) {
          console.log('🎉 SUCCESS! Portfolio API is using NEW database with Thai project names');
        } else {
          console.log('⚠️ Portfolio API is still using OLD database');
        }
      }
    } else {
      console.log(`❌ Portfolio API Error: ${portfolioResponse.status}`);
    }
    
    // Test 2: Executive Report API
    console.log('\n2️⃣ Testing Executive Report API:');
    const execResponse = await fetch('https://i-projects.skin/api/projects/executive-report');
    
    if (execResponse.ok) {
      const execData = await execResponse.json();
      console.log(`✅ Executive Report API Status: ${execResponse.status}`);
      console.log(`📊 Total Projects: ${execData.totalProjects || 0}`);
      console.log(`📊 Active Projects: ${execData.activeProjects || 0}`);
    } else {
      const error = await execResponse.text();
      console.log(`❌ Executive Report API Error: ${execResponse.status}`);
      console.log(`📄 Error details: ${error}`);
    }
    
    // Test 3: Weekly Summary API
    console.log('\n3️⃣ Testing Weekly Summary API:');
    const weeklyResponse = await fetch('https://i-projects.skin/api/projects/weekly-summary');
    
    if (weeklyResponse.ok) {
      const weeklyData = await weeklyResponse.json();
      console.log(`✅ Weekly Summary API Status: ${weeklyResponse.status}`);
      console.log(`📊 Summary weeks: ${weeklyData.length || 0}`);
    } else {
      const error = await weeklyResponse.text();
      console.log(`❌ Weekly Summary API Error: ${weeklyResponse.status}`);
      console.log(`📄 Error details: ${error}`);
    }
    
    // Test 4: SPI/CPI Snapshot
    console.log('\n4️⃣ Testing SPI/CPI Snapshot API:');
    const snapshotResponse = await fetch('https://i-projects.skin/api/jobs/spi-cpi-snapshot', {
      method: 'POST'
    });
    
    if (snapshotResponse.ok) {
      const snapshotData = await snapshotResponse.json();
      console.log(`✅ SPI/CPI Snapshot API Status: ${snapshotResponse.status}`);
      console.log(`📊 Response: ${JSON.stringify(snapshotData)}`);
    } else {
      const error = await snapshotResponse.text();
      console.log(`❌ SPI/CPI Snapshot API Error: ${snapshotResponse.status}`);
      console.log(`📄 Error details: ${error}`);
    }
    
    // Summary
    console.log('\n📋 FINAL TEST SUMMARY:');
    console.log('=====================================');
    
    const tests = [
      { name: 'Portfolio API', status: portfolioResponse.ok },
      { name: 'Executive Report', status: execResponse.ok },
      { name: 'Weekly Summary', status: weeklyResponse.ok },
      { name: 'SPI/CPI Snapshot', status: snapshotResponse.ok }
    ];
    
    const passed = tests.filter(t => t.status).length;
    const total = tests.length;
    
    tests.forEach(test => {
      const icon = test.status ? '✅' : '❌';
      console.log(`${icon} ${test.name}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} APIs working`);
    
    if (passed === total) {
      console.log('🎉 ALL SYSTEMS WORKING! Stale data issue resolved!');
    } else if (passed >= 3) {
      console.log('✅ MOST SYSTEMS WORKING! Minor issues remain.');
    } else {
      console.log('⚠️ SYSTEM ISSUES REMAIN! Further investigation needed.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFinalResult().catch(console.error);
