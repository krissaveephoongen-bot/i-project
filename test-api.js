const http = require('https');

async function testAPIs() {
  const baseUrl = 'https://ticket-apw.vercel.app/api';
  
  console.log('Testing API Endpoints...\n');

  // Test 1: Health check
  console.log('1. Testing /api/health');
  try {
    const health = await fetch(`${baseUrl}/health`).then(r => r.json());
    console.log('✓ /api/health:', health);
  } catch (e) {
    console.log('✗ /api/health failed:', e.message);
  }

  // Test 2: Login
  console.log('\n2. Testing /api/auth/login');
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jakgrits.ph@appworks.co.th',
        password: 'AppWorks@123!'
      })
    }).then(r => r.json());
    
    if (loginRes.token) {
      console.log('✓ /api/auth/login: Success');
      console.log('  User:', loginRes.user.name);
      console.log('  Token:', loginRes.token.substring(0, 20) + '...');

      // Test 3: /me endpoint
      console.log('\n3. Testing /api/auth/me');
      try {
        const me = await fetch(`${baseUrl}/auth/me`, {
          headers: { 'Authorization': `Bearer ${loginRes.token}` }
        }).then(r => r.json());
        console.log('✓ /api/auth/me:', me.name || JSON.stringify(me).substring(0, 50));
      } catch (e) {
        console.log('✗ /api/auth/me failed:', e.message);
      }
    } else {
      console.log('✗ /api/auth/login failed:', loginRes.error);
    }
  } catch (e) {
    console.log('✗ /api/auth/login error:', e.message);
  }

  // Test 4: Projects endpoint
  console.log('\n4. Testing /api/projects');
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jakgrits.ph@appworks.co.th',
        password: 'AppWorks@123!'
      })
    }).then(r => r.json());

    const projects = await fetch(`${baseUrl}/projects`, {
      headers: { 'Authorization': `Bearer ${loginRes.token}` }
    }).then(r => r.json());
    
    console.log('✓ /api/projects:', Array.isArray(projects) ? `${projects.length} projects` : JSON.stringify(projects).substring(0, 50));
  } catch (e) {
    console.log('✗ /api/projects failed:', e.message);
  }

  // Test 5: Users endpoint
  console.log('\n5. Testing /api/users');
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jakgrits.ph@appworks.co.th',
        password: 'AppWorks@123!'
      })
    }).then(r => r.json());

    const users = await fetch(`${baseUrl}/users`, {
      headers: { 'Authorization': `Bearer ${loginRes.token}` }
    }).then(r => r.json());
    
    console.log('✓ /api/users:', Array.isArray(users) ? `${users.length} users` : JSON.stringify(users).substring(0, 50));
  } catch (e) {
    console.log('✗ /api/users failed:', e.message);
  }
}

testAPIs();
