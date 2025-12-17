/**
 * Performance Monitoring Service
 * Tracks metrics, response times, and resource usage
 */

const os = require('os');
const logger = require('../middleware/logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      requests: [],
      database: [],
      endpoints: new Map(),
      systemMetrics: []
    };
    this.collectSystemMetrics();
  }

  collectSystemMetrics() {
    setInterval(() => {
      const metric = {
        timestamp: new Date().toISOString(),
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        systemLoad: os.loadavg(),
        freeMem: os.freemem(),
        totalMem: os.totalmem()
      };
      this.metrics.systemMetrics.push(metric);
      
      // Keep only last 1000 metrics
      if (this.metrics.systemMetrics.length > 1000) {
        this.metrics.systemMetrics.shift();
      }
    }, 30000); // Every 30 seconds
  }

  trackEndpoint(method, path, duration, statusCode) {
    const key = `${method} ${path}`;
    
    if (!this.metrics.endpoints.has(key)) {
      this.metrics.endpoints.set(key, {
        method,
        path,
        calls: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0,
        avgTime: 0
      });
    }

    const endpoint = this.metrics.endpoints.get(key);
    endpoint.calls++;
    endpoint.totalTime += duration;
    endpoint.minTime = Math.min(endpoint.minTime, duration);
    endpoint.maxTime = Math.max(endpoint.maxTime, duration);
    endpoint.avgTime = Math.round(endpoint.totalTime / endpoint.calls);

    if (statusCode >= 400) {
      endpoint.errors++;
    }

    // Log if endpoint is slow
    if (duration > 1000) {
      logger.warn(`Slow endpoint: ${key}`, { duration, statusCode });
    }

    return endpoint;
  }

  trackDatabase(operation, duration, success = true) {
    const metric = {
      timestamp: new Date().toISOString(),
      operation,
      duration,
      success
    };
    this.metrics.database.push(metric);

    if (this.metrics.database.length > 500) {
      this.metrics.database.shift();
    }

    if (duration > 500) {
      logger.warn(`Slow database operation: ${operation}`, { duration });
    }

    return metric;
  }

  getDashboard() {
    const uptime = Date.now() - this.metrics.startTime;
    const recentMetrics = this.metrics.systemMetrics.slice(-10);
    const avgMemory = recentMetrics.length > 0
      ? Math.round(recentMetrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recentMetrics.length / 1024 / 1024)
      : 0;

    const topSlowEndpoints = Array.from(this.metrics.endpoints.values())
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    const dbMetrics = this.metrics.database.slice(-100);
    const avgDbTime = dbMetrics.length > 0
      ? Math.round(dbMetrics.reduce((sum, m) => sum + m.duration, 0) / dbMetrics.length)
      : 0;

    const errorRate = dbMetrics.length > 0
      ? (dbMetrics.filter(m => !m.success).length / dbMetrics.length * 100).toFixed(2)
      : 0;

    return {
      uptime,
      endpoints: {
        total: this.metrics.endpoints.size,
        topSlow: topSlowEndpoints,
        stats: Array.from(this.metrics.endpoints.values())
      },
      database: {
        avgResponseTime: avgDbTime,
        recentOperations: dbMetrics.slice(-20),
        errorRate: `${errorRate}%`
      },
      system: {
        avgMemoryUsed: `${avgMemory}MB`,
        memoryLimit: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
        systemLoad: recentMetrics.length > 0 ? recentMetrics[recentMetrics.length - 1].systemLoad : os.loadavg()
      }
    };
  }

  getSlowQueries(limit = 10) {
    return this.metrics.database
      .filter(m => m.duration > 500)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  reset() {
    this.metrics = {
      ...this.metrics,
      requests: [],
      database: [],
      endpoints: new Map()
    };
  }
}

module.exports = new PerformanceMonitor();
