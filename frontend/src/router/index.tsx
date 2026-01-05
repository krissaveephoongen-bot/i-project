import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthContext } from '@/contexts/AuthContext';
import { BackofficeLayout } from '@/layouts/BackofficeLayout';
import { AdminConsoleWrapper } from '@/components/AdminConsoleWrapper';

// Lazy load pages for better performance
const HomePage = React.lazy(() => 
  import('@/pages/HomePage').catch(() => ({ default: () => <div>Loading...</div> }))
);

const LandingPage = React.lazy(() => 
  import('@/pages/LandingPage').catch(() => ({ default: () => <div>Loading...</div> }))
);

// Backoffice pages
const BackofficeDashboard = React.lazy(() => 
  import('@/pages/backoffice/Dashboard').catch(() => ({ default: () => <div>Loading Backoffice...</div> }))
);

const BackofficeUsers = React.lazy(() => 
  import('@/pages/backoffice/Users').catch(() => ({ default: () => <div>Loading Users...</div> }))
);


const Dashboard = React.lazy(() => 
  import('@/pages/dashboard/Dashboard').catch(() => ({ default: () => <div>Loading...</div> }))
);

const EnhancedDashboard = React.lazy(() => 
  import('@/pages/dashboard/EnhancedDashboard').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Menu = React.lazy(() => 
  import('@/pages/Menu').catch(() => ({ default: () => <div>Loading...</div> }))
);

const MenuEnhanced = React.lazy(() => 
  import('@/pages/MenuEnhanced').catch(() => ({ default: () => <div>Loading...</div> }))
);

const TaskManagementFull = React.lazy(() => 
  import('@/pages/TaskManagementFull').catch(() => ({ default: () => <div>Loading...</div> }))
);

const AnalyticsEnhanced = React.lazy(() => 
  import('@/pages/AnalyticsEnhanced').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Projects = React.lazy(() => 
  import('@/pages/Projects').catch(() => ({ default: () => <div>Loading...</div> }))
);


const MyProjects = React.lazy(() => 
  import('@/pages/MyProjects').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Timesheet = React.lazy(() => 
  import('@/pages/Timesheet').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Reports = React.lazy(() => 
  import('@/pages/Reports').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Settings = React.lazy(() => 
  import('@/pages/Settings').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Activity = React.lazy(() => 
  import('@/pages/Activity').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Expenses = React.lazy(() => 
  import('@/pages/Expenses').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Search = React.lazy(() => 
  import('@/pages/Search').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Favorites = React.lazy(() => 
  import('@/pages/Favorites').catch(() => ({ default: () => <div>Loading...</div> }))
);

const Login = React.lazy(() => 
  import('@/pages/auth/Login').catch(() => ({ default: () => <div>Loading...</div> }))
);

const ForgotPassword = React.lazy(() => 
  import('@/pages/auth/ForgotPassword').catch(() => ({ default: () => <div>Loading...</div> }))
);

const ResetPassword = React.lazy(() => 
  import('@/pages/auth/ResetPassword').catch(() => ({ default: () => <div>Loading...</div> }))
);

const NotFound = React.lazy(() => 
  import('@/pages/NotFound').catch(() => ({ default: () => <div>Loading...</div> }))
);

const ErrorPage = React.lazy(() => 
  import('@/pages/ErrorPage').catch(() => ({ default: () => <div>Error</div> }))
);

const ResourceManagement = React.lazy(() => 
  import('@/pages/ResourceManagement').catch(() => ({ default: () => <div>Loading...</div> }))
);

const TeamManagement = React.lazy(() => 
  import('@/pages/resources/TeamManagement').catch(() => ({ default: () => <div>Loading...</div> }))
);

const AllocationManagement = React.lazy(() => 
  import('@/pages/resources/AllocationManagement').catch(() => ({ default: () => <div>Loading...</div> }))
);

const CostManagement = React.lazy(() => 
  import('@/pages/CostManagement').catch(() => ({ default: () => <div>Loading...</div> }))
);

const AnalyticsDashboard = React.lazy(() => 
  import('@/pages/AnalyticsDashboard').catch(() => ({ default: () => <div>Loading...</div> }))
);

const ProjectTablePage = React.lazy(() => 
  import('@/pages/ProjectTablePage').catch(() => ({ default: () => <div>Loading...</div> }))
);

const ProjectIssueLog = React.lazy(() => 
  import('@/pages/ProjectIssueLog').catch(() => ({ default: () => <div>Loading...</div> }))
);

const ProjectBilling = React.lazy(() => 
  import('@/pages/ProjectBilling').catch(() => ({ default: () => <div>Loading...</div> }))
);

const AdminPINManagement = React.lazy(() => 
  import('@/pages/AdminPINManagement').catch(() => ({ default: () => <div>Loading...</div> }))
);

const ProjectDetailIntegrated = React.lazy(() => 
  import('@/pages/ProjectDetailIntegrated').catch(() => ({ default: () => <div>Loading...</div> }))
);

const CreateProjectPage = React.lazy(() => 
  import('@/pages/projects/CreateProjectPage').catch(() => ({ default: () => <div>Loading...</div> }))
);

const EditProjectPage = React.lazy(() => 
  import('@/pages/projects/EditProjectPage').catch(() => ({ default: () => <div>Loading...</div> }))
);

const ProjectDetailPage = React.lazy(() => 
  import('@/pages/projects/ProjectDetailPage').catch(() => ({ default: () => <div>Loading...</div> }))
);

const ProjectManagerUsersPage = React.lazy(() =>
  import('@/pages/ProjectManagerUsers').catch(() => ({ default: () => <div>Loading...</div> }))
);

const AllUsersPage = React.lazy(() =>
  import('@/pages/AllUsers').catch(() => ({ default: () => <div>Loading...</div> }))
);

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <LoadingSpinner />
  </div>
);

// Protected Route Wrapper
const ProtectedRouteWrapper: React.FC<{ 
  requiredRole?: string[]; 
  children: React.ReactNode 
}> = ({ requiredRole, children }) => {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Public Route Wrapper (redirect if authenticated)
const PublicRouteWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

// Auth layout for login/register pages
const AuthLayout: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  </div>
);

// Suspense wrapper for lazy loaded pages
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

// Route configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/landing" replace />,
  },
  {
    path: '/landing',
    element: <SuspenseWrapper><LandingPage /></SuspenseWrapper>,
  },
  // Auth routes (public)
  {
    element: <PublicRouteWrapper />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/auth/login',
            element: <SuspenseWrapper><Login /></SuspenseWrapper>,
          },
          {
            path: '/auth/forgot-password',
            element: <SuspenseWrapper><ForgotPassword /></SuspenseWrapper>,
          },
          {
            path: '/auth/reset-password',
            element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper>,
          },
        ],
      },
    ],
  },
  // Protected routes with Layout
  {
    element: (
      <ProtectedRouteWrapper>
        <Layout />
      </ProtectedRouteWrapper>
    ),
    children: [
      {
        path: '/',
        element: <SuspenseWrapper><HomePage /></SuspenseWrapper>,
      },
      {
        path: '/menu',
        element: <SuspenseWrapper><Menu /></SuspenseWrapper>,
      },
      {
        path: '/menu-enhanced',
        element: <SuspenseWrapper><MenuEnhanced /></SuspenseWrapper>,
      },
      {
        path: '/dashboard',
        element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>,
      },
      {
        path: '/dashboard-enhanced',
        element: <SuspenseWrapper><EnhancedDashboard /></SuspenseWrapper>,
      },
      {
        path: '/tasks',
        element: <SuspenseWrapper><TaskManagementFull /></SuspenseWrapper>,
      },
      {
        path: '/analytics-enhanced',
        element: <SuspenseWrapper><AnalyticsEnhanced /></SuspenseWrapper>,
      },
      {
        path: '/projects',
        element: <SuspenseWrapper><Projects /></SuspenseWrapper>,
      },
      {
        path: '/projects/my-projects',
        element: <SuspenseWrapper><MyProjects /></SuspenseWrapper>,
      },
      {
        path: '/projects/table',
        element: <SuspenseWrapper><ProjectTablePage /></SuspenseWrapper>,
      },
      {
        path: '/projects/create',
        element: (
          <ProtectedRouteWrapper requiredRole={['admin', 'manager']}>
            <SuspenseWrapper><CreateProjectPage /></SuspenseWrapper>
          </ProtectedRouteWrapper>
        ),
      },
      {
        path: '/projects/:id/edit',
        element: (
          <ProtectedRouteWrapper requiredRole={['admin', 'manager']}>
            <SuspenseWrapper><EditProjectPage /></SuspenseWrapper>
          </ProtectedRouteWrapper>
        ),
      },
      {
        path: '/projects/:id',
        element: <SuspenseWrapper><ProjectDetailPage /></SuspenseWrapper>,
      },
      {
        path: '/projects/:projectId/integrated',
        element: <SuspenseWrapper><ProjectDetailIntegrated /></SuspenseWrapper>,
      },
      {
        path: '/projects/:projectId/issues',
        element: (
          <SuspenseWrapper>
            <ProjectIssueLog projectId="" />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/projects/:projectId/billing',
        element: (
          <SuspenseWrapper>
            <ProjectBilling projectId="" />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/project-manager',
        element: (
          <ProtectedRouteWrapper requiredRole={['admin']}>
            <SuspenseWrapper><ProjectManagerUsersPage /></SuspenseWrapper>
          </ProtectedRouteWrapper>
        ),
      },
      {
        path: '/project-manager-users',
        element: (
          <ProtectedRouteWrapper requiredRole={['admin']}>
            <SuspenseWrapper><ProjectManagerUsersPage /></SuspenseWrapper>
          </ProtectedRouteWrapper>
        ),
      },
      {
        path: '/resources',
        element: <SuspenseWrapper><ResourceManagement /></SuspenseWrapper>,
      },
      {
        path: '/resources/team',
        element: <SuspenseWrapper><TeamManagement /></SuspenseWrapper>,
      },
      {
        path: '/resources/allocation',
        element: <SuspenseWrapper><AllocationManagement /></SuspenseWrapper>,
      },
      {
        path: '/timesheet',
        element: <SuspenseWrapper><Timesheet /></SuspenseWrapper>,
      },
      {
        path: '/settings',
        element: <SuspenseWrapper><Settings /></SuspenseWrapper>,
      },
      {
        path: '/activity',
        element: <SuspenseWrapper><Activity /></SuspenseWrapper>,
      },
      {
        path: '/search',
        element: <SuspenseWrapper><Search /></SuspenseWrapper>,
      },
      {
        path: '/expenses',
        element: <SuspenseWrapper><Expenses /></SuspenseWrapper>,
      },
      {
        path: '/reports',
        element: <SuspenseWrapper><Reports /></SuspenseWrapper>,
      },
      {
        path: '/cost-management',
        element: <SuspenseWrapper><CostManagement /></SuspenseWrapper>,
      },
      {
        path: '/analytics',
        element: <SuspenseWrapper><AnalyticsDashboard /></SuspenseWrapper>,
      },
      {
        path: '/favorites',
        element: <SuspenseWrapper><Favorites /></SuspenseWrapper>,
      },
      {
        path: '/admin/pin-management',
        element: (
          <ProtectedRouteWrapper requiredRole={['admin']}>
            <SuspenseWrapper><AdminPINManagement /></SuspenseWrapper>
          </ProtectedRouteWrapper>
        ),
      },
    ],
  },
  // Admin Console Route (protected)
  {
    path: '/admin',
    element: (
      <ProtectedRouteWrapper requiredRole={['admin']}>
        <AdminConsoleWrapper />
      </ProtectedRouteWrapper>
    ),
  },
  // Redirect from /admin/console to /admin
  {
    path: '/admin/console',
    element: <Navigate to="/admin" replace />,
  },
  // Backoffice routes (admin only)
  {
    element: (
      <ProtectedRouteWrapper requiredRole={['admin']}>
        <BackofficeLayout />
      </ProtectedRouteWrapper>
    ),
    children: [
      {
        path: 'backoffice',
        element: <SuspenseWrapper><BackofficeDashboard /></SuspenseWrapper>,
      },
      {
        path: 'backoffice/users',
        element: <SuspenseWrapper><BackofficeUsers /></SuspenseWrapper>,
      },
    ],
  },
  
  // Error and 404 routes
  {
    path: '/error',
    element: <SuspenseWrapper><ErrorPage /></SuspenseWrapper>,
    errorElement: <SuspenseWrapper><ErrorPage /></SuspenseWrapper>,
  },
  {
    path: '*',
    element: <SuspenseWrapper><NotFound /></SuspenseWrapper>,
    errorElement: <SuspenseWrapper><ErrorPage /></SuspenseWrapper>,
  },
]);

// Router Provider Component
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
