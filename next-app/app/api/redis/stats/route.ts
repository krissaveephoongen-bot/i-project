import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const client = await redis.getClient();
    
    // Get Redis info
    const info = await client.info();
    
    // Parse Redis info
    const lines = info.split('\r\n');
    const stats: Record<string, any> = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    });

    // Get memory usage details
    const memoryStats = {
      used_memory: stats.used_memory_human || 'unknown',
      used_memory_rss: stats.used_memory_rss_human || 'unknown',
      used_memory_peak: stats.used_memory_peak_human || 'unknown',
      used_memory_overhead: stats.used_memory_overhead_human || 'unknown',
      memory_fragmentation_ratio: stats.mem_fragmentation_ratio || 'unknown'
    };

    // Get performance stats
    const performanceStats = {
      total_commands_processed: stats.total_commands_processed || '0',
      instantaneous_ops_per_sec: stats.instantaneous_ops_per_sec || '0',
      total_connections_received: stats.total_connections_received || '0',
      rejected_connections: stats.rejected_connections || '0',
      sync_full: stats.sync_full || '0',
      sync_partial_ok: stats.sync_partial_ok || '0',
      sync_partial_err: stats.sync_partial_err || '0'
    };

    // Get key space stats
    const keySpaceStats = {
      keys: stats.db0 ? stats.db0.split(',')[0].split('=')[1] || '0' : '0',
      expires: stats.db0 ? stats.db0.split(',')[1].split('=')[1] || '0' : '0',
      avg_ttl: stats.db0 ? stats.db0.split(',')[2].split('=')[1] || '0' : '0'
    };

    // Get uptime and version
    const systemStats = {
      redis_version: stats.redis_version || 'unknown',
      redis_mode: stats.redis_mode || 'standalone',
      uptime_in_seconds: stats.uptime_in_seconds || '0',
      uptime_in_days: stats.uptime_in_days || '0',
      connected_clients: stats.connected_clients || '0',
      client_recent_max_input_buffer: stats.client_recent_max_input_buffer || '0',
      client_recent_max_output_buffer: stats.client_recent_max_output_buffer || '0'
    };

    // Calculate hit rate
    const hits = parseInt(stats.keyspace_hits || '0');
    const misses = parseInt(stats.keyspace_misses || '0');
    const totalRequests = hits + misses;
    const hitRate = totalRequests > 0 ? ((hits / totalRequests) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      memory: memoryStats,
      performance: performanceStats,
      key_space: keySpaceStats,
      system: systemStats,
      hit_rate: `${hitRate}%`,
      hits: hits.toString(),
      misses: misses.toString(),
      total_requests: totalRequests.toString()
    });
    
  } catch (error: any) {
    console.error('Redis stats error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
