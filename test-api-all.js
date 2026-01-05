const API_URL = 'https://ticket-apw-api.vercel.app';

const tests = [
  {
    name: 'GET /',
    method: 'GET',
    url: '/',
    expectStatus: 200
  },
  {
    name: 'GET /api/health',
    method: 'GET',
    url: '/api/health',
    expectStatus: 200
  },
  {
    name: 'GET /api/projects',
    method: 'GET',
    url: '/api/projects',
    expectStatus: 200
  },
  {
    name: 'GET /api/tasks',
    method: 'GET',
    url: '/api/tasks',
    expectStatus: 200
  },
  {
    name: 'POST /api/auth/login (invalid credentials)',
    method: 'POST',
    url: '/api/auth/login',
    body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
    headers: { 'Content-Type': 'application/json' },
    expectStatus: 401
  },
  {
    name: 'POST /api/auth/register',
    method: 'POST',
    url: '/api/auth/register',
    body: JSON.stringify({ 
      name: 'Test User',
      email: 'testuser' + Date.now() + '@example.com',
      password: 'password123',
      department: 'IT',
      position: 'Developer'
    }),
    headers: { 'Content-Type': 'application/json' },
    expectStatus: 201
  },
  {
    name: 'GET /api/auth/me (no token)',
    method: 'GET',
    url: '/api/auth/me',
    expectStatus: 401
  },
  {
    name: 'POST /api/auth/logout',
    method: 'POST',
    url: '/api/auth/logout',
    expectStatus: 200
  }
];

async function runTests() {
  console.log('🧪 Running API Tests...\n');
  const results = [];
  
  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: test.headers || {}
      };
      
      if (test.body) {
        options.body = test.body;
      }
      
      const response = await fetch(API_URL + test.url, options);
      const data = await response.text();
      
      const passed = response.status === test.expectStatus;
      const status = passed ? '✅' : '❌';
      
      results.push({
        test: test.name,
        status: response.status,
        expected: test.expectStatus,
        passed
      });
      
      console.log(`${status} ${test.name}`);
      console.log(`   Status: ${response.status} (expected ${test.expectStatus})`);
      if (data && data.length < 200) {
        console.log(`   Response: ${data.substring(0, 150)}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}\n`);
      results.push({
        test: test.name,
        status: 'ERROR',
        expected: test.expectStatus,
        passed: false
      });
    }
  }
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
}

runTests().catch(console.error);
