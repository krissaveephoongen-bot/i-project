import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { eq, and, desc, gt } from 'drizzle-orm';
import { db } from './database';
import { users, roles, userRoles, permissions, rolePermissions, sessions, auditLogs } from './auth-schema';
import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, CurrentUser, Session } from './auth-schema';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Password Configuration
const SALT_ROUNDS = 12;

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(userId: string): string {
  return jwt.sign(
    { 
      userId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { 
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): { userId: string; type: 'access' } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type === 'access') {
      return { userId: decoded.userId, type: 'access' };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; type: 'refresh' } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    if (decoded.type === 'refresh') {
      return { userId: decoded.userId, type: 'refresh' };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiresIn(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 900; // Default 15 minutes
  }
}

// ============================================================
// USER AUTHENTICATION
// ============================================================

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<CurrentUser | null> {
  try {
    // Find user with roles and permissions
    const userWithRoles = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        userRoles: {
          where: eq(userRoles.isActive, true),
          with: {
            role: {
              with: {
                rolePermissions: {
                  where: eq(rolePermissions.isActive, true),
                  with: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!userWithRoles) {
      return null;
    }

    // Check if user is active
    if (!userWithRoles.isActive || userWithRoles.isDeleted) {
      return null;
    }

    // Check if account is locked
    if (userWithRoles.lockedUntil && new Date(userWithRoles.lockedUntil) > new Date()) {
      return null;
    }

    // Verify password
    if (!userWithRoles.password) {
      return null;
    }

    const isPasswordValid = await comparePassword(password, userWithRoles.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await db.update(users)
        .set({ 
          failedLoginAttempts: userWithRoles.failedLoginAttempts + 1,
          updatedAt: new Date()
        })
        .where(eq(users.id, userWithRoles.id));

      // Lock account if too many failed attempts
      if (userWithRoles.failedLoginAttempts + 1 >= 5) {
        await db.update(users)
          .set({ 
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // Lock for 30 minutes
            updatedAt: new Date()
          })
          .where(eq(users.id, userWithRoles.id));
      }

      return null;
    }

    // Reset failed login attempts on successful login
    if (userWithRoles.failedLoginAttempts > 0) {
      await db.update(users)
        .set({ 
          failedLoginAttempts: 0,
          lastLogin: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, userWithRoles.id));
    }

    // Extract unique roles and permissions
    const uniqueRoles = Array.from(new Map(
      userWithRoles.userRoles.map(ur => [ur.role.id, ur.role])
    ).values());

    const uniquePermissions = Array.from(new Map(
      uniqueRoles.flatMap(role => 
        role.rolePermissions.map(rp => [rp.permission.id, rp.permission])
      )
    ).values());

    // Build current user object
    const currentUser: CurrentUser = {
      id: userWithRoles.id,
      name: userWithRoles.name,
      email: userWithRoles.email,
      role: userWithRoles.role,
      department: userWithRoles.department,
      position: userWithRoles.position,
      employeeCode: userWithRoles.employeeCode,
      phone: userWithRoles.phone,
      avatar: userWithRoles.avatar,
      status: userWithRoles.status,
      isActive: userWithRoles.isActive,
      isDeleted: userWithRoles.isDeleted,
      isProjectManager: userWithRoles.isProjectManager,
      isSupervisor: userWithRoles.isSupervisor,
      notificationPreferences: userWithRoles.notificationPreferences,
      timezone: userWithRoles.timezone,
      hourlyRate: userWithRoles.hourlyRate,
      weeklyCapacity: userWithRoles.weeklyCapacity,
      createdAt: userWithRoles.createdAt,
      updatedAt: userWithRoles.updatedAt,
      roles: uniqueRoles,
      permissions: uniquePermissions,
      preferences: {
        timezone: userWithRoles.timezone || 'Asia/Bangkok',
        language: 'en',
        theme: 'light'
      }
    };

    return currentUser;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Login user and create session
 */
export async function loginUser(loginData: LoginRequest): Promise<LoginResponse | null> {
  try {
    const user = await authenticateUser(loginData.email, loginData.password);
    if (!user) {
      return null;
    }

    // Generate tokens
    const token = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const expiresIn = getTokenExpiresIn(JWT_EXPIRES_IN);

    // Create session
    const expiresAt = new Date(Date.now() + getTokenExpiresIn(JWT_REFRESH_EXPIRES_IN) * 1000);
    await db.insert(sessions).values({
      userId: user.id,
      token,
      refreshToken,
      deviceInfo: loginData.deviceInfo || {},
      ipAddress: loginData.deviceInfo?.ip || '',
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Log audit
    await db.insert(auditLogs).values({
      userId: user.id,
      action: 'login',
      resource: 'session',
      method: 'POST',
      endpoint: '/api/auth/login',
      userAgent: loginData.deviceInfo?.userAgent || '',
      ipAddress: loginData.deviceInfo?.ip || '',
      status: 'success',
      createdAt: new Date()
    });

    return {
      user,
      token,
      refreshToken,
      expiresIn
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshData: RefreshTokenRequest): Promise<RefreshTokenResponse | null> {
  try {
    // Verify refresh token
    const tokenData = verifyRefreshToken(refreshData.refreshToken);
    if (!tokenData) {
      return null;
    }

    // Find valid session
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.refreshToken, refreshData.refreshToken),
        eq(sessions.isActive, true),
        gt(sessions.expiresAt, new Date())
      ),
      with: {
        user: true
      }
    });

    if (!session || session.userId !== tokenData.userId) {
      return null;
    }

    // Generate new tokens
    const newToken = generateAccessToken(tokenData.userId);
    const newRefreshToken = generateRefreshToken(tokenData.userId);
    const expiresIn = getTokenExpiresIn(JWT_EXPIRES_IN);

    // Update session
    const expiresAt = new Date(Date.now() + getTokenExpiresIn(JWT_REFRESH_EXPIRES_IN) * 1000);
    await db.update(sessions)
      .set({
        token: newToken,
        refreshToken: newRefreshToken,
        lastActivity: new Date(),
        expiresAt,
        updatedAt: new Date()
      })
      .where(eq(sessions.id, session.id));

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Logout user and invalidate session
 */
export async function logoutUser(token: string, refreshToken?: string): Promise<boolean> {
  try {
    // Deactivate session(s)
    if (refreshToken) {
      await db.update(sessions)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(sessions.refreshToken, refreshToken));
    } else {
      await db.update(sessions)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(sessions.token, token));
    }

    // Get user ID from token for audit log
    const tokenData = verifyAccessToken(token);
    if (tokenData) {
      await db.insert(auditLogs).values({
        userId: tokenData.userId,
        action: 'logout',
        resource: 'session',
        method: 'POST',
        endpoint: '/api/auth/logout',
        status: 'success',
        createdAt: new Date()
      });
    }

    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

/**
 * Get current user from token
 */
export async function getCurrentUser(token: string): Promise<CurrentUser | null> {
  try {
    const tokenData = verifyAccessToken(token);
    if (!tokenData) {
      return null;
    }

    // Find valid session
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, token),
        eq(sessions.isActive, true),
        gt(sessions.expiresAt, new Date())
      )
    });

    if (!session) {
      return null;
    }

    // Get user with roles and permissions
    const userWithRoles = await db.query.users.findFirst({
      where: eq(users.id, tokenData.userId),
      with: {
        userRoles: {
          where: eq(userRoles.isActive, true),
          with: {
            role: {
              with: {
                rolePermissions: {
                  where: eq(rolePermissions.isActive, true),
                  with: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!userWithRoles || !userWithRoles.isActive || userWithRoles.isDeleted) {
      return null;
    }

    // Extract unique roles and permissions
    const uniqueRoles = Array.from(new Map(
      userWithRoles.userRoles.map(ur => [ur.role.id, ur.role])
    ).values());

    const uniquePermissions = Array.from(new Map(
      uniqueRoles.flatMap(role => 
        role.rolePermissions.map(rp => [rp.permission.id, rp.permission])
      )
    ).values());

    // Build current user object
    const currentUser: CurrentUser = {
      id: userWithRoles.id,
      name: userWithRoles.name,
      email: userWithRoles.email,
      role: userWithRoles.role,
      department: userWithRoles.department,
      position: userWithRoles.position,
      employeeCode: userWithRoles.employeeCode,
      phone: userWithRoles.phone,
      avatar: userWithRoles.avatar,
      status: userWithRoles.status,
      isActive: userWithRoles.isActive,
      isDeleted: userWithRoles.isDeleted,
      isProjectManager: userWithRoles.isProjectManager,
      isSupervisor: userWithRoles.isSupervisor,
      notificationPreferences: userWithRoles.notificationPreferences,
      timezone: userWithRoles.timezone,
      hourlyRate: userWithRoles.hourlyRate,
      weeklyCapacity: userWithRoles.weeklyCapacity,
      createdAt: userWithRoles.createdAt,
      updatedAt: userWithRoles.updatedAt,
      roles: uniqueRoles,
      permissions: uniquePermissions,
      preferences: {
        timezone: userWithRoles.timezone || 'Asia/Bangkok',
        language: 'en',
        theme: 'light'
      }
    };

    // Update session activity
    await db.update(sessions)
      .set({ 
        lastActivity: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sessions.id, session.id));

    return currentUser;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// ============================================================
// PERMISSION HELPERS
// ============================================================

/**
 * Check if user has specific permission
 */
export function hasPermission(user: CurrentUser, permissionName: string): boolean {
  return user.permissions.some(permission => permission.name === permissionName);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: CurrentUser, permissionNames: string[]): boolean {
  return permissionNames.some(permissionName => hasPermission(user, permissionName));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: CurrentUser, permissionNames: string[]): boolean {
  return permissionNames.every(permissionName => hasPermission(user, permissionName));
}

/**
 * Check if user has specific role
 */
export function hasRole(user: CurrentUser, roleName: string): boolean {
  return user.roles.some(role => role.name === roleName);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: CurrentUser, roleNames: string[]): boolean {
  return roleNames.some(roleName => hasRole(user, roleName));
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: CurrentUser): string[] {
  return user.permissions.map(permission => permission.name);
}

// ============================================================
// MIDDLEWARE HELPERS
// ============================================================

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Validate session and get current user
 */
export async function validateSession(token: string): Promise<CurrentUser | null> {
  return getCurrentUser(token);
}

// ============================================================
// CLEANUP HELPERS
// ============================================================

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await db.delete(sessions)
      .where(
        and(
          eq(sessions.isActive, false),
          gt(sessions.expiresAt, new Date())
        )
      );
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}

/**
 * Clean up old audit logs (older than 90 days)
 */
export async function cleanupOldAuditLogs(): Promise<void> {
  try {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    await db.delete(auditLogs)
      .where(
        gt(auditLogs.createdAt, cutoffDate)
      );
  } catch (error) {
    console.error('Audit log cleanup error:', error);
  }
}
