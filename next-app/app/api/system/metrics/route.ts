import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Get system metrics
    const systemMetrics = {
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime || 0,
        memory: process.memoryUsage || {},
        cpuUsage: process.cpuUsage ? process.cpuUsage() : null,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid
      },
      redis: {
        connected: false,
        memory: '0B',
        keys: '0',
        hitRate: '0%',
        opsPerSec: '0',
        uptime: '0s',
        version: 'unknown'
      },
      database: {
        connected: false,
        urlPresent: false,
        keyPresent: false,
        responseTime: '0ms'
      },
      api: {
        endpoints: 0,
        healthyEndpoints: 0,
        avgResponseTime: '0ms',
        errorRate: '0%'
      },
      timestamp: new Date().toISOString()
    };

    // Get Redis metrics
    try {
      const redisHealth = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/redis/health`, {
        cache: 'no-store'
      });
      
      if (redisHealth.ok) {
        const redisData = await redisHealth.json();
        systemMetrics.redis = {
          connected: redisData.redis?.connected || false,
          memory: redisData.redis?.memory || '0B',
          keys: redisData.redis?.keys || '0',
          hitRate: redisData.redis?.hit_rate || '0%',
          opsPerSec: redisData.redis?.operations?.instantaneous_ops_per_sec || '0',
          uptime: redisData.timestamp ? `${Math.floor((Date.now() - new Date(redisData.timestamp).getTime()) / 1000)}s` : '0s',
          version: redisData.redis?.version || 'unknown'
        };
      }
    } catch (error) {
      console.error('Failed to get Redis metrics:', error);
    }

    // Get database metrics
    try {
      const dbHealth = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/health`, {
        cache: 'no-store'
      });
      
      if (dbHealth.ok) {
        const dbData = await dbHealth.json();
        systemMetrics.database = {
          connected: dbData?.supabase?.connected || false,
          urlPresent: dbData?.supabase?.urlPresent || false,
          keyPresent: dbData?.supabase?.keyPresent || false,
          responseTime: '0ms' // Would need to implement timing
        };
      }
    } catch (error) {
      console.error('Failed to get database metrics:', error);
    }

    // Get API metrics
    try {
      const apiHealth = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/system/health`, {
        cache: 'no-store'
      });
      
      if (apiHealth.ok) {
        const apiData = await apiHealth.json();
        systemMetrics.api = {
          endpoints: apiData.api?.endpoints || 0,
          healthyEndpoints: apiData.api?.healthyEndpoints || 0,
          avgResponseTime: apiData.api?.avgResponseTime || '0ms',
          errorRate: apiData.api?.errorRate || '0%'
        };
      }
    } catch (error) {
      console.error('Failed to get API metrics:', error);
    }

    // Calculate overall system health
    const healthyComponents = [
      systemMetrics.redis.connected,
      systemMetrics.database.connected,
      systemMetrics.api.healthyEndpoints === systemMetrics.api.endpoints
    ].filter(Boolean).length;

    const totalComponents = 3;
    const overallHealth = healthyComponents === totalComponents ? 'healthy' : 
                          healthyComponents > 0 ? 'degraded' : 'unhealthy';

    return NextResponse.json({
      success: true,
      overall: overallHealth,
      health_score: Math.round((healthyComponents / totalComponents) * 100),
      components: {
        redis: systemMetrics.redis.connected,
        database: systemMetrics.database.connected,
        api: systemMetrics.api.endpoints > 0 && systemMetrics.api.healthyEndpoints === systemMetrics.api.endpoints
      },
      metrics: systemMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('System metrics error:', error);
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
