import React, { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';

const AdminConsole = React.lazy(() => import('@/pages/AdminConsole'));

const PageLoader: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <LoadingSpinner />
  </div>
);

/**
 * Wrapper component for AdminConsole
 * Handles:
 * 1. Lazy loading
 * 2. Suspense fallback
 * 3. Route protection
 */
export const AdminConsoleWrapper: React.FC = () => {
  return (
    <ProtectedAdminRoute>
      <Suspense fallback={<PageLoader />}>
        <AdminConsole />
      </Suspense>
    </ProtectedAdminRoute>
  );
};

export default AdminConsoleWrapper;
