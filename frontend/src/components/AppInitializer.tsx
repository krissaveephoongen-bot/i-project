import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataInitialization } from '@/contexts/DataInitializationContext';
import { BackgroundDataLoader } from './BackgroundDataLoader';

// A simple full-page loader for the initial auth check.
const AuthLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 dark:text-slate-400">Authenticating...</p>
    </div>
  </div>
);

interface AppInitializerProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
  /** Whether to use background loading (non-blocking) or full-screen loading */
  useBackgroundLoading?: boolean;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({
  children,
  onError,
  useBackgroundLoading = true, // Default to background loading (non-blocking)
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    status: dataStatus,
    error: dataError,
    startInitialization,
    isInitialized,
  } = useDataInitialization();

  // Effect to start data initialization once authentication is confirmed.
  useEffect(() => {
    if (isAuthenticated && !isInitialized && dataStatus === 'idle') {
      startInitialization();
    }
  }, [isAuthenticated, isInitialized, dataStatus, startInitialization]);

  // Effect to bubble up errors.
  useEffect(() => {
    if (dataError && onError) {
      onError(new Error(dataError));
    }
  }, [dataError, onError]);

  // 1. While authentication status is being determined, show a simple loader.
  if (authLoading) {
    return <AuthLoader />;
  }

  // 2. If authenticated but data is still loading
  if (isAuthenticated && !isInitialized) {
    if (useBackgroundLoading) {
      // Background loading mode: render children and show non-blocking progress indicator
      return (
        <>
          {children}
          <BackgroundDataLoader
            position="bottom-right"
            showStages={true}
            autoHideDelay={3000}
          />
        </>
      );
    } else {
      // Blocking mode: show full-screen loader (legacy behavior)
      return (
        <>
          {/* @ts-ignore - InitialDataLoader is imported via index.ts */}
          <InitialDataLoader />
          {children}
        </>
      );
    }
  }

  // 3. If authentication is complete and not authenticated OR 
  //    if authentication is complete and data is initialized, the app is ready.
  //    The router's own protected routes will handle redirecting unauthenticated users.
  return <>{children}</>;
};

export default AppInitializer;
