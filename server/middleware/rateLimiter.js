/**
 * Rate Limiting Middleware
 * Prevents API abuse and DoS attacks
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.maxRequests = options.maxRequests || 100;
    this.keyPrefix = options.keyPrefix || 'rate-limit:';
    this.requestCounts = new Map();
    this.startCleanupInterval();
  }

  middleware() {
    return (req, res, next) => {
      const key = this.getKey(req);
      const now = Date.now();

      if (!this.requestCounts.has(key)) {
        this.requestCounts.set(key, []);
      }

      const requests = this.requestCounts.get(key);
      const windowStart = now - this.windowMs;
      
      // Remove old requests outside the window
      const validRequests = requests.filter(time => time > windowStart);
      this.requestCounts.set(key, validRequests);

      if (validRequests.length >= this.maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(this.windowMs / 1000),
          remaining: 0
        });
      }

      validRequests.push(now);
      res.set('X-RateLimit-Limit', this.maxRequests);
      res.set('X-RateLimit-Remaining', this.maxRequests - validRequests.length);
      res.set('X-RateLimit-Reset', new Date(now + this.windowMs).toISOString());

      next();
    };
  }

  getKey(req) {
    // Use IP address, or user ID if authenticated
    const identifier = req.user?.id || req.ip || req.connection.remoteAddress;
    return `${this.keyPrefix}${identifier}`;
  }

  reset(key) {
    this.requestCounts.delete(key);
  }

  getStats() {
    return {
      trackedIPs: this.requestCounts.size,
      requests: Array.from(this.requestCounts.entries()).map(([key, requests]) => ({
        key,
        count: requests.length
      }))
    };
  }

  startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      const windowStart = now - this.windowMs;

      for (const [key, requests] of this.requestCounts.entries()) {
        const validRequests = requests.filter(time => time > windowStart);
        if (validRequests.length === 0) {
          this.requestCounts.delete(key);
        } else {
          this.requestCounts.set(key, validRequests);
        }
      }
    }, 60000); // Cleanup every minute
  }
}

module.exports = RateLimiter;
