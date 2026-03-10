import { Request, Response } from 'express';
import { extractTokenFromHeader, validateSession, hasPermission } from '@/lib/auth';

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

/**
 * Middleware to authenticate requests
 */
export async function withAuth(req: Request): Promise<{ user: any; error?: string }> {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
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
  request: Request, 
  requiredPermission: string
): Promise<{ user: any; error?: string }> {
  const authResult = await withAuth(request);
  
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
  request: Request, 
  requiredPermissions: string[]
): Promise<{ user: any; error?: string }> {
  const authResult = await withAuth(request);
  
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
  request: Request, 
  requiredRole: string
): Promise<{ user: any; error?: string }> {
  const authResult = await withAuth(request);
  
  if (authResult.error) {
    return authResult;
  }

  if (!authResult.user.roles || !authResult.user.roles.some((role: any) => role.name === requiredRole)) {
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
  request: Request, 
  requiredRoles: string[]
): Promise<{ user: any; error?: string }> {
  const authResult = await withAuth(request);
  
  if (authResult.error) {
    return authResult;
  }

  const hasAny = requiredRoles.some(roleName => 
    authResult.user.roles?.some((role: any) => role.name === roleName)
  );

  if (!hasAny) {
    return { 
      user: null, 
      error: `Insufficient role. Required one of: ${requiredRoles.join(', ')}` 
    };
  }

  return authResult;
}

/**
 * Middleware to check project-specific permissions
 */
export async function withProjectPermission(
  request: Request, 
  requiredPermission: string
): Promise<{ 
  user: any; 
  projectId: string | null; 
  error?: string 
}> {
  const contextResult = await withProjectContext(request);
  
  if (contextResult.error) {
    return contextResult;
  }

  if (!hasPermission(contextResult.user, requiredPermission)) {
    return { 
      user: null, 
      projectId: contextResult.projectId,
      error: `Insufficient permissions for project. Required: ${requiredPermission}` 
    };
  }

  return contextResult;
}

/**
 * Middleware to ensure project context is present
 */
export async function withProjectContext(
  request: Request,
  projectId: string
): Promise<{ user: any; project: any; error?: string }> {
  const authResult = await withAuth(request);
  
  if (authResult.error) {
    return authResult;
  }

  // TODO: Implement project lookup logic here
  const project = null; // Replace with actual project lookup

  if (!project) {
    return { 
      user: authResult.user, 
      project: null, 
      error: 'Project not found' 
    };
  }

  return { user: authResult.user, project };
}

// ============================================================
// ERROR HANDLING HELPERS
// ============================================================

/**
 * Standard error response
 */
export function createErrorResponse(message: string, status: number = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function createSuccessResponse<T>(data: T, message?: string): Response {
  return new Response(JSON.stringify({ data, message }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response {
  return new Response(JSON.stringify({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    message
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): Response {
  return createErrorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden'): Response {
  return createErrorResponse(message, 403, 'FORBIDDEN');
}

/**
 * Not Found response
 */
export function notFoundResponse(message: string = 'Not Found'): Response {
  return createErrorResponse(message, 404, 'NOT_FOUND');
}

export default {
  withAuth,
  withPermission,
  withAnyPermission,
  withRole,
  withAnyRole,
  withProjectContext,
  withProjectPermission,
  createErrorResponse,
  createSuccessResponse,
  createPaginatedResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse
};
