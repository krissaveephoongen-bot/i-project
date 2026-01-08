
import axios from 'axios';

const API_URL = 'https://ticket-apw-api.vercel.app/api';
const credentials = {
  email: 'jakgrits.ph@appworks.co.th',
  password: 'AppWorks@123!',
};

const testApi = async () => {
  let token;

  // 1. Health Check
  try {
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    if (healthResponse.status === 200 && healthResponse.data.status === 'ok') {
      console.log('   ✅ Health Check successful!');
    } else {
      console.error('   ❌ Health Check failed:', healthResponse.data);
      return; // Stop if health check fails
    }
  } catch (error) {
    console.error('   ❌ Error during Health Check:', error.response ? error.response.data : error.message);
    return;
  }


  // 2. Authentication
  try {
    console.log('\n2. Testing Authentication (Login)...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, credentials);
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      token = loginResponse.data.token;
      console.log('   ✅ Login successful, received JWT token.');
    } else {
      console.error('   ❌ Login failed:', loginResponse.data);
      return; // Stop if login fails
    }
  } catch (error) {
    console.error('   ❌ Error during login:', error.response ? error.response.data : error.message);
    return;
  }

  // 3. Access a Protected Route (Get Projects)
  try {
    console.log('\n3. Testing Protected Route (GET /api/projects)...');
    const projectsResponse = await axios.get(`${API_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (projectsResponse.status === 200 && Array.isArray(projectsResponse.data)) {
      console.log(`   ✅ Successfully fetched projects. Found ${projectsResponse.data.length} projects.`);
    } else {
      console.error('   ❌ Failed to fetch projects:', projectsResponse.data);
    }
  } catch (error) {
    console.error('   ❌ Error fetching projects:', error.response ? error.response.data : error.message);
  }

  // 4. Test another route (e.g., Get Users)
  try {
    console.log('\n4. Testing Protected Route (GET /api/users)...');
    const usersResponse = await axios.get(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (usersResponse.status === 200 && Array.isArray(usersResponse.data)) {
        console.log(`   ✅ Successfully fetched users. Found ${usersResponse.data.length} users.`);
    } else {
        console.error('   ❌ Failed to fetch users:', usersResponse.data);
    }
  } catch (error) {
      console.error('   ❌ Error fetching users:', error.response ? error.response.data : error.message);
  }


    // 5. Test another route (e.g., Get Customers)
  try {
    console.log('\n5. Testing Protected Route (GET /api/customers)...');
    const customersResponse = await axios.get(`${APIURL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (customersResponse.status === 200 && Array.isArray(customersResponse.data)) {
        console.log(`   ✅ Successfully fetched customers. Found ${customersResponse.data.length} customers.`);
    } else {
        console.error('   ❌ Failed to fetch customers:', customersResponse.data);
    }
  } catch (error) {
      console.error('   ❌ Error fetching customers:', error.response ? error.response.data : error.message);
  }


  console.log('\nAPI testing completed.');
};

testApi();
