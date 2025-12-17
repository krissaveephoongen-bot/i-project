/**
 * Caching Middleware
 * Reduces database load and improves response times
 */

class Cache {
  constructor(options = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.store = new Map();
    this.startCleanupInterval();
  }

  middleware(key, ttl = this.ttl) {
    return (req, res, next) => {
      const cacheKey = typeof key === 'function' ? key(req) : `${req.method}:${req.path}`;
      
      // Check cache
      const cached = this.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      // Intercept res.json to cache response
      const originalJson = res.json.bind(res);
      res.json = function(data) {
        if (res.statusCode === 200) {
          Cache.instance.set(cacheKey, data, ttl);
        }
        return originalJson(data);
      };

      res.set('X-Cache', 'MISS');
      next();
    };
  }

  set(key, value, ttl = this.ttl) {
    this.store.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.store.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  invalidate(pattern) {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
  }

  getStats() {
    return {
      cacheSize: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }

  startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.store.entries()) {
        if (now > item.expires) {
          this.store.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }
}

Cache.instance = new Cache();
module.exports = Cache;
