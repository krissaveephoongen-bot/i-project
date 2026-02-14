/**
 * Input Sanitization Middleware
 * Prevents XSS attacks by sanitizing user input
 */

import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Recursively sanitize object properties
 */
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Remove script tags and dangerous HTML
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  }

  if (Array.isArray(value)) {
    return value.map(v => sanitizeValue(v));
  }

  if (typeof value === 'object' && value !== null) {
    const sanitized: any = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }

  return value;
}

/**
 * Middleware to sanitize request body and query
 * Removes potentially malicious HTML/JavaScript
 */
export const sanitizeRequest = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        const sanitizedQuery: any = {};
        for (const [key, value] of Object.entries(req.query)) {
          if (Array.isArray(value)) {
            sanitizedQuery[key] = value.map(v => 
              typeof v === 'string' ? DOMPurify.sanitize(v, { ALLOWED_TAGS: [] }) : v
            );
          } else if (typeof value === 'string') {
            sanitizedQuery[key] = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
          } else {
            sanitizedQuery[key] = value;
          }
        }
        (req as any).query = sanitizedQuery;
      }

      // Sanitize path parameters
      if (req.params && typeof req.params === 'object') {
        const sanitizedParams: any = {};
        for (const [key, value] of Object.entries(req.params)) {
          if (typeof value === 'string') {
            sanitizedParams[key] = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
          } else {
            sanitizedParams[key] = value;
          }
        }
        req.params = sanitizedParams;
      }

      next();
    } catch (error) {
      // If sanitization fails, still allow request to continue
      console.error('Sanitization error:', error);
      next();
    }
  };
};

/**
 * Middleware to sanitize specific fields only
 * Use when you need to allow HTML in some fields
 */
export const sanitizeFields = (...fieldNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body && typeof req.body === 'object') {
        for (const field of fieldNames) {
          if (field in req.body && typeof req.body[field] === 'string') {
            req.body[field] = DOMPurify.sanitize(req.body[field], { ALLOWED_TAGS: [] });
          }
        }
      }
      next();
    } catch (error) {
      console.error('Sanitization error:', error);
      next();
    }
  };
};
