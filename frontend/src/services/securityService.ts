import { toast } from 'react-hot-toast';
import { User } from './dataService';
import { settingsService } from './settingsService';

// Security Service for enhanced protection
class SecurityService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  /**
   * Secure data storage with encryption
   */
  async secureDataStorage(data: any, key: string): Promise<void> {
    try {
      // Use server-side secure storage via API
      await fetch(`${this.baseURL}/secure-storage/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
        credentials: 'include',
      });
      toast.success('Data securely stored');
    } catch (error) {
      toast.error('Failed to securely store data');
      console.error('Secure Storage Error:', error);
      throw error;
    }
  }

  /**
   * Retrieve secured data
   */
  async retrieveSecureData(key: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/secure-storage/${key}`, {
        credentials: 'include',
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Secure Retrieval Error:', error);
      return null;
    }
  }

  /**
   * Role-based access control
   */
  hasPermission(user: User | null, requiredRole: string | string[]): boolean {
    if (!user) return false;

    const userRole = user.role;
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    return requiredRoles.includes(userRole);
  }

  /**
   * Project-level permissions
   */
  async hasProjectPermission(
    user: User | null,
    projectId: string,
    permissionType: 'view' | 'edit' | 'admin'
  ): Promise<boolean> {
    if (!user) return false;

    try {
      const response = await fetch(
        `${this.baseURL}/projects/${projectId}/permissions?type=${permissionType}`,
        { credentials: 'include' }
      );
      return response.ok;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Audit logging
   */
  async logSecurityEvent(eventType: string, details: any, userId?: string): Promise<void> {
    try {
      await fetch(`${this.baseURL}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          details,
          userId: userId || 'system',
        }),
        credentials: 'include',
      });
      console.log('Security event logged:', eventType);
    } catch (error) {
      console.error('Audit Logging Error:', error);
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(limit = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/audit-logs?limit=${limit}`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  /**
   * Password strength validation
   */
  validatePasswordStrength(password: string): { valid: boolean; score: number; feedback: string[] } {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 12) {
      score += 2;
    } else if (password.length >= 8) {
      score += 1;
      feedback.push('Password should be at least 12 characters');
    } else {
      feedback.push('Password must be at least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add uppercase letters for better security');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add lowercase letters for better security');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add numbers for better security');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 2;
    } else {
      feedback.push('Add special characters for better security');
    }

    const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.unshift('Avoid common passwords');
    }

    const valid = score >= 5;

    return {
      valid,
      score,
      feedback: valid && feedback.length === 0 ? ['Strong password!'] : feedback,
    };
  }

  /**
   * Two-factor authentication setup
   */
  async setupTwoFactorAuth(
    userId: string,
    method: 'email' | 'sms' | 'authenticator'
  ): Promise<{ success: boolean; secret?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/2fa/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to setup 2FA');
      }

      const result = await response.json();
      await this.logSecurityEvent('2fa_setup', { userId, method, success: true }, userId);
      toast.success('Two-factor authentication setup completed');
      return { success: true, secret: result.secret };
    } catch (error) {
      toast.error('Failed to setup two-factor authentication');
      console.error('2FA Setup Error:', error);
      return { success: false };
    }
  }

  /**
   * Verify two-factor authentication
   */
  async verifyTwoFactorAuth(userId: string, code: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include',
      });

      const isValid = response.ok;
      await this.logSecurityEvent(
        '2fa_verification',
        { userId, success: isValid },
        userId
      );
      return isValid;
    } catch (error) {
      console.error('2FA Verification Error:', error);
      return false;
    }
  }

  /**
   * Data encryption for sensitive fields
   */
  async encryptSensitiveData(data: any, sensitiveFields: string[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/crypto/encrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, fields: sensitiveFields }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Encryption failed');
      return await response.json();
    } catch (error) {
      console.error('Encryption Error:', error);
      return data;
    }
  }

  /**
   * Data decryption for sensitive fields
   */
  async decryptSensitiveData(data: any, sensitiveFields: string[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/crypto/decrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, fields: sensitiveFields }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Decryption failed');
      return await response.json();
    } catch (error) {
      console.error('Decryption Error:', error);
      return data;
    }
  }

  /**
   * Security health check
   */
  async performSecurityHealthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/security/health-check`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Security Health Check Error:', error);
      return {
        overallStatus: 'error',
        checks: [],
        score: 0,
        recommendations: ['Failed to perform security health check'],
      };
    }
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/security/report`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Report generation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Security Report Generation Error:', error);
      return {
        error: 'Failed to generate security report',
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Secure session management
   */
  async createSecureSession(userId: string, sessionData: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, data: sessionData }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Session creation failed');
      }

      const result = await response.json();
      await this.logSecurityEvent('session_created', { userId }, userId);
      return result.sessionToken;
    } catch (error) {
      toast.error('Failed to create secure session');
      console.error('Session Creation Error:', error);
      throw error;
    }
  }

  /**
   * Validate session
   */
  async validateSession(sessionToken: string): Promise<{ valid: boolean; session?: any }> {
    try {
      const response = await fetch(`${this.baseURL}/sessions/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionToken }),
        credentials: 'include',
      });

      if (!response.ok) {
        return { valid: false };
      }

      const result = await response.json();
      return { valid: true, session: result.session };
    } catch (error) {
      console.error('Session Validation Error:', error);
      return { valid: false };
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/sessions/invalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionToken }),
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      await this.logSecurityEvent('session_invalidated', {}, 'system');
      return true;
    } catch (error) {
      console.error('Session Invalidation Error:', error);
      return false;
    }
  }
}

export const securityService = new SecurityService();
