const API_URL = 'https://ticket-apw-api.vercel.app/api';

async function testEndpoint(name, method, url, options = {}) {
  try {
    const response = await fetch(API_URL + url, {
      method,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    const passed = response.status < 500; // Accept 200-499 as potentially valid
    const status = passed ? '✅' : '❌';
    
    console.log(`${status} ${name}`);
    console.log(`   Status: ${response.status}`);
    if (text.length < 200) {
      console.log(`   Response: ${text.substring(0, 150)}`);
    } else {
      console.log(`   Response: ${text.substring(0, 100)}... (truncated)`);
    }
    console.log('');
    
    return { name, status: response.status, passed, data };
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}\n`);
    return { name, status: 'ERROR', passed: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Additional API Endpoints...\n');
  
  // Login first to get token
  let token = null;
  try {
    const loginRes = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jakgrits.ph@appworks.co.th',
        password: 'AppWorks@123!'
      })
    });
    const loginData = await loginRes.json();
    if (loginData.token) {
      token = loginData.token;
      console.log('✓ Login successful, token obtained\n');
    }
  } catch (e) {
    console.log('✗ Login failed, some tests may fail\n');
  }
  
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  const results = [];
  
  // Analytics endpoints
  results.push(await testEndpoint('GET /api/analytics/dashboard', 'GET', '/analytics/dashboard', { headers: authHeaders }));
  results.push(await testEndpoint('GET /api/analytics/projects', 'GET', '/analytics/projects', { headers: authHeaders }));
  results.push(await testEndpoint('GET /api/analytics/tasks', 'GET', '/analytics/tasks', { headers: authHeaders }));
  
  // Expenses endpoints
  results.push(await testEndpoint('GET /api/expenses', 'GET', '/expenses', { headers: authHeaders }));
  
  // Timesheets endpoints
  results.push(await testEndpoint('GET /api/timesheets', 'GET', '/timesheets', { headers: authHeaders }));
  
  // Search endpoints
  results.push(await testEndpoint('GET /api/search?q=test', 'GET', '/search?q=test', { headers: authHeaders }));
  results.push(await testEndpoint('GET /api/search?q=project&type=project', 'GET', '/search?q=project&type=project', { headers: authHeaders }));
  
  // Teams endpoints
  results.push(await testEndpoint('GET /api/teams', 'GET', '/teams', { headers: authHeaders }));
  
  // Project Managers endpoints
  results.push(await testEndpoint('GET /api/project-managers', 'GET', '/project-managers', { headers: authHeaders }));
  
  // Reports endpoints
  results.push(await testEndpoint('GET /api/reports', 'GET', '/reports', { headers: authHeaders }));
  
  // Resources endpoints
  results.push(await testEndpoint('GET /api/resources', 'GET', '/resources', { headers: authHeaders }));
  
  // Resource Utilization endpoints
  results.push(await testEndpoint('GET /api/resource-utilization', 'GET', '/resource-utilization', { headers: authHeaders }));
  
  // Team Capacity endpoints
  results.push(await testEndpoint('GET /api/team-capacity', 'GET', '/team-capacity', { headers: authHeaders }));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\n📊 Results: ${passed}/${total} endpoints responded (non-500)`);
  console.log('\n⚠️  Note: 404/401 responses may be expected if endpoints require specific data or permissions');
}

runTests().catch(console.error);
