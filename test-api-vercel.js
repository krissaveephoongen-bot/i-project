import fetch from 'node-fetch';

const API_BASE = 'https://ticket-apw-api.vercel.app/api';

// Test data
const testUser = {
  email: "jakgrits.ph@appworks.co.th",
  password: "AppWorks@123!",
};

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // 1. Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);

    if (healthData.database !== 'connected') {
      console.error('❌ Database connection failed!');
      return;
    }
    console.log('✅ Health check passed\n');

    // 2. Test login
    console.log('2. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status, loginResponse.statusText);
      const errorData = await loginResponse.text();
      console.error('Error details:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('User:', loginData.user);
    const token = loginData.token;
    console.log('Token received:', token ? 'Yes' : 'No');

    if (!token) {
      console.error('❌ No token received from login');
      return;
    }
    console.log('');

    // 3. Test authenticated endpoints
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Test users endpoint
    console.log('3. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE}/users`, { headers });
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('✅ Users fetched successfully');
      console.log(`Found ${users.length} users`);
    } else {
      console.error('❌ Users endpoint failed:', usersResponse.status, usersResponse.statusText);
      const errorData = await usersResponse.text();
      console.error('Error details:', errorData);
    }
    console.log('');

    // Test projects endpoint
    console.log('4. Testing projects endpoint...');
    const projectsResponse = await fetch(`${API_BASE}/projects`, { headers });
    if (projectsResponse.ok) {
      const projects = await projectsResponse.json();
      console.log('✅ Projects fetched successfully');
      console.log(`Found ${projects.length} projects`);
    } else {
      console.error('❌ Projects endpoint failed:', projectsResponse.status, projectsResponse.statusText);
      const errorData = await projectsResponse.text();
      console.error('Error details:', errorData);
    }
    console.log('');

    console.log('🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testAPI();