import { Router } from 'express';
import { z } from 'zod';
import { 
  loginUser, 
  refreshAccessToken, 
  logoutUser, 
  getCurrentUser,
  hashPassword,
  comparePassword
} from '@/lib/auth';
import { 
  withAuth, 
  withPermission,
  createErrorResponse,
  createSuccessResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  addCorsHeaders
} from '@/lib/express-middleware';
import { users } from '@/lib/auth-schema';
import { db } from '@/lib/database';

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    ip: z.string().optional(),
    platform: z.string().optional()
  }).optional()
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const logoutSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  refreshToken: z.string().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

// ============================================================
// AUTH ROUTES
// ============================================================

/**
 * POST /api/auth/login
 * Login user and return JWT tokens
 */
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    // Attempt login
    const result = await loginUser(validation.data);
    
    if (!result) {
      return res.status(401).json(unauthorizedResponse('Invalid email or password'));
    }

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return success response
    res.status(200).json(createSuccessResponse(result, 'Login successful'));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    // Validate request body
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    // Refresh token
    const result = await refreshAccessToken(validation.data);
    
    if (!result) {
      return res.status(401).json(unauthorizedResponse('Invalid or expired refresh token'));
    }

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return success response
    res.status(200).json(createSuccessResponse(result, 'Token refreshed successfully'));
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post('/logout', async (req, res) => {
  try {
    // Validate request body
    const validation = logoutSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    // Logout user
    const success = await logoutUser(validation.data.token, validation.data.refreshToken);
    
    if (!success) {
      return res.status(400).json(createErrorResponse('Logout failed', 400));
    }

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return success response
    res.status(200).json(createSuccessResponse(null, 'Logout successful'));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', async (req, res) => {
  try {
    // Authenticate user
    const authResult = await withAuth(req);
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return user information
    res.status(200).json(createSuccessResponse(authResult.user, 'User retrieved successfully'));
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/auth/change-password
 * Change user password
 */
router.put('/change-password', async (req, res) => {
  try {
    // Authenticate user
    const authResult = await withAuth(req);
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    // Validate request body
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    // Get current user password
    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, authResult.user.id)
    });

    if (!currentUser || !currentUser.password) {
      return res.status(400).json(createErrorResponse('User not found or no password set', 400));
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      validation.data.currentPassword, 
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json(createErrorResponse('Current password is incorrect', 400));
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(validation.data.newPassword);

    // Update password
    await db.update(users)
      .set({ 
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where((users, { eq }) => eq(users.id, authResult.user.id));

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return success response
    res.status(200).json(createSuccessResponse(null, 'Password changed successfully'));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email (placeholder implementation)
 */
router.post('/forgot-password', async (req, res) => {
  try {
    // Validate request body
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, validation.data.email)
    });

    if (!user) {
      // Don't reveal that user doesn't exist
      return res.status(200).json(createSuccessResponse(null, 'If the email exists, a reset link has been sent'));
    }

    // TODO: Implement actual email sending logic
    // For now, just return success
    console.log('Password reset requested for:', validation.data.email);

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return success response
    res.status(200).json(createSuccessResponse(null, 'If the email exists, a reset link has been sent'));
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', async (req, res) => {
  try {
    // Validate request body
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    // TODO: Implement actual token validation logic
    // For now, just return an error
    return res.status(400).json(createErrorResponse('Password reset functionality not yet implemented', 400));

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return success response (when implemented)
    // res.status(200).json(createSuccessResponse(null, 'Password reset successful'));
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/auth/permissions
 * Get current user permissions
 */
router.get('/permissions', async (req, res) => {
  try {
    // Authenticate user
    const authResult = await withAuth(req);
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    // Extract permissions
    const permissions = authResult.user.permissions.map((permission: any) => permission.name);

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return permissions
    res.status(200).json(createSuccessResponse(permissions, 'Permissions retrieved successfully'));
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/auth/roles
 * Get current user roles
 */
router.get('/roles', async (req, res) => {
  try {
    // Authenticate user
    const authResult = await withAuth(req);
    
    if (authResult.error) {
      const status = authResult.error.includes('No token') ? 401 : 403;
      return res.status(status).json(createErrorResponse(authResult.error, status));
    }

    // Extract roles
    const roles = authResult.user.roles.map((role: any) => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description
    }));

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return roles
    res.status(200).json(createSuccessResponse(roles, 'Roles retrieved successfully'));
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * GET /api/auth/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service'
    }, 'Auth service is healthy'));
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json(createErrorResponse('Health check failed', 500));
  }
});

export default router;
