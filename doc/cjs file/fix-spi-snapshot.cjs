// Create a simple script to test different column names for SPI snapshot
const https = require('https');

async function testSPIFix() {
  console.log('🔧 Testing SPI/CPI Snapshot Fix\n');
  
  // Test the current API to see the exact error
  console.log('1. Testing current SPI/CPI API...');
  try {
    const response = await new Promise((resolve) => {
      const req = https.request('https://i-projects.skin/api/jobs/spi-cpi-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', err => resolve({ status: 0, error: err.message }));
      req.end();
    });
    
    console.log(`Status: ${response.status}`);
    if (response.data) {
      const result = JSON.parse(response.data);
      console.log(`Error: ${result.error}`);
    }
  } catch (e) {
    console.log('Request failed:', e.message);
  }
  
  // Test if we can read from the table
  console.log('\n2. Testing if we can read spi_cpi_daily_snapshot...');
  try {
    const readResponse = await new Promise((resolve) => {
      const req = https.get('https://i-projects.skin/api/test-db-read', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', err => resolve({ status: 0, error: err.message }));
    });
    
    console.log(`Read Status: ${readResponse.status}`);
    if (readResponse.data) {
      console.log(`Response: ${readResponse.data.substring(0, 200)}...`);
    }
  } catch (e) {
    console.log('Read test failed:', e.message);
  }
  
  console.log('\n3. Creating a fixed version of the SPI/CPI API...');
  console.log('💡 The issue is likely column name mismatch:');
  console.log('   - Code uses: projectId');
  console.log('   - Database might have: project_id');
  console.log('🔧 Need to update the API to use correct column names');
}

testSPIFix();
