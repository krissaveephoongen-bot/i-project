/**
 * CORS Configuration
 * Securely configures Cross-Origin Resource Sharing
 */

const cors = require('cors');

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins() {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const origins = {
    development: [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5173',
    ],
    staging: [
      process.env.STAGING_URL || 'https://staging.example.com',
    ],
    production: [
      process.env.PRODUCTION_URL || 'https://example.com',
    ],
  };

  return origins[nodeEnv] || origins.development;
}

/**
 * Configure CORS middleware
 * Only allow requests from trusted origins
 */
module.exports = function configureCORS(app) {
  const allowedOrigins = getAllowedOrigins();

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log unauthorized CORS attempts
        console.warn(`⚠️  CORS blocked request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },

    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    // Allowed request headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'Accept',
      'Accept-Language',
      'Content-Language',
    ],

    // Exposed response headers
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'X-Request-Id',
    ],

    // Allow credentials (cookies, auth headers)
    credentials: true,

    // Cache preflight requests for 24 hours
    maxAge: 86400,

    // Preflight status code
    optionsSuccessStatus: 200,
  };

  // Apply CORS middleware
  app.use(cors(corsOptions));

  // Log CORS configuration
  console.log('✅ CORS configured for origins:', allowedOrigins);

  // Handle preflight requests explicitly
  app.options('*', cors(corsOptions));
};

/**
 * CORS Security Best Practices:
 * 
 * 1. Whitelist Origins
 *    - Only allow trusted domains
 *    - Never use wildcard '*' in production
 *
 * 2. Restrict Methods
 *    - Only allow necessary HTTP methods
 *    - Disable DELETE/PUT if not needed
 *
 * 3. Limit Headers
 *    - Only expose necessary response headers
 *    - Prevent information leakage
 *
 * 4. Credentials Control
 *    - Set credentials: true only when needed
 *    - Requires explicit origin (not '*')
 *
 * 5. Preflight Caching
 *    - Cache preflight requests (maxAge)
 *    - Reduces performance impact
 *
 * 6. Logging
 *    - Log unauthorized CORS attempts
 *    - Monitor for suspicious patterns
 */
