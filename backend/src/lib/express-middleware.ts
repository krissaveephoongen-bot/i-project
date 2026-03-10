import { Request, Response } from 'express';
import { extractTokenFromHeader, validateSession, hasPermission } from '@/lib/auth';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

/**
 * Middleware to authenticate requests
 */
export async function withAuth(req: Request): Promise<{ user: any; error?: string }> {
  try {
    // Extract token from header
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    // Validate session and get user
    const user = await validateSession(token);
    if (!user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

/**
 * Middleware to check specific permissions
 */
export async function withPermission(
  req: Request, 
  requiredPermission: string
): Promise<{ user: any; error?: string }> {
  const authResult = await withAuth(req);
  
  if (authResult.error) {
    return authResult;
  }

  if (!hasPermission(authResult.user, requiredPermission)) {
    return { 
      user: null, 
      error: `Insufficient permissions. Required: ${requiredPermission}` 
    };
  }

  return authResult;
}

/**
 * Middleware to check any of multiple permissions
 */
export async function withAnyPermission(
  req: Request, 
  requiredPermissions: string[]
): Promise<{ user: any; error?: string }> {
  const authResult = await withAuth(req);
  
  if (authResult.error) {
    return authResult;
  }

  const hasAny = requiredPermissions.some(permission => 
    hasPermission(authResult.user, permission)
  );

  if (!hasAny) {
    return { 
      user: null, 
      error: `Insufficient permissions. Required one of: ${requiredPermissions.join(', ')}` 
    };
  }

  return authResult;
}

/**
 * Middleware to check specific roles
 */
export async function withRole(
  req: Request, 
  requiredRole: string
): Promise<{ user: any; error?: string }> {
  const authResult = await withAuth(req);
  
  if (authResult.error) {
    return authResult;
  }

  if (!authResult.user.roles.some((role: any) => role.name === requiredRole)) {
    return { 
      user: null, 
      error: `Insufficient role. Required: ${requiredRole}` 
    };
  }

  return authResult;
}

/**
 * Middleware to check any of multiple roles
 */
export async function withAnyRole(
  req: Request, 
  requiredRoles: string[]
): Promise<{ user: any; error?: string }> {
  const authResult = await withAuth(req);
  
  if (authResult.error) {
    return authResult;
  }

  const hasAny = requiredRoles.some(roleName => 
    authResult.user.roles.some((role: any) => role.name === roleName)
  );

  if (!hasAny) {
    return { 
      user: null, 
      error: `Insufficient role. Required one of: ${requiredRoles.join(', ')}` 
    };
  }

  return authResult;
}

// ============================================================
// PROJECT CONTEXT MIDDLEWARE
// ============================================================

/**
 * Middleware to ensure project context is present
 */
export async function withProjectContext(req: Request): Promise<{ 
  user: any; 
  projectId: string | null; 
  error?: string 
}> {
  const authResult = await withAuth(req);
  
  if (authResult.error) {
    return { ...authResult, projectId: null };
  }

  // Extract project ID from header or query parameter
  const projectId = req.headers['x-project-id'] as string || 
                    (req.query.projectId as string);

  if (!projectId) {
    return { 
      user: authResult.user, 
      projectId: null, 
      error: 'Project context required. Provide x-project-id header or projectId query parameter.' 
    };
  }

  return { user: authResult.user, projectId };
}

/**
 * Middleware to check project-specific permissions
 */
export async function withProjectPermission(
  req: Request, 
  requiredPermission: string
): Promise<{ 
  user: any; 
  projectId: string | null; 
  error?: string 
}> {
  const contextResult = await withProjectContext(req);
  
  if (contextResult.error) {
    return contextResult;
  }

  // For now, we'll check general permissions
  // In a real implementation, you'd check project-specific permissions
  if (!hasPermission(contextResult.user, requiredPermission)) {
    return { 
      user: null, 
      projectId: contextResult.projectId,
      error: `Insufficient permissions for project. Required: ${requiredPermission}` 
    };
  }

  return contextResult;
}

// ============================================================
// ERROR HANDLING HELPERS
// ============================================================

/**
 * Standard error response
 */
export function createErrorResponse(
  message: string, 
  status: number = 401,
  code?: string
) {
  return {
    error: true,
    message,
    code,
    timestamp: new Date().toISOString()
  };
}

/**
 * Success response with data
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string,
  meta?: any
) {
  return {
    success: true,
    data,
    message,
    meta,
    timestamp: new Date().toISOString()
  };
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return createErrorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return createErrorResponse(message, 403, 'FORBIDDEN');
}

/**
 * Not found response
 */
export function notFoundResponse(message: string = 'Resource not found') {
  return createErrorResponse(message, 404, 'NOT_FOUND');
}

/**
 * Validation error response
 */
export function validationErrorResponse(errors: any) {
  return {
    error: true,
    message: 'Validation failed',
    errors,
    code: 'VALIDATION_ERROR',
    timestamp: new Date().toISOString()
  };
}

// ============================================================
// CORS HELPERS
// ============================================================

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(res: Response, origin?: string): Response {
  const allowedOrigin = origin || process.env.ALLOWED_ORIGIN || '*';
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-project-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  return res;
}

/**
 * Handle OPTIONS requests for CORS
 */
export function handleOptions(req: Request, res: Response): Response {
  res.statusCode = 200;
  return addCorsHeaders(res, req.headers.origin);
}

// ============================================================
// RATE LIMITING (Simple Implementation)
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting middleware
 */
export function withRateLimit(
  req: Request, 
  limit: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; error?: string } {
  const clientId = req.headers['x-forwarded-for'] as string || 
                  req.headers['x-real-ip'] as string || 
                  'unknown';
  
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }
  
  // Check current client
  const clientData = rateLimitMap.get(clientId);
  
  if (!clientData) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (clientData.resetTime < now) {
    // Reset window
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (clientData.count >= limit) {
    return { 
      allowed: false, 
      error: `Rate limit exceeded. Limit: ${limit} requests per ${windowMs / 1000} seconds` 
    };
  }
  
  clientData.count++;
  return { allowed: true };
}

// ============================================================
// REQUEST LOGGING
// ============================================================

/**
 * Log request details
 */
export function logRequest(
  req: Request, 
  userId?: string, 
  projectId?: string,
  statusCode?: number
): void {
  const log = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'],
    userId,
    projectId,
    statusCode,
    headers: req.headers
  };
  
  console.log('API Request:', JSON.stringify(log, null, 2));
}

// ============================================================
// COMBINED MIDDLEWARE HELPERS
// ============================================================

/**
 * Complete middleware chain for protected routes
 */
export async function withAuthAndPermission(
  req: Request, 
  requiredPermission: string
) {
  // Check rate limiting
  const rateLimitResult = withRateLimit(req);
  if (!rateLimitResult.allowed) {
    return { 
      response: createErrorResponse(rateLimitResult.error!, 429, 'RATE_LIMIT_EXCEEDED'),
      user: null,
      projectId: null 
    };
  }

  // Check authentication and permission
  const authResult = await withPermission(req, requiredPermission);
  
  if (authResult.error) {
    const status = authResult.error.includes('No token') ? 401 : 403;
    return { 
      response: createErrorResponse(authResult.error, status),
      user: null,
      projectId: null 
    };
  }

  return { response: null, user: authResult.user, projectId: null };
}

/**
 * Complete middleware chain for project-specific routes
 */
export async function withAuthAndProjectContext(
  req: Request, 
  requiredPermission: string
) {
  // Check rate limiting
  const rateLimitResult = withRateLimit(req);
  if (!rateLimitResult.allowed) {
    return { 
      response: createErrorResponse(rateLimitResult.error!, 429, 'RATE_LIMIT_EXCEEDED'),
      user: null,
      projectId: null 
    };
  }

  // Check authentication and project context
  const contextResult = await withProjectPermission(req, requiredPermission);
  
  if (contextResult.error) {
    const status = contextResult.error.includes('No token') ? 401 : 
                  contextResult.error.includes('Project context') ? 400 : 403;
    return { 
      response: createErrorResponse(contextResult.error, status),
      user: null,
      projectId: null 
    };
  }

  return { 
    response: null, 
    user: contextResult.user, 
    projectId: contextResult.projectId 
  };
}
