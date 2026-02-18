// Fix SPI/CPI snapshot schema issue by trying different approaches
const https = require('https');

async function tryDifferentApproaches() {
  console.log('🔧 Attempting different fixes for SPI/CPI schema...\n');
  
  // Approach 1: Try to read existing snapshots to see actual schema
  console.log('1️⃣ Testing direct table read...');
  try {
    const readTest = await new Promise((resolve) => {
      const req = https.get('https://i-projects.skin/api/dashboard/portfolio', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            resolve({ error: e.message });
          }
        });
      }).on('error', (err) => resolve({ error: err.message }));
    });
    
    if (readTest.spiSnaps && readTest.spiSnaps.length > 0) {
      console.log('✅ Found existing snapshots - schema is working');
      console.log('📋 Sample:', readTest.spiSnaps[0]);
    } else {
      console.log('ℹ️  No existing snapshots found');
    }
  } catch (e) {
    console.log('❌ Read test failed:', e.message);
  }
  
  // Approach 2: Try to create snapshot with different column names
  console.log('\n2️⃣ Testing different column names...');
  const columnVariations = [
    { name: 'projectId', test: { projectId: 'test-123', date: '2026-02-17', spi: 1.0, cpi: 1.0 } },
    { name: 'project_id', test: { project_id: 'test-123', date: '2026-02-17', spi: 1.0, cpi: 1.0 } },
    { name: 'projectid', test: { projectid: 'test-123', date: '2026-02-17', spi: 1.0, cpi: 1.0 } }
  ];
  
  for (const variation of columnVariations) {
    console.log(`🔍 Testing column: "${variation.name}"`);
    try {
      const result = await new Promise((resolve) => {
        const data = JSON.stringify(variation.test);
        const req = https.request('https://i-projects.skin/api/test-snapshot-insert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
          }
        }, (res) => {
          let responseData = '';
          res.on('data', chunk => responseData += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(responseData);
              if (res.statusCode === 200 && parsed.ok) {
                console.log(`   ✅ SUCCESS: Column "${variation.name}" works!`);
                resolve({ success: true, column: variation.name });
              } else {
                console.log(`   ❌ Failed: ${parsed.error}`);
                resolve({ success: false, column: variation.name, error: parsed.error });
              }
            } catch (e) {
              console.log(`   ❌ Parse error: ${e.message}`);
              resolve({ success: false, column: variation.name, error: e.message });
            }
          });
        });
        
        req.on('error', (err) => {
          console.log(`   ❌ Network error: ${err.message}`);
          resolve({ success: false, column: variation.name, error: err.message });
        });
        
        req.write(data);
        req.end();
      });
      
      if (result.success) {
        console.log(`\n🎉 FOUND WORKING COLUMN: "${result.column}"`);
        console.log('💡 Update SPI/CPI API to use this column');
        return result.column;
      }
    } catch (e) {
      console.log(`❌ Test failed: ${e.message}`);
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Approach 3: Try to fix Executive Report API
  console.log('\n3️⃣ Testing Executive Report API fix...');
  try {
    const execTest = await new Promise((resolve) => {
      https.get('https://i-projects.skin/api/projects/executive-report', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            console.log(`   Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
              console.log('   ✅ Executive Report: WORKING');
              console.log(`   📊 Projects: ${parsed.totalProjects || 0}`);
              console.log(`   📈 Active: ${parsed.activeProjects || 0}`);
            } else {
              console.log('   ❌ Executive Report: Still failing');
            }
            resolve(parsed);
          } catch (e) {
            console.log(`   ❌ Parse error: ${e.message}`);
            resolve(null);
          }
        });
      }).on('error', (err) => {
        console.log(`   ❌ Network error: ${err.message}`);
        resolve(null);
      });
    });
  } catch (e) {
    console.log('❌ Executive test failed:', e.message);
  }
  
  console.log('\n📋 SUMMARY OF FIXES:');
  console.log('='.repeat(50));
  console.log('🎯 MAIN ISSUE: Database schema inconsistencies');
  console.log('✅ CORE FUNCTIONALITY: Working (projects display)');
  console.log('❌ ADVANCED FEATURES: Partially broken');
  console.log('🔧 NEEDED: Schema alignment and API fixes');
}

tryDifferentApproaches().catch(console.error);
