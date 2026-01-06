import fetch from 'node-fetch';

const API_BASE = 'https://ticket-apw-api.vercel.app/api';

// Test data
const testUser = {
  email: "jakgrits.ph@appworks.co.th",
  password: "AppWorks@123!",
};

async function testEndpoint(name, url, options = {}) {
  console.log(`Testing ${name}...`);
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${name} - Success`);
      if (Array.isArray(data)) {
        console.log(`   Found ${data.length} items`);
      } else if (data.user || data.token) {
        console.log(`   User: ${data.user?.name || 'N/A'}, Token: ${data.token ? 'Yes' : 'No'}`);
      }
      return { success: true, data };
    } else {
      console.log(`❌ ${name} - Failed (${response.status})`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAPI() {
  console.log('🧪 Testing all API endpoints...\n');

  try {
    // 1. Test health check
    const healthResult = await testEndpoint('Health Check', `${API_BASE}/health`);
    if (!healthResult.success || healthResult.data?.database !== 'connected') {
      console.error('❌ Database connection failed! Cannot proceed with tests.');
      if (healthResult.data?.databaseDetails) {
        console.log('Database details:', healthResult.data.databaseDetails);
      } else if (healthResult.error) {
        console.log('Health check error:', healthResult.error);
      }
      return;
    }
    console.log('');

    // 2. Test login
    const loginResult = await testEndpoint('Login', `${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    if (!loginResult.success) {
      console.error('❌ Login failed! Cannot proceed with authenticated tests.');
      return;
    }

    const token = loginResult.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    console.log('');

    // 3. Test all authenticated endpoints
    const endpoints = [
      { name: 'Users List', url: `${API_BASE}/users`, options: { headers } },
      { name: 'Projects List', url: `${API_BASE}/projects`, options: { headers } },
      { name: 'Tasks List', url: `${API_BASE}/tasks`, options: { headers } },
      { name: 'Timesheets List', url: `${API_BASE}/timesheets`, options: { headers } },
      { name: 'Expenses List', url: `${API_BASE}/expenses`, options: { headers } },
      { name: 'Customers List', url: `${API_BASE}/customers`, options: { headers } },
      { name: 'Teams List', url: `${API_BASE}/teams`, options: { headers } },
      { name: 'Analytics', url: `${API_BASE}/analytics`, options: { headers } },
      { name: 'Reports', url: `${API_BASE}/reports`, options: { headers } },
    ];

    for (const endpoint of endpoints) {
      await testEndpoint(endpoint.name, endpoint.url, endpoint.options);
    }

    console.log('\n🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
  }
}

testAPI();