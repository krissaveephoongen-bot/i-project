// Debug Executive Report API step by step
const https = require('https');

async function debugExecutiveReport() {
  console.log('🔍 Debugging Executive Report API...\n');
  
  try {
    // Step 1: Test projects query
    console.log('1️⃣ Testing projects query:');
    const projectsResponse = await fetch('https://i-projects.skin/api/projects/executive-report', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`📊 Status: ${projectsResponse.status}`);
    
    if (!projectsResponse.ok) {
      const error = await projectsResponse.text();
      console.log(`❌ Error: ${error}`);
      
      // Try to understand which database it's connecting to
      console.log('\n2️⃣ Testing direct database connection to verify which DB is being used:');
      
      // Test if it's using the old database
      const oldDbTest = await fetch('https://i-projects.skin/api/dashboard/portfolio', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (oldDbTest.ok) {
        const portfolioData = await oldDbTest.json();
        console.log(`📊 Portfolio API finds ${portfolioData.rows?.length || 0} projects`);
        
        // Check if these are the new projects (Thai names) or old projects
        if (portfolioData.rows && portfolioData.rows.length > 0) {
          const sampleProject = portfolioData.rows[0];
          console.log(`📊 Sample project name: "${sampleProject.name}"`);
          
          if (sampleProject.name.includes('เว็บไซต์') || sampleProject.name.includes('ระบบ')) {
            console.log('✅ Portfolio API is using NEW database (Thai project names)');
          } else {
            console.log('❌ Portfolio API is using OLD database');
          }
        }
      }
      
      // The issue might be that Executive Report API is cached or using different env vars
      console.log('\n3️⃣ Testing cache bypass:');
      const cacheBypassResponse = await fetch('https://i-projects.skin/api/projects/executive-report?t=' + Date.now(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`📊 Cache bypass status: ${cacheBypassResponse.status}`);
      
      if (!cacheBypassResponse.ok) {
        const cacheError = await cacheBypassResponse.text();
        console.log(`❌ Cache bypass error: ${cacheError}`);
      }
    } else {
      const data = await projectsResponse.json();
      console.log('✅ Executive Report API working!');
      console.log(`📊 Data: ${JSON.stringify(data, null, 2).substring(0, 500)}...`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugExecutiveReport().catch(console.error);
