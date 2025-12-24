/**
 * Database Connection Test Script
 * Tests the Neon PostgreSQL connection implementation
 */

const { testConnection, healthCheck, getConnectionStatus } = require('./neon-connection');
const { initializeDatabase } = require('./database-config');

async function runTests() {
  console.log('🧪 Starting Neon PostgreSQL connection tests...');
  console.log('===========================================');

  try {
    // Test 1: Initialize database
    console.log('🔧 Test 1: Initializing database...');
    await initializeDatabase();

    // Test 2: Get connection status
    console.log('\n📊 Test 2: Getting connection status...');
    const status = getConnectionStatus();
    console.log('Connection Status:', status);

    // Test 3: Test connection
    console.log('\n🔌 Test 3: Testing database connection...');
    const connectionOk = await testConnection(0, 3); // 3 retries
    console.log('Connection Test Result:', connectionOk ? '✅ SUCCESS' : '❌ FAILED');

    // Test 4: Health check
    console.log('\n⚕️  Test 4: Running health check...');
    const health = await healthCheck();
    console.log('Health Check Result:', health.status.toUpperCase());
    if (health.status === 'healthy') {
      console.log('📅 Server Time:', health.currentTime);
      console.log('🛢️  PostgreSQL Version:', health.postgresVersion);
    }

    // Test 5: Simple query test
    if (connectionOk) {
      console.log('\n📊 Test 5: Running simple query...');
      const { executeQuery } = require('./neon-connection');
      const result = await executeQuery('SELECT NOW() as test_time, version() as db_version');
      console.log('✅ Query successful!');
      console.log('🕒 Test Time:', result.rows[0].test_time);
      console.log('📦 PostgreSQL Version:', result.rows[0].db_version);
    }

    console.log('\n🎉 All tests completed!');
    console.log('===========================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();