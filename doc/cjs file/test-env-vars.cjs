#!/usr/bin/env node

/**
 * 🔍 Test Environment Variables Loading
 */

console.log('🔍 Testing Environment Variables Loading...\n');

// Test if environment variables are accessible
const requiredVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('📋 Checking Environment Variables:');

let allFound = true;
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: NOT FOUND`);
    allFound = false;
  }
}

console.log('\n🎯 Environment Variables Status:');
if (allFound) {
  console.log('✅ All required environment variables are loaded!');
} else {
  console.log('❌ Some environment variables are missing.');
  console.log('\n💡 Solution:');
  console.log('1. Restart the development server');
  console.log('2. Check if .env.local is in the correct location');
  console.log('3. Verify Next.js is loading the environment variables');
}

// Test Next.js environment loading
console.log('\n🔧 Testing Next.js Environment Loading...');

// Try to load Next.js config
try {
  const nextAppPath = './next-app';
  const { spawn } = require('child_process');
  
  const testProcess = spawn('node', ['-e', `
    require('dotenv').config({ path: '../.env.local' });
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'FOUND' : 'NOT FOUND');
  `], {
    cwd: nextAppPath,
    stdio: 'pipe',
    shell: true
  });
  
  testProcess.stdout.on('data', (data) => {
    console.log('Next.js env test:', data.toString().trim());
  });
  
  testProcess.stderr.on('data', (data) => {
    console.log('Next.js env error:', data.toString().trim());
  });
  
  testProcess.on('close', (code) => {
    console.log('\n🚀 Next Steps:');
    console.log('1. Restart development server: cd next-app && npm run dev');
    console.log('2. Run tests again: node robust-crud-tests.cjs');
    console.log('3. Check server console for any remaining errors');
  });
  
} catch (error) {
  console.log('❌ Error testing Next.js environment:', error.message);
}
