#!/usr/bin/env node

/**
 * Redis Connection Test Script
 * Tests all Redis functionality
 */

import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.error('❌ REDIS_URL not set in .env');
  process.exit(1);
}

async function testRedis() {
  console.log('🧪 Testing Redis Connection...\n');
  
  const client = createClient({ url: REDIS_URL });

  try {
    console.log('1️⃣  Connecting to Redis...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('2️⃣  Testing PING...');
    const pong = await client.ping();
    console.log(`✅ PING response: ${pong}\n`);

    console.log('3️⃣  Setting value...');
    await client.set('test:key', JSON.stringify({ message: 'Hello Redis' }));
    console.log('✅ Value set\n');

    console.log('4️⃣  Getting value...');
    const value = await client.get('test:key');
    console.log(`✅ Retrieved: ${value}\n`);

    console.log('5️⃣  Testing TTL (10 seconds)...');
    await client.setEx('test:ttl', 10, JSON.stringify({ expires: 'soon' }));
    const ttl = await client.ttl('test:ttl');
    console.log(`✅ TTL set to ${ttl} seconds\n`);

    console.log('6️⃣  Listing all keys...');
    const keys = await client.keys('test:*');
    console.log(`✅ Found ${keys.length} keys: ${keys.join(', ')}\n`);

    console.log('7️⃣  Deleting key...');
    const deleted = await client.del('test:key');
    console.log(`✅ Deleted ${deleted} key(s)\n`);

    console.log('8️⃣  Flushing database...');
    await client.flushDb();
    console.log('✅ Database flushed\n');

    console.log('✨ All tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start backend: npm run dev:backend');
    console.log('2. Test endpoint: curl http://localhost:3001/api/cache/health');
    console.log('3. Set cache: curl -X POST http://localhost:3001/api/cache/set -d "..."');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('- Check REDIS_URL in .env');
    console.error('- Verify Redis server is running');
    console.error('- Check firewall/network connectivity');
    process.exit(1);
  } finally {
    await client.quit();
    console.log('\n👋 Disconnected from Redis');
  }
}

testRedis();
