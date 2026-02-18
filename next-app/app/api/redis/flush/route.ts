import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST() {
  try {
    const client = await redis.getClient();
    
    // Get all keys before flushing
    const keys = await client.keys('*');
    const keyCount = keys.length;
    
    // Flush all data
    await client.flushAll();
    
    return NextResponse.json({
      success: true,
      message: 'Redis database flushed successfully',
      flushed_keys: keyCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Redis flush error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
