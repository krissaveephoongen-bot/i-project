import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600 dark:text-indigo-400`} />
        {message && (
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50">
      <LoadingState message="Processing..." fullScreen={false} size="lg" />
    </div>
  );
}
