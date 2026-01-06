import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper for Admin Console
 * Requires:
 * 1. User to be authenticated
 * 2. User to have admin or superadmin role
 */
export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user } = useAuthContext();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/menu" replace />;
  }

  return children as React.ReactElement;
};
