/**
 * App Initializer Component
 * 
 * Root component that handles the complete initialization flow:
 * 1. Auth check
 * 2. Data loading (with progress spinner)
 * 3. Ready state
 */

import React, { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataInitialization } from '@/contexts/DataInitializationContext';
import { InitialDataLoader } from './InitialDataLoader';
import { DataLoader } from './DataLoader';

interface AppInitializerProps {
  children: React.ReactNode;
  /** Custom loading component to show during initialization */
  loadingComponent?: React.ReactNode;
  /** Whether to skip data loading (for debugging) */
  skipDataLoading?: boolean;
  /** Callback when app is fully ready */
  onReady?: () => void;
  /** Callback when initialization fails */
  onError?: (error: Error) => void;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({
  children,
  loadingComponent,
  skipDataLoading = false,
  onReady,
  onError,
}) => {
  const { isAuthenticated, isLoading: authLoading, user, login } = useAuth();
  const {
    status: dataStatus,
    progress,
    error: dataError,
    startInitialization,
    isInitialized,
  } = useDataInitialization();

  const [appReady, setAppReady] = useState(false);
  const [initStarted, setInitStarted] = useState(false);

  // Determine if we should show the data loader
  const showDataLoader = !skipDataLoading && 
    isAuthenticated && 
    authLoading === false &&
    !isInitialized &&
    dataStatus !== 'idle';

  // Handle initialization complete
  const handleDataReady = useCallback(() => {
    setAppReady(true);
    onReady?.();
  }, [onReady]);

  // Start data initialization after auth is ready
  useEffect(() => {
    if (isAuthenticated && !authLoading && !initStarted && !skipDataLoading) {
      setInitStarted(true);
      startInitialization();
    }
  }, [isAuthenticated, authLoading, initStarted, skipDataLoading, startInitialization]);

  // Handle errors
  useEffect(() => {
    if (dataStatus === 'error' && dataError) {
      onError?.(new Error(dataError));
    }
  }, [dataStatus, dataError, onError]);

  // Show data loader during initialization
  if (showDataLoader) {
    return (
      <>
        <InitialDataLoader 
          onComplete={handleDataReady}
          brandColor="#3B82F6"
          showDetails={true}
        />
        {/* Keep rendering children in background but hidden */}
        <div className="hidden">
          {children}
        </div>
      </>
    );
  }

  // If using custom loading component
  if (loadingComponent && (authLoading || (isAuthenticated && !isInitialized))) {
    return (
      <>
        {loadingComponent}
        <div className="hidden">
          {children}
        </div>
      </>
    );
  }

  // App is ready
  if (appReady || (!isAuthenticated && !authLoading)) {
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
};

// Higher-order component version
export function withAppInitializer<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    skipDataLoading?: boolean;
    onReady?: () => void;
    onError?: (error: Error) => void;
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <AppInitializer
        skipDataLoading={options?.skipDataLoading}
        onReady={options?.onReady}
        onError={options?.onError}
      >
        <Component {...props} />
      </AppInitializer>
    );
  };
}

export default AppInitializer;
