// Test Executive Report API in detail
const https = require('https');

const PROD_URL = 'https://i-projects.skin';

async function testExecutiveReport() {
  console.log('🔍 Testing Executive Report API in detail...\n');
  
  try {
    const response = await fetch(`${PROD_URL}/api/projects/executive-report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Status Text: ${response.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`📄 Response Length: ${text.length} chars`);
    console.log(`📄 Response (first 500 chars):`, text.substring(0, 500));
    
    if (text.length > 500) {
      console.log(`📄 Response (last 500 chars):`, text.substring(text.length - 500));
    }
    
    try {
      const json = JSON.parse(text);
      console.log(`📋 Parsed JSON:`, json);
    } catch (e) {
      console.log(`❌ JSON Parse Error: ${e.message}`);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testExecutiveReport().catch(console.error);
