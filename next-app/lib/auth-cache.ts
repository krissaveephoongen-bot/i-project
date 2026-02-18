import redis from '@/lib/redis';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  lastActivity: string;
}

export class AuthCache {
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly USER_PREFIX = 'user:';
  private static readonly SESSION_TTL = 3600; // 1 hour
  private static readonly USER_TTL = 1800; // 30 minutes

  // Store user session
  static async setSession(sessionId: string, userData: UserSession): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const sessionData = {
      ...userData,
      lastActivity: new Date().toISOString()
    };
    
    await redis.set(key, JSON.stringify(sessionData), { EX: this.SESSION_TTL });
    
    // Also store user data for quick lookup
    const userKey = `${this.USER_PREFIX}${userData.id}`;
    await redis.set(userKey, JSON.stringify(sessionData), { EX: this.USER_TTL });
  }

  // Get user session
  static async getSession(sessionId: string): Promise<UserSession | null> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const cached = await redis.get(key);
    
    if (!cached) return null;
    
    const sessionData: UserSession = JSON.parse(cached);
    
    // Update last activity
    sessionData.lastActivity = new Date().toISOString();
    await redis.set(key, JSON.stringify(sessionData), { EX: this.SESSION_TTL });
    
    return sessionData;
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<UserSession | null> {
    const key = `${this.USER_PREFIX}${userId}`;
    const cached = await redis.get(key);
    
    if (!cached) return null;
    
    return JSON.parse(cached);
  }

  // Update user permissions
  static async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    const sessionKey = `${this.USER_PREFIX}${userId}`;
    const userKey = `${this.USER_PREFIX}${userId}`;
    
    const cached = await redis.get(userKey);
    if (!cached) return;
    
    const userData: UserSession = JSON.parse(cached);
    userData.permissions = permissions;
    userData.lastActivity = new Date().toISOString();
    
    await redis.set(sessionKey, JSON.stringify(userData), { EX: this.USER_TTL });
    await redis.set(userKey, JSON.stringify(userData), { EX: this.USER_TTL });
  }

  // Remove session (logout)
  static async removeSession(sessionId: string): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    const cached = await redis.get(sessionKey);
    
    if (cached) {
      const userData: UserSession = JSON.parse(cached);
      const userKey = `${this.USER_PREFIX}${userData.id}`;
      await redis.del(userKey);
    }
    
    await redis.del(sessionKey);
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    // This would typically be run by a background job
    // For now, Redis TTL handles automatic cleanup
    console.log('Session cleanup handled by Redis TTL');
  }

  // Rate limiting
  static async checkRateLimit(userId: string, action: string, limit: number = 10, window: number = 60): Promise<boolean> {
    const key = `rate_limit:${userId}:${action}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    return current <= limit;
  }

  // Cache user permissions
  static async cacheUserPermissions(userId: string, permissions: string[], ttl: number = 300): Promise<void> {
    const key = `permissions:${userId}`;
    await redis.set(key, JSON.stringify(permissions), { EX: ttl });
  }

  // Get cached user permissions
  static async getUserPermissions(userId: string): Promise<string[] | null> {
    const key = `permissions:${userId}`;
    const cached = await redis.get(key);
    
    return cached ? JSON.parse(cached) : null;
  }
}
