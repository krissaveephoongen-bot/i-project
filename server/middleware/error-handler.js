/**
 * Enhanced Error Handler Middleware
 * Categorizes, logs, and responds to all errors
 */

const logger = require('./logger');
const analyticsService = require('../services/analytics-service');

class ErrorHandler {
  static categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('validation') || message.includes('required')) {
      return { category: 'VALIDATION', statusCode: 400 };
    }
    if (message.includes('unauthorized') || message.includes('auth')) {
      return { category: 'AUTHENTICATION', statusCode: 401 };
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return { category: 'AUTHORIZATION', statusCode: 403 };
    }
    if (message.includes('not found')) {
      return { category: 'NOT_FOUND', statusCode: 404 };
    }
    if (message.includes('conflict')) {
      return { category: 'CONFLICT', statusCode: 409 };
    }
    if (message.includes('timeout') || message.includes('econnrefused')) {
      return { category: 'DATABASE_CONNECTION', statusCode: 503 };
    }
    if (message.includes('connection') || message.includes('database')) {
      return { category: 'DATABASE_ERROR', statusCode: 503 };
    }
    
    return { category: 'APPLICATION_ERROR', statusCode: 500 };
  }

  static middleware() {
    return (err, req, res, next) => {
      const { category, statusCode } = this.categorizeError(err);
      
      // Log error
      logger.error(`${category}`, {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id
      });

      // Track in analytics
      analyticsService.trackError(err, {
        path: req.path,
        method: req.method,
        userId: req.user?.id
      });

      // Response
      res.status(statusCode).json({
        error: {
          type: category,
          message: err.message,
          timestamp: new Date().toISOString(),
          requestId: req.id
        }
      });
    };
  }

  static wrapAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler;
