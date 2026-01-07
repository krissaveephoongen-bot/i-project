/**
 * Initial Data Loading Screen Component
 * Displays loading spinner and data loading progress after login
 */
import React from 'react';

interface InitialDataLoadingScreenProps {
  progress: {
    total: number;
    loaded: number;
    failed: number;
    percentage: number;
    currentItem?: string;
  };
  error?: string;
  onRetry?: () => void;
  onSkip?: () => void;
}

export const InitialDataLoadingScreen: React.FC<InitialDataLoadingScreenProps> = ({
  progress,
  error,
  onRetry,
  onSkip,
}) => {
  const getItemDisplayName = (key: string): string => {
    const displayNames: Record<string, string> = {
      cache_user_profile: 'User Profile',
      cache_projects: 'Projects',
      cache_users: 'Users',
      cache_tasks: 'Tasks',
      cache_customers: 'Customers',
      cache_analytics: 'Analytics',
    };
    return displayNames[key] || key.replace('cache_', '').replace('_', ' ');
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center z-50">
      {/* Logo/Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Project Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Preparing your workspace...
        </p>
      </div>

      {/* Main Loading Circle */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-blue-600">
          {progress.percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-80 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Current Loading Item */}
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {progress.currentItem ? (
            <>
              Loading <span className="font-medium">{getItemDisplayName(progress.currentItem)}</span>
              ...
            </>
          ) : (
            'Preparing...'
          )}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          {progress.loaded} of {progress.total} items loaded
          {progress.failed > 0 && (
            <span className="text-orange-500 ml-2">
              ({progress.failed} failed)
            </span>
          )}
        </p>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 max-w-sm">
          <p className="text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </p>
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Skip & Continue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading Tips */}
      <div className="text-center text-gray-400 dark:text-gray-500 text-xs max-w-md">
        <p>This happens only once after login to ensure all your data is available offline.</p>
      </div>
    </div>
  );
};

export default InitialDataLoadingScreen;
