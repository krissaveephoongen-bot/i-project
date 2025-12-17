/**
 * Advanced Structured Logging System
 * Logs all requests, errors, and performance metrics
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');
    this.initLogsDirectory();
    this.metrics = {
      requests: [],
      errors: [],
      performance: [],
      statusChanges: []
    };
  }

  initLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  log(level, message, meta = {}) {
    const logEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      ...meta
    };

    console.log(`[${level}] ${message}`, meta);
    this.writeToFile(logEntry);
    return logEntry;
  }

  writeToFile(logEntry) {
    const logFile = path.join(this.logsDir, `${logEntry.level}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }

  info(message, meta) {
    return this.log('INFO', message, meta);
  }

  warn(message, meta) {
    return this.log('WARN', message, meta);
  }

  error(message, meta) {
    return this.log('ERROR', message, meta);
  }

  debug(message, meta) {
    return this.log('DEBUG', message, meta);
  }

  trackRequest(req, res, duration) {
    const metric = {
      timestamp: this.formatTimestamp(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent')
    };
    this.metrics.requests.push(metric);
    return metric;
  }

  trackError(error, req) {
    const errorLog = {
      timestamp: this.formatTimestamp(),
      error: error.message,
      stack: error.stack,
      path: req?.path,
      method: req?.method,
      category: this.categorizeError(error)
    };
    this.metrics.errors.push(errorLog);
    return errorLog;
  }

  categorizeError(error) {
    const message = error.message.toLowerCase();
    if (message.includes('connection') || message.includes('econnrefused')) {
      return 'DATABASE_CONNECTION';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT';
    }
    if (message.includes('auth')) {
      return 'AUTHENTICATION';
    }
    return 'APPLICATION';
  }

  trackPerformance(operation, duration, metadata = {}) {
    const metric = {
      timestamp: this.formatTimestamp(),
      operation,
      duration,
      ...metadata
    };
    this.metrics.performance.push(metric);
    return metric;
  }

  trackStatusChange(status, details) {
    const change = {
      timestamp: this.formatTimestamp(),
      status,
      ...details
    };
    this.metrics.statusChanges.push(change);
    return change;
  }

  getMetrics() {
    return {
      totalRequests: this.metrics.requests.length,
      totalErrors: this.metrics.errors.length,
      avgResponseTime: this.calculateAvgResponseTime(),
      recentErrors: this.metrics.errors.slice(-10),
      statusHistory: this.metrics.statusChanges.slice(-20)
    };
  }

  calculateAvgResponseTime() {
    if (this.metrics.requests.length === 0) return 0;
    const total = this.metrics.requests.reduce((sum, r) => sum + (r.duration || 0), 0);
    return Math.round(total / this.metrics.requests.length);
  }

  clearOldLogs(daysToKeep = 7) {
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

    fs.readdirSync(this.logsDir).forEach(file => {
      const filePath = path.join(this.logsDir, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

module.exports = new Logger();
