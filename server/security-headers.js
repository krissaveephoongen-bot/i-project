/**
 * Security Headers Configuration
 * Implements OWASP security headers using helmet.js
 */

const helmet = require('helmet');

/**
 * Configure security headers middleware
 * Protects against common web vulnerabilities
 */
module.exports = function configureSecurityHeaders(app) {
  // Helmet.js - Sets various HTTP headers for security
  app.use(helmet());

  // Additional custom security headers
  app.use((req, res, next) => {
    // Prevent clickjacking attacks
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection in older browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy - Control how much referrer information is shared
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy - Prevent injection attacks
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none'"
    );

    // Permissions Policy (formerly Feature Policy) - Control browser features
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=()'
    );

    // Strict Transport Security - Force HTTPS
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
  });

  console.log('✅ Security headers configured');
};

/**
 * Helmet.js default headers:
 * - X-DNS-Prefetch-Control: 'off'
 * - X-Frame-Options: 'DENY'
 * - X-Content-Type-Options: 'nosniff'
 * - X-XSS-Protection: '0'
 * - Referrer-Policy: 'no-referrer'
 * - Strict-Transport-Security: max-age=15552000
 * - Content-Security-Policy: Various defaults
 */
