import { useState } from 'react';
import { securityService } from '../services/securityService';
import { User } from '../services/dataService';

export function useSecurity() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [securityResults, setSecurityResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const secureDataStorage = async (data: any, key: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      await securityService.secureDataStorage(data, key);
      setSecurityResults({ message: 'Data securely stored', key });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to securely store data');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const retrieveSecureData = async (key: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const data = await securityService.retrieveSecureData(key);
      setSecurityResults({ data, key });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve secure data');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const hasPermission = (user: User | null, requiredRole: string | string[]): boolean => {
    return securityService.hasPermission(user, requiredRole);
  };

  const hasProjectPermission = (user: User | null, projectId: string, permissionType: 'view' | 'edit' | 'admin'): boolean => {
    return securityService.hasProjectPermission(user, projectId, permissionType);
  };

  const validatePasswordStrength = (password: string) => {
    return securityService.validatePasswordStrength(password);
  };

  const setupTwoFactorAuth = async (userId: string, method: 'email' | 'sms' | 'authenticator') => {
    try {
      setIsProcessing(true);
      setError(null);

      const result = await securityService.setupTwoFactorAuth(userId, method);
      setSecurityResults({ twoFactorSetup: result });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup two-factor authentication');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyTwoFactorAuth = async (userId: string, code: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const isValid = await securityService.verifyTwoFactorAuth(userId, code);
      setSecurityResults({ twoFactorVerification: isValid });
      return isValid;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify two-factor authentication');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const performSecurityHealthCheck = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const healthCheck = await securityService.performSecurityHealthCheck();
      setSecurityResults({ securityHealth: healthCheck });
      return healthCheck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform security health check');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSecurityReport = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const report = await securityService.generateSecurityReport();
      setSecurityResults({ securityReport: report });
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate security report');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const createSecureSession = async (userId: string, sessionData: any) => {
    try {
      setIsProcessing(true);
      setError(null);

      const sessionToken = await securityService.createSecureSession(userId, sessionData);
      setSecurityResults({ sessionToken });
      return sessionToken;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create secure session');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const validateSession = async (sessionToken: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const validation = await securityService.validateSession(sessionToken);
      setSecurityResults({ sessionValidation: validation });
      return validation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate session');
      return { valid: false };
    } finally {
      setIsProcessing(false);
    }
  };

  const invalidateSession = async (sessionToken: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const success = await securityService.invalidateSession(sessionToken);
      setSecurityResults({ sessionInvalidation: success });
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invalidate session');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    securityResults,
    error,
    secureDataStorage,
    retrieveSecureData,
    hasPermission,
    hasProjectPermission,
    validatePasswordStrength,
    setupTwoFactorAuth,
    verifyTwoFactorAuth,
    performSecurityHealthCheck,
    generateSecurityReport,
    createSecureSession,
    validateSession,
    invalidateSession,
  };
}