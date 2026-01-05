import React, { ReactNode } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface DataStateHandlerProps {
  loading: boolean;
  error: Error | null;
  isEmpty: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  onCreateAction?: () => void;
  children: ReactNode;
}

export const DataStateHandler: React.FC<DataStateHandlerProps> = ({
  loading,
  error,
  isEmpty,
  emptyMessage = 'No data available. Create your first item to get started.',
  emptyTitle = 'No data',
  onCreateAction,
  children
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                  Error loading data
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        actionLabel="Create New"
        onAction={onCreateAction}
      />
    );
  }

  return <>{children}</>;
};

export default DataStateHandler;
