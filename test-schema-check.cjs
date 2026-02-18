// Test schema check API
const https = require('https');

async function testSchemaCheck() {
  console.log('🔍 ทดสอบ Schema หลัง Migration...\n');
  
  try {
    const result = await new Promise((resolve) => {
      const data = JSON.stringify({});
      
      const req = https.request('https://i-projects.skin/api/check-schema', {
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
            console.log(`Status: ${res.statusCode}`);
            resolve(parsed);
          } catch (e) {
            console.log(`Parse error: ${e.message}`);
            resolve({ error: e.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`Network error: ${err.message}`);
        resolve({ error: err.message });
      });
      
      req.write(data);
      req.end();
    });
    
    console.log('📊 ผมจการทดสอบ:');
    console.log('='.repeat(50));
    
    if (result.tables) {
      console.log('\n📋 Tables Status:');
      Object.keys(result.tables).forEach(table => {
        const status = result.tables[table];
        console.log(`   ${table}: ${status.exists ? '✅ EXISTS' : '❌ MISSING'}`);
        if (status.error) {
          console.log(`     Error: ${status.error}`);
        }
        if (status.hasData) {
          console.log(`     Has data: YES`);
        }
        if (status.sampleColumns && status.sampleColumns.length > 0) {
          console.log(`     Columns: ${status.sampleColumns.join(', ')}`);
        }
      });
    }
    
    if (result.columns) {
      console.log('\n🔍 Column Tests:');
      Object.keys(result.columns).forEach(test => {
        const status = result.columns[test];
        console.log(`   ${test}: ${status === 'EXISTS' ? '✅ EXISTS' : '❌ MISSING'}`);
        if (status !== 'EXISTS') {
          console.log(`     Error: ${status}`);
        }
      });
    }
    
    console.log('\n📋 สรุประ:');
    if (result.success) {
      console.log('✅ Schema check API: ทำงานได้');
    } else {
      console.log('❌ Schema check API: มีปัญหา');
    }
    
  } catch (e) {
    console.error('❌ Test failed:', e.message);
  }
}

testSchemaCheck().catch(console.error);
