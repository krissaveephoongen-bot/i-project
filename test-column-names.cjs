const https = require('https');

async function testColumnName(columnName) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing column: "${columnName}"`);
    
    const data = JSON.stringify({
      test_project_id: "test-123",
      date: "2026-02-17",
      spi: 1.0,
      cpi: 1.0
    });
    
    // Replace column name in test data
    const testData = data.replace('"test_project_id"', `"${columnName}": "test-123"`);
    
    const req = https.request('https://i-projects.skin/api/test-snapshot-insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            console.log(`   Status: ${res.statusCode}`);
            if (res.statusCode === 200 && result.ok) {
              console.log(`   ✅ SUCCESS: Column "${columnName}" works!`);
              resolve({ success: true, column: columnName });
            } else {
              console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
              resolve({ success: false, column: columnName, error: result.error });
            }
          } catch (e) {
            console.log(`   ❌ Parse error: ${e.message}`);
            resolve({ success: false, column: columnName, error: e.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   ❌ Network error: ${err.message}`);
        resolve({ success: false, column: columnName, error: err.message });
      });
      
      req.write(testData);
      req.end();
  });
}

async function findCorrectColumnName() {
  console.log('🔍 Testing different column names for SPI/CPI snapshot table...\n');
  
  const possibleColumns = [
    'project_id',
    'projectId', 
    'projectid',
    'project',
    'projectRef',
    'project_ref'
  ];
  
  for (const column of possibleColumns) {
    const result = await testColumnName(column);
    if (result.success) {
      console.log(`\n🎉 FOUND CORRECT COLUMN: "${result.column}"`);
      console.log('💡 Update the API to use this column name');
      return result.column;
    }
    
    // Wait a moment between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n❌ Could not determine correct column name');
  console.log('🔧 Manual database inspection needed');
  return null;
}

findCorrectColumnName().catch(console.error);
