import fetch from 'node-fetch';

const API_BASE = 'https://ticket-apw-api.vercel.app/api';

// Test data
const testUser = {
  email: "jakgrits.ph@appworks.co.th",
  password: "AppWorks@123!",
};

async function testProjectsOnly() {
  console.log('🧪 Testing Projects API specifically...\n');

  try {
    // 1. Test health check first
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);

    if (healthData.database !== 'connected') {
      console.error('❌ Database connection failed!');
      console.log('Database error details:', healthData.databaseDetails);
      return;
    }
    console.log('✅ Health check passed\n');

    // 2. Test login
    console.log('2. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status, loginResponse.statusText);
      const errorData = await loginResponse.text();
      console.error('Error details:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, got token\n');

    // 3. Test projects endpoint specifically
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    console.log('3. Testing projects endpoint...');
    const projectsResponse = await fetch(`${API_BASE}/projects`, { headers });

    console.log('Response status:', projectsResponse.status);
    console.log('Response headers:', Object.fromEntries(projectsResponse.headers.entries()));

    if (projectsResponse.ok) {
      const projects = await projectsResponse.json();
      console.log('✅ Projects fetched successfully');
      console.log(`Found ${projects.length} projects`);
      if (projects.length > 0) {
        console.log('Sample project:', projects[0]);
      }
    } else {
      console.error('❌ Projects endpoint failed');
      const errorText = await projectsResponse.text();
      console.error('Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testProjectsOnly();