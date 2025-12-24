/**
 * Test Expenses API
 * Simple script to test the expenses endpoint
 */

const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function testExpensesAPI() {
  console.log('Testing Expenses API...\n');

  try {
    // Test 1: Get all expenses
    console.log('1. Testing GET /expenses');
    const getResponse = await fetch(`${API_BASE}/expenses`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log(`   ✓ Success: Retrieved ${data.length || 0} expenses`);
      if (data.length > 0) {
        console.log(`   Sample: ${JSON.stringify(data[0], null, 2)}`);
      }
    } else {
      console.log(`   ✗ Failed: ${getResponse.status} ${getResponse.statusText}`);
      const error = await getResponse.text();
      console.log(`   Error: ${error}`);
    }

    // Test 2: Get expenses with filters
    console.log('\n2. Testing GET /expenses?status=pending');
    const filterResponse = await fetch(`${API_BASE}/expenses?status=pending`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (filterResponse.ok) {
      const data = await filterResponse.json();
      console.log(`   ✓ Success: Retrieved ${data.length || 0} pending expenses`);
    } else {
      console.log(`   ✗ Failed: ${filterResponse.status}`);
    }

    console.log('\n✓ Tests completed');
  } catch (error) {
    console.error('✗ Error testing API:', error.message);
    process.exit(1);
  }
}

// Wait for server to be ready
setTimeout(() => {
  testExpensesAPI();
}, 1000);
