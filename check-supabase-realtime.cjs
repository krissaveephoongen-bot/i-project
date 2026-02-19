#!/usr/bin/env node

const https = require('https');

const SUPABASE_URL = 'https://rllhsiguqezuzltsjntp.supabase.co';
const ANON_KEY = 'sb_publishable_Li6yHYpREmlVIDXTqtAh_Q_hUDf4RCb';

console.log('🔍 Checking Supabase Realtime configuration...\n');

// Extract project ID from URL
const projectId = SUPABASE_URL.split('https://')[1].split('.supabase.co')[0];
console.log(`Project ID: ${projectId}`);
console.log(`SUPABASE_URL: ${SUPABASE_URL}`);
console.log(`Realtime WebSocket URL: wss://${projectId}.supabase.co/realtime/v1/websocket`);

// Test 1: Check if REST API is accessible
console.log('\n✓ Testing REST API...');
const restTestOptions = {
  hostname: `${projectId}.supabase.co`,
  path: '/rest/v1/projects',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 5000,
};

https.request(restTestOptions, (res) => {
  console.log(`  REST API Status: ${res.statusCode}`);
  if (res.statusCode === 200 || res.statusCode === 401) {
    console.log('  ✓ REST API is accessible');
  }
}).on('error', (err) => {
  console.log(`  ✗ REST API error: ${err.message}`);
}).end();

// Test 2: Check PostgreSQL connection
console.log('\n✓ Testing PostgreSQL connection...');
const pgTestOptions = {
  hostname: 'aws-1-ap-southeast-2.pooler.supabase.com',
  path: '/',
  method: 'CONNECT',
  headers: {
    'Host': 'aws-1-ap-southeast-2.pooler.supabase.com:5432',
  },
  timeout: 5000,
};

https.request(pgTestOptions, (res) => {
  console.log(`  PostgreSQL Status: ${res.statusCode}`);
}).on('error', (err) => {
  console.log(`  PostgreSQL connection attempt: ${err.message}`);
}).end();

console.log('\n📝 Troubleshooting steps:');
console.log('1. Verify Realtime is enabled: Supabase Dashboard → Settings → Realtime');
console.log('2. Check RLS policies: Supabase Dashboard → Authentication → Policies');
console.log('3. Ensure all required env vars are set:');
console.log(`   - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗'}`);
console.log(`   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗'}`);
console.log('4. Check WebSocket connectivity: Most development environments restrict WebSockets');
console.log('5. For local development, consider using polling instead of Realtime');
console.log('\n💡 Tip: Realtime subscriptions are not critical - the app will work with polling.');
