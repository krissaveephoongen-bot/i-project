/**
 * Rate Limiting Configuration
 * Prevents abuse, DDoS attacks, and resource exhaustion
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

/**
 * Create Redis client for distributed rate limiting
 * Allows rate limits to work across multiple servers
 */
function createRedisClient() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    const client = redis.createClient({ url: redisUrl });
    client.on('error', (err) => {
      console.warn('⚠️  Redis connection error:', err.message);
      console.log('Falling back to in-memory rate limiting');
    });
    return client;
  } catch (error) {
    console.warn('⚠️  Could not create Redis client:', error.message);
    return null;
  }
}

/**
 * Create rate limiter with optional Redis store
 */
function createLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // max requests per window
    message = 'Too many requests, please try again later',
    statusCode = 429,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  const redisClient = createRedisClient();

  const limiterConfig = {
    windowMs,
    max,
    message,
    statusCode,
    skipSuccessfulRequests,
    skipFailedRequests,
    standardHeaders: true, // Return RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user?.id || req.ip;
    },
    handler: (req, res) => {
      console.warn(`⚠️  Rate limit exceeded for ${req.ip}`);
      res.status(statusCode).json({
        success: false,
        error: 'Too many requests',
        message,
        retryAfter: req.rateLimit.resetTime,
      });
    },
  };

  // Use Redis store if available, otherwise use in-memory
  if (redisClient) {
    limiterConfig.store = new RedisStore({
      client: redisClient,
      prefix: 'rl:', // prefix for Redis keys
    });
  }

  return rateLimit(limiterConfig);
}

/**
 * Specific rate limiters for different endpoints
 */
const limiters = {
  // General API rate limit (100 req/15 min)
  general: createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many API requests, please try again later',
  }),

  // Strict rate limit for authentication (5 req/15 min)
  auth: createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later',
    skipSuccessfulRequests: true, // Don't count successful requests
  }),

  // Moderate rate limit for creating resources (20 req/15 min)
  create: createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many requests to create resources, please try again later',
  }),

  // Strict rate limit for sensitive operations (10 req/hour)
  sensitive: createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many sensitive requests, please try again later',
  }),

  // Very strict for password reset (3 req/hour)
  passwordReset: createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset requests, please try again later',
  }),

  // Loose limit for public endpoints (1000 req/hour)
  public: createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: 'Rate limit exceeded, please try again later',
  }),
};

/**
 * Apply rate limiters to app
 */
function applyRateLimiters(app) {
  // General rate limit for all API requests
  app.use('/api/', limiters.general);

  // Strict limits for authentication endpoints
  app.post('/api/auth/login', limiters.auth);
  app.post('/api/auth/register', limiters.auth);
  app.post('/api/auth/forgot-password', limiters.passwordReset);
  app.post('/api/auth/reset-password', limiters.passwordReset);

  // Moderate limits for creating resources
  app.post('/api/projects', limiters.create);
  app.post('/api/users', limiters.create);
  app.post('/api/tasks', limiters.create);

  // Strict limits for sensitive operations
  app.delete('/api/:resource/:id', limiters.sensitive);
  app.patch('/api/users/:id/role', limiters.sensitive);

  console.log('✅ Rate limiters configured');
}

/**
 * Rate Limiting Best Practices:
 *
 * 1. Different limits for different endpoints
 *    - Loose for public endpoints
 *    - Strict for authentication
 *    - Moderate for resource creation
 *
 * 2. Use user ID when available
 *    - Prevents bypassing with IP spoofing
 *    - More accurate for authenticated users
 *
 * 3. Use Redis for distributed systems
 *    - Applies limits across multiple servers
 *    - Prevents circumvention with multiple IPs
 *
 * 4. Skip successful requests for some endpoints
 *    - Allows legitimate users to succeed
 *    - Only limits failed attempts
 *
 * 5. Inform users about limits
 *    - Include Retry-After header
 *    - Return clear error messages
 *
 * 6. Log violations
 *    - Track suspicious patterns
 *    - Identify potential attacks
 */

module.exports = {
  createLimiter,
  limiters,
  applyRateLimiters,
};
