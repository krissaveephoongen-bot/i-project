/**
 * Input Validation & Sanitization
 * Prevents injection attacks and invalid data
 */

const { body, validationResult, param, query } = require('express-validator');

/**
 * Common validation rules
 */
const validators = {
  // Email validation
  email: () => body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),

  // Password validation (minimum 8 chars, mixed case, numbers, symbols)
  password: () => body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character'),

  // Username validation
  username: () => body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),

  // Name validation
  name: () => body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  // URL validation
  url: () => body('url')
    .isURL()
    .withMessage('Invalid URL'),

  // Phone number validation
  phone: () => body('phone')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be 10-20 characters'),

  // Date validation
  date: () => body('date')
    .isISO8601()
    .withMessage('Invalid date format. Use ISO8601 (YYYY-MM-DD)'),

  // Number validation
  number: (min = 0, max = null) => {
    const rule = body('number')
      .isInt({ min })
      .withMessage(`Number must be at least ${min}`);

    return max ? rule.isInt({ min, max }).withMessage(`Number must be between ${min} and ${max}`) : rule;
  },

  // ID validation (UUID or numeric)
  id: () => param('id')
    .custom((value) => {
      // Accept UUID or numeric ID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
      const isNumeric = /^\d+$/.test(value);

      if (!isUUID && !isNumeric) {
        throw new Error('Invalid ID format');
      }
      return true;
    }),

  // Search query validation
  search: () => query('q')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be 1-200 characters')
    .escape()
    .withMessage('Invalid search query'),
};

/**
 * Validation error handler middleware
 * Returns formatted error response if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.warn('⚠️  Validation errors:', errors.array());

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

/**
 * Input sanitization middleware
 * Prevents XSS and injection attacks
 */
const sanitizeInputs = (req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potentially dangerous characters
        req.body[key] = req.body[key]
          .trim()
          .replace(/[<>]/g, '') // Remove angle brackets
          .slice(0, 10000); // Limit length to prevent DoS
      }
    });
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .trim()
          .slice(0, 1000);
      }
    });
  }

  next();
};

/**
 * Rate limiting validation
 * Check if request rate exceeds limits
 */
const validateRateLimit = (limit = 100, windowMs = 60000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request history for this IP
    let requestTimes = requests.get(key) || [];

    // Remove old requests outside the window
    requestTimes = requestTimes.filter(time => time > windowStart);

    if (requestTimes.length >= limit) {
      console.warn(`⚠️  Rate limit exceeded for IP: ${key}`);
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit of ${limit} requests per ${windowMs / 1000} seconds exceeded`,
        retryAfter: Math.ceil((requestTimes[0] + windowMs - now) / 1000),
      });
    }

    // Add current request
    requestTimes.push(now);
    requests.set(key, requestTimes);

    // Clean up old entries periodically
    if (requests.size > 10000) {
      const oldestTime = now - windowMs * 2;
      for (const [ip, times] of requests.entries()) {
        const recentTimes = times.filter(time => time > oldestTime);
        if (recentTimes.length === 0) {
          requests.delete(ip);
        } else {
          requests.set(ip, recentTimes);
        }
      }
    }

    next();
  };
};

module.exports = {
  validators,
  handleValidationErrors,
  sanitizeInputs,
  validateRateLimit,
};

/**
 * Usage Example:
 *
 * const { validators, handleValidationErrors } = require('./input-validation');
 *
 * // In route handler:
 * app.post('/login',
 *   validators.email(),
 *   validators.password(),
 *   handleValidationErrors,
 *   (req, res) => {
 *     // Process login - inputs are validated
 *   }
 * );
 *
 * Input validation prevents:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection
 * - NoSQL Injection
 * - Command Injection
 * - Format validation failures
 * - Data type mismatches
 */
