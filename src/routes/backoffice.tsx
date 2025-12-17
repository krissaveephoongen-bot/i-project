import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { BackofficeLayout } from '@/layouts/BackofficeLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load backoffice pages
const Dashboard = lazy(() => import('@/pages/backoffice/Dashboard'));
const Users = lazy(() => import('@/pages/backoffice/Users'));

const BackofficeRoutes = {
  path: 'backoffice',
  element: (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <BackofficeLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </BackofficeLayout>
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <Dashboard />,
    },
    {
      path: 'users',
      element: <Users />,
    },
  ],
};

export default BackofficeRoutes;
