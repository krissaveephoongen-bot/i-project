/**
 * Request Logging Middleware
 * Logs all incoming requests with performance metrics
 */

const logger = require('./logger');
const analyticsService = require('../services/analytics-service');

module.exports = function requestLogger() {
  return (req, res, next) => {
    const startTime = Date.now();
    const sessionId = req.sessionID || req.headers['x-session-id'] || `session_${Date.now()}`;

    // Track active user if authenticated
    if (req.user) {
      analyticsService.trackActiveUser(req.user.id, sessionId);
    }

    // Intercept response to log
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log request
      logger.trackRequest(req, res, duration);

      // Track in analytics
      if (req.user) {
        analyticsService.trackRequest(sessionId, req.method, req.path, duration, statusCode);
      }

      // Log if slow or error
      if (duration > 1000 || statusCode >= 400) {
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'debug';
        logger[level](`${req.method} ${req.path}`, {
          statusCode,
          duration,
          userAgent: req.get('user-agent'),
          ip: req.ip
        });
      }

      res.set('X-Response-Time', `${duration}ms`);
      return originalSend.call(this, data);
    };

    next();
  };
};
