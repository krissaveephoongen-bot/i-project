import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Test Redis connection
    const client = await redis.getClient();
    
    // Test basic operations
    const testKey = 'health_check_' + Date.now();
    const testValue = 'Redis is working!';
    
    // Test SET operation
    await client.set(testKey, testValue, { EX: 10 }); // 10 seconds TTL
    
    // Test GET operation
    const retrievedValue = await client.get(testKey);
    
    // Test DELETE operation
    await client.del(testKey);
    
    // Get Redis info
    const info = await client.info();
    
    // Parse Redis info for stats
    const lines = info.split('\r\n');
    const stats: Record<string, string> = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    });

    return NextResponse.json({
      status: 'healthy',
      redis: {
        connected: true,
        test_result: retrievedValue === testValue,
        version: stats.redis_version || 'unknown',
        uptime: stats.uptime_in_seconds ? `${stats.uptime_in_seconds}s` : 'unknown',
        memory: stats.used_memory_human || 'unknown',
        clients: stats.connected_clients || 'unknown',
        operations: {
          total_commands_processed: stats.total_commands_processed || 'unknown',
          instantaneous_ops_per_sec: stats.instantaneous_ops_per_sec || 'unknown'
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('Redis health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      redis: {
        connected: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
