import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check API endpoints health
    const apiEndpoints = [
      '/api/health',
      '/api/projects',
      '/api/tasks',
      '/api/users',
      '/api/milestones',
      '/api/redis/health'
    ];

    const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
    const apiHealthChecks = await Promise.allSettled(
      apiEndpoints.map(async (endpoint) => {
        const start = Date.now();
        try {
          const response = await fetch(`${base}${endpoint}`, {
            cache: 'no-store',
            headers: {
              'User-Agent': 'System-Health-Check/1.0'
            }
          });
          const responseTime = Date.now() - start;
          
          return {
            endpoint,
            healthy: response.ok,
            status: response.status,
            responseTime,
            error: response.ok ? null : `HTTP ${response.status}`
          };
        } catch (error) {
          return {
            endpoint,
            healthy: false,
            status: 0,
            responseTime: Date.now() - start,
            error: (error as Error).message
          };
        }
      })
    );

    // Calculate API metrics
    const healthyEndpoints = apiHealthChecks.filter(check => check.status === 'fulfilled' && check.value.healthy).length;
    const totalEndpoints = apiHealthChecks.length;
    const avgResponseTime = apiHealthChecks
      .filter(check => check.status === 'fulfilled')
      .reduce((sum, check) => sum + check.value.responseTime, 0) / 
      apiHealthChecks.filter(check => check.status === 'fulfilled').length || 1;

    const systemHealth = {
      api: {
        healthy: healthyEndpoints === totalEndpoints,
        endpoints: totalEndpoints,
        healthyEndpoints,
        avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
        errorRate: `${((totalEndpoints - healthyEndpoints) / totalEndpoints * 100).toFixed(2)}%`,
        checks: apiHealthChecks.map(check => ({
          endpoint: check.status === 'fulfilled' ? check.value : check,
          status: check.status
        }))
      },
      system: {
        uptime: process.uptime || 0,
        memory: process.memoryUsage || {},
        platform: process.platform,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    };

    return NextResponse.json({
      success: true,
      status: systemHealth.api.healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      ...systemHealth
    });

  } catch (error: any) {
    console.error('System health check error:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
