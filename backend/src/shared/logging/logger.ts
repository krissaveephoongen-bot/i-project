/**
 * Structured Logging with Winston
 * Provides consistent logging across the application
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}` +
      (info.requestId ? ` [${info.requestId}]` : '') +
      (info.stack ? `\n${info.stack}` : '')
  )
);

// Define transports
const transports = [
  // Console transport (all levels in development)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    ),
  }),

  // Error log file (errors only)
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format,
  }),

  // Combined log file (all levels)
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format,
  }),
];

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format,
    }),
  ],
});

/**
 * Log an HTTP request
 */
export function logHttpRequest(
  requestId: string,
  method: string,
  path: string,
  statusCode: number,
  duration: number
): void {
  logger.http(
    `${method} ${path} - ${statusCode} - ${duration}ms`,
    { requestId }
  );
}

/**
 * Log an error with context
 */
export function logError(
  message: string,
  error?: Error,
  context?: Record<string, any>
): void {
  logger.error(message, {
    ...context,
    stack: error?.stack,
    message: error?.message,
  });
}

/**
 * Log a warning
 */
export function logWarn(message: string, context?: Record<string, any>): void {
  logger.warn(message, context);
}

/**
 * Log info
 */
export function logInfo(message: string, context?: Record<string, any>): void {
  logger.info(message, context);
}

/**
 * Log debug
 */
export function logDebug(message: string, context?: Record<string, any>): void {
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(message, context);
  }
}

/**
 * Create a child logger with request context
 */
export function createRequestLogger(requestId: string) {
  return {
    error: (message: string, context?: any) =>
      logError(message, undefined, { requestId, ...context }),
    warn: (message: string, context?: any) =>
      logWarn(message, { requestId, ...context }),
    info: (message: string, context?: any) =>
      logInfo(message, { requestId, ...context }),
    debug: (message: string, context?: any) =>
      logDebug(message, { requestId, ...context }),
  };
}

export default logger;
