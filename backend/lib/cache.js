import { LRUCache } from 'lru-cache';

// Performance-optimized caching layer
class CacheManager {
  constructor(options = {}) {
    this.cache = new LRUCache({
      max: options.max || 1000, // Maximum number of items
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default TTL
      updateAgeOnGet: options.updateAgeOnGet || false,
      allowStale: options.allowStale || false,
    });
  }

  // Get cached data
  get(key) {
    try {
      const data = this.cache.get(key);
      if (data === undefined) {
        return null;
      }
      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set cached data with optional TTL
  set(key, value, ttl) {
    try {
      this.cache.set(key, value, { ttl });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete cached data
  delete(key) {
    try {
      return this.cache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Clear all cache
  clear() {
    try {
      this.cache.clear();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // Get cache statistics
  getStats() {
    try {
      return this.cache.dump();
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }

  // Check if key exists
  has(key) {
    try {
      return this.cache.has(key);
    } catch (error) {
      console.error('Cache has error:', error);
      return false;
    }
  }

  // Get cache size
  size() {
    try {
      return this.cache.size;
    } catch (error) {
      console.error('Cache size error:', error);
      return 0;
    }
  }
}

// Create cache instances for different data types
const cacheInstances = {
  user: new CacheManager({ max: 500, ttl: 10 * 60 * 1000 }), // 10 minutes
  project: new CacheManager({ max: 200, ttl: 5 * 60 * 1000 }), // 5 minutes
  dashboard: new CacheManager({ max: 100, ttl: 2 * 60 * 1000 }), // 2 minutes
  reports: new CacheManager({ max: 50, ttl: 15 * 60 * 1000 }), // 15 minutes
  timesheet: new CacheManager({ max: 300, ttl: 3 * 60 * 1000 }), // 3 minutes
};

// Middleware for caching API responses
function cacheMiddleware(cacheType, keyGenerator) {
  return (req, res, next) => {
    const cache = cacheInstances[cacheType];
    if (!cache) {
      return next();
    }

    const cacheKey = keyGenerator(req);
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      // Add cache headers
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-TTL', cache.options.ttl);
      return res.json(cachedData);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response
      cache.set(cacheKey, data);
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
}

// Helper functions for generating cache keys
const cacheKeyGenerators = {
  user: (req) => `user:${req.params.id || req.user?.id}:${JSON.stringify(req.query)}`,
  project: (req) => `project:${req.params.id || req.query.projectId}:${JSON.stringify(req.query)}`,
  dashboard: (req) => `dashboard:${JSON.stringify(req.query)}`,
  reports: (req) => `reports:${req.params.type || 'all'}:${JSON.stringify(req.query)}`,
  timesheet: (req) => `timesheet:${req.params.id || req.user?.id}:${JSON.stringify(req.query)}`,
};

// Cache invalidation helpers
const cacheInvalidation = {
  user: (userId) => {
    cacheInstances.user.delete(`user:${userId}:*`);
  },
  project: (projectId) => {
    cacheInstances.project.delete(`project:${projectId}:*`);
    // Also invalidate dashboard cache as it contains project data
    cacheInstances.dashboard.clear();
  },
  dashboard: () => {
    cacheInstances.dashboard.clear();
  },
  reports: () => {
    cacheInstances.reports.clear();
  },
  timesheet: (userId) => {
    cacheInstances.timesheet.delete(`timesheet:${userId}:*`);
  },
  all: () => {
    Object.values(cacheInstances).forEach(cache => cache.clear());
  }
};

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      slowQueries: 0,
      errors: 0
    };
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  recordSlowQuery(duration, threshold = 1000) {
    if (duration > threshold) {
      this.metrics.slowQueries++;
      console.warn(`Slow query detected: ${duration}ms`);
    }
  }

  recordError(error) {
    this.metrics.errors++;
    console.error('Error recorded:', error);
  }

  getMetrics() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return {
      ...this.metrics,
      cacheHitRate: total > 0 ? (this.metrics.cacheHits / total * 100).toFixed(2) + '%' : '0%',
      totalRequests: total
    };
  }

  resetMetrics() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      slowQueries: 0,
      errors: 0
    };
  }
}

const performanceMonitor = new PerformanceMonitor();

export {
  CacheManager,
  cacheInstances,
  cacheMiddleware,
  cacheKeyGenerators,
  cacheInvalidation,
  performanceMonitor
};
