// Database Connection Test
// This script will test the database connection directly

import { checkDatabaseConnection } from './lib/db.js';

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  try {
    const result = await checkDatabaseConnection();
    
    if (result.success) {
      console.log('✅ Database connection successful!');
      console.log('Data:', result.data);
    } else {
      console.log('❌ Database connection failed!');
      console.log('Error:', result.error);
      console.log('Code:', result.code);
    }
  } catch (error) {
    console.log('💥 Unexpected error:', error.message);
  }
}

testConnection();
