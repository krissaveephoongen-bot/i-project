// Test production environment variables
const https = require('https');

async function testProductionEnv() {
  console.log('🔍 Testing production environment variables...\n');
  
  try {
    // Test a simple API that shows environment info
    console.log('1️⃣ Testing environment info API:');
    
    const response = await fetch('https://i-projects.skin/api/test-db', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`📄 Response: ${text}`);
    
    // Also test the database connection through the API
    console.log('\n2️⃣ Testing database connection through API:');
    
    const dbResponse = await fetch('https://i-projects.skin/api/dashboard/portfolio', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`📊 Portfolio API Status: ${dbResponse.status}`);
    
    if (dbResponse.ok) {
      const portfolioData = await dbResponse.json();
      console.log(`📊 Projects found: ${portfolioData.rows?.length || 0}`);
      if (portfolioData.rows && portfolioData.rows.length > 0) {
        console.log(`📊 Sample project: ${portfolioData.rows[0].name}`);
      }
    } else {
      const error = await dbResponse.text();
      console.log(`❌ Portfolio API Error: ${error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProductionEnv().catch(console.error);
