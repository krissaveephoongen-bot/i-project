/**
 * Real-time Analytics Service
 * Tracks metrics: active users, request volume, resource usage
 */

const logger = require('../middleware/logger');

class AnalyticsService {
  constructor() {
    this.metrics = {
      activeUsers: new Set(),
      requestVolume: [],
      resourceUsage: [],
      endpoints: new Map(),
      errors: [],
      sessions: new Map()
    };
    this.startCollection();
  }

  trackActiveUser(userId, sessionId) {
    this.metrics.activeUsers.add(userId);

    // Track session
    this.metrics.sessions.set(sessionId, {
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      requestCount: 0
    });

    logger.debug('User active', { userId, sessionId });
  }

  trackInactiveUser(sessionId) {
    const session = this.metrics.sessions.get(sessionId);
    if (session) {
      const duration = Date.now() - session.startTime;
      this.metrics.sessions.delete(sessionId);
      logger.debug('User inactive', { 
        userId: session.userId, 
        sessionId,
        duration,
        requests: session.requestCount
      });
    }
  }

  trackRequest(sessionId, method, endpoint, duration, statusCode) {
    const key = `${method} ${endpoint}`;

    if (!this.metrics.endpoints.has(key)) {
      this.metrics.endpoints.set(key, {
        method,
        endpoint,
        requests: 0,
        totalTime: 0,
        errors: 0
      });
    }

    const endpointStats = this.metrics.endpoints.get(key);
    endpointStats.requests++;
    endpointStats.totalTime += duration;
    if (statusCode >= 400) endpointStats.errors++;

    // Update session
    const session = this.metrics.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      session.requestCount++;
    }

    // Track request volume
    this.metrics.requestVolume.push({
      timestamp: Date.now(),
      method,
      endpoint,
      duration,
      statusCode
    });

    // Keep only last 10000 requests
    if (this.metrics.requestVolume.length > 10000) {
      this.metrics.requestVolume.shift();
    }
  }

  trackError(error, context) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      error: error.message,
      category: this.categorizeError(error),
      context
    });

    // Keep only last 1000 errors
    if (this.metrics.errors.length > 1000) {
      this.metrics.errors.shift();
    }
  }

  categorizeError(error) {
    const message = error.message.toLowerCase();
    if (message.includes('database') || message.includes('connection')) return 'DATABASE';
    if (message.includes('auth')) return 'AUTHENTICATION';
    if (message.includes('timeout')) return 'TIMEOUT';
    if (message.includes('validation')) return 'VALIDATION';
    return 'APPLICATION';
  }

  getAnalytics() {
    const now = Date.now();
    const last5Min = now - 5 * 60 * 1000;
    const last1Hour = now - 60 * 60 * 1000;

    const recentRequests = this.metrics.requestVolume.filter(r => r.timestamp > last5Min);
    const recentErrors = this.metrics.errors.filter(e => e.timestamp > last5Min);

    const topEndpoints = Array.from(this.metrics.endpoints.values())
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    const avgResponseTime = recentRequests.length > 0
      ? Math.round(recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length)
      : 0;

    const errorRate = recentRequests.length > 0
      ? ((recentRequests.filter(r => r.statusCode >= 400).length / recentRequests.length) * 100).toFixed(2)
      : 0;

    // Cleanup inactive sessions
    this.cleanupInactiveSessions(now);

    return {
      summary: {
        activeUsers: this.metrics.activeUsers.size,
        activeSessions: this.metrics.sessions.size,
        requestsLast5Min: recentRequests.length,
        errorsLast5Min: recentErrors.length,
        avgResponseTime: `${avgResponseTime}ms`,
        errorRate: `${errorRate}%`
      },
      topEndpoints,
      recentRequests: recentRequests.slice(-20),
      recentErrors: recentErrors.slice(-20),
      errorSummary: this.getErrorSummary(recentErrors),
      sessionMetrics: this.getSessionMetrics(),
      requestTrend: this.getRequestTrend(last1Hour)
    };
  }

  getErrorSummary(errors) {
    const summary = {};
    for (const error of errors) {
      summary[error.category] = (summary[error.category] || 0) + 1;
    }
    return summary;
  }

  getSessionMetrics() {
    const sessions = Array.from(this.metrics.sessions.values());
    const avgSessionDuration = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (Date.now() - s.startTime), 0) / sessions.length / 1000)
      : 0;

    const avgRequestsPerSession = sessions.length > 0
      ? (sessions.reduce((sum, s) => sum + s.requestCount, 0) / sessions.length).toFixed(2)
      : 0;

    return {
      activeSessions: sessions.length,
      avgSessionDuration: `${avgSessionDuration}s`,
      avgRequestsPerSession
    };
  }

  getRequestTrend(sinceTimestamp) {
    const recentRequests = this.metrics.requestVolume.filter(r => r.timestamp > sinceTimestamp);
    const buckets = 12; // 12 buckets of 5 minutes each
    const bucketSize = 60000 / buckets; // 5 minutes per bucket
    const trend = Array(buckets).fill(0);

    for (const request of recentRequests) {
      const bucketIndex = Math.floor((request.timestamp - sinceTimestamp) / bucketSize);
      if (bucketIndex >= 0 && bucketIndex < buckets) {
        trend[bucketIndex]++;
      }
    }

    return trend;
  }

  cleanupInactiveSessions(now, inactiveThreshold = 30 * 60 * 1000) {
    for (const [sessionId, session] of this.metrics.sessions) {
      if (now - session.lastActivity > inactiveThreshold) {
        this.trackInactiveUser(sessionId);
      }
    }
  }

  getHealthScore() {
    const analytics = this.getAnalytics();
    const errorRate = parseFloat(analytics.summary.errorRate);
    const avgResponseTime = parseInt(analytics.summary.avgResponseTime);

    let score = 100;
    
    if (errorRate > 5) score -= 25;
    else if (errorRate > 2) score -= 10;
    
    if (avgResponseTime > 5000) score -= 20;
    else if (avgResponseTime > 2000) score -= 10;

    return Math.max(0, score);
  }

  reset() {
    this.metrics = {
      activeUsers: new Set(),
      requestVolume: [],
      resourceUsage: [],
      endpoints: new Map(),
      errors: [],
      sessions: new Map()
    };
  }

  startCollection() {
    setInterval(() => {
      const now = Date.now();
      this.cleanupInactiveSessions(now);
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}

module.exports = new AnalyticsService();
