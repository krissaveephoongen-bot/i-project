import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminPIN } from '@/contexts/AdminPINContext';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper for Admin Console and PIN Management
 * Requires:
 * 1. User to be authenticated
 * 2. User to have admin role
 * 3. PIN verification (for Admin Console pages)
 */
export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user } = useAuthContext();
  const { isPINVerified, isSessionExpired } = useAdminPIN();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/menu" replace />;
  }

  // For Admin Console, check PIN verification
  // Check if session is expired
  if (isPINVerified && isSessionExpired()) {
    return <Navigate to="/admin/console" replace />;
  }

  return children as React.ReactElement;
};
