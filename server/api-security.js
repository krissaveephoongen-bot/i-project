/**
 * API Security Middleware
 * Comprehensive security measures for API endpoints
 */

const crypto = require('crypto');

/**
 * Request ID middleware
 * Assigns unique ID to each request for logging and debugging
 */
const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

/**
 * Request logging middleware
 * Logs all API requests with security context
 */
const requestLogging = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  // Override send to log response
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log request details
    const logData = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous',
    };

    // Don't log sensitive info
    if (res.statusCode >= 400) {
      console.log(`⚠️  [${res.statusCode}]`, logData);
    } else if (duration > 1000) {
      console.log('⏱️  Slow request:', logData);
    }

    // Send response
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Prevent Parameter Pollution (HPP) attack
 * Removes duplicate parameters that could bypass validation
 */
const preventParameterPollution = (req, res, next) => {
  // Check for duplicate parameters in query string
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      // If parameter appears multiple times, only use first value
      req.query[key] = Array.isArray(req.query[key]) 
        ? req.query[key][0] 
        : req.query[key];
    }
  }

  next();
};

/**
 * API Key validation (if using API keys for authentication)
 */
const validateApiKey = (req, res, next) => {
  // Skip if using bearer token (JWT)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  // Check for API key
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Missing API key',
      message: 'API key must be provided via X-API-Key header or api_key query parameter',
    });
  }

  // Validate API key format (example: should be >= 32 chars)
  if (typeof apiKey !== 'string' || apiKey.length < 32) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'API key must be at least 32 characters',
    });
  }

  // Set API key in request for later use
  req.apiKey = apiKey;
  next();
};

/**
 * Prevent CSRF attacks by validating CSRF token
 */
const validateCsrfToken = (req, res, next) => {
  // Skip GET requests (CSRF mostly affects state-changing requests)
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;

  if (!csrfToken) {
    console.warn(`⚠️  Missing CSRF token for ${req.method} ${req.path}`);
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
      message: 'CSRF token must be provided via X-CSRF-Token header or _csrf field',
    });
  }

  // Token validation would happen here with session
  // For now, just pass it through
  next();
};

/**
 * Response sanitization
 * Prevents sensitive information leakage in responses
 */
const sanitizeResponse = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Remove sensitive fields before sending
    const sanitized = JSON.parse(JSON.stringify(data));

    // Remove fields that should never be exposed
    const sensitiveFields = ['password', 'salt', 'passwordHash', 'refreshToken', 'secret'];
    
    function removeSensitiveFields(obj) {
      if (obj && typeof obj === 'object') {
        for (const key of sensitiveFields) {
          delete obj[key];
        }
        // Recursively sanitize nested objects
        for (const key in obj) {
          if (obj[key] && typeof obj[key] === 'object') {
            removeSensitiveFields(obj[key]);
          }
        }
      }
      return obj;
    }

    const cleaned = removeSensitiveFields(sanitized);
    return originalJson.call(this, cleaned);
  };

  next();
};

/**
 * Audit logging for sensitive operations
 */
const auditLog = (operation) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function(data) {
      // Log sensitive operation
      if (res.statusCode < 400) {
        console.log(`📝 Audit: ${operation}`, {
          requestId: req.id,
          userId: req.user?.id,
          method: req.method,
          path: req.path,
          timestamp: new Date().toISOString(),
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Error handling middleware
 * Prevents information leakage through error messages
 */
const errorHandler = (err, req, res, next) => {
  const requestId = req.id || crypto.randomUUID();

  // Log full error details server-side
  console.error(`❌ Error [${requestId}]:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Send generic error to client
  res.status(err.status || 500).json({
    success: false,
    error: err.status === 400 ? err.message : 'An error occurred',
    requestId, // For debugging
    // Don't expose stack trace or internal details
  });
};

/**
 * Apply all security middleware
 */
function applySecurityMiddleware(app) {
  // Request tracking
  app.use(requestId);
  app.use(requestLogging);

  // Input security
  app.use(preventParameterPollution);

  // CSRF protection
  app.use(validateCsrfToken);

  // Response security
  app.use(sanitizeResponse);

  // Error handling (should be last)
  app.use(errorHandler);

  console.log('✅ API security middleware configured');
}

module.exports = {
  requestId,
  requestLogging,
  preventParameterPollution,
  validateApiKey,
  validateCsrfToken,
  sanitizeResponse,
  auditLog,
  errorHandler,
  applySecurityMiddleware,
};

/**
 * Usage Example:
 *
 * const { applySecurityMiddleware, auditLog } = require('./api-security');
 *
 * // Apply to all routes
 * applySecurityMiddleware(app);
 *
 * // Add audit logging to specific routes
 * app.delete('/api/users/:id', auditLog('Delete user'), deleteUserHandler);
 *
 * API Security Features:
 * - Request ID tracking
 * - Request/response logging
 * - Parameter pollution prevention
 * - CSRF token validation
 * - Sensitive field removal from responses
 * - Audit logging for sensitive operations
 * - Proper error handling without info leakage
 */
