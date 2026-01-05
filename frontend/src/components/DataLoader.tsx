import React from 'react';
import { ApiError } from '@/lib/error-handler';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

interface DataLoaderProps {
  loading: boolean;
  error: ApiError | null;
  data: any;
  isEmpty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  fallbackMessage?: string;
}

export const DataLoader: React.FC<DataLoaderProps> = ({
  loading,
  error,
  data,
  isEmpty = false,
  onRetry,
  children,
  loadingComponent,
  emptyComponent,
  fallbackMessage = 'No data available',
}) => {
  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Loading state
  if (loading) {
    return loadingComponent || <LoadingState />;
  }

  // Empty state
  if (isEmpty || !data || (Array.isArray(data) && data.length === 0)) {
    return (
      emptyComponent || (
        <div className="flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600 dark:text-gray-400">{fallbackMessage}</p>
          </div>
        </div>
      )
    );
  }

  // Success state - render children
  return <>{children}</>;
};

export default DataLoader;
