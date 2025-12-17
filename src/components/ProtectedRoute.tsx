import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  allowedRoles?: string[];
  redirectPath?: string;
};

const ProtectedRoute = ({
  allowedRoles = ['admin'],
  redirectPath = '/login',
}: ProtectedRouteProps) => {
  const { user: currentUser, isLoading: loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!currentUser) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
