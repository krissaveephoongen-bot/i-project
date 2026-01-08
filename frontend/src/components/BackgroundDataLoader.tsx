/**
 * Background Data Loader Component
 * 
 * Non-blocking progress indicator that shows data loading progress
 * while allowing users to interact with the application.
 * Displays as a toast notification in the bottom-right corner.
 * Uses polling for progress updates (compatible with serverless/Vercel).
 */

import React, { useEffect, useState } from 'react';
import { useDataInitialization } from '@/contexts/DataInitializationContext';
import LoadingSpinner from './ui/LoadingSpinner';

// Loading step labels with icons
const LOADING_STEPS: Record<string, { name: string; icon: string }> = {
  cache_user_profile: { name: 'User Profile', icon: '👤' },
  cache_projects: { name: 'Projects', icon: '📁' },
  cache_users: { name: 'Team Members', icon: '👥' },
  cache_tasks: { name: 'Tasks', icon: '✓' },
  cache_customers: { name: 'Customers', icon: '🏢' },
  cache_analytics: { name: 'Analytics', icon: '📊' },
  cache_expenses: { name: 'Expenses', icon: '💰' },
  cache_timesheets: { name: 'Timesheets', icon: '⏱️' },
  cache_teams: { name: 'Teams', icon: '👨‍👩‍👧‍👦' },
  cache_performance: { name: 'Performance', icon: '⚡' },
  cache_resources: { name: 'Resources', icon: '📦' },
  cache_search: { name: 'Search', icon: '🔍' },
  cache_reports: { name: 'Reports', icon: '📋' },
};

interface BackgroundDataLoaderProps {
  /** Callback when initialization is complete */
  onComplete?: () => void;
  /** Position of the loader */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Whether to show detailed stages */
  showStages?: boolean;
  /** Auto-hide after completion (in ms) */
  autoHideDelay?: number;
}

export const BackgroundDataLoader: React.FC<BackgroundDataLoaderProps> = ({
  onComplete,
  position = 'bottom-right',
  showStages = true,
  autoHideDelay = 3000,
}) => {
  const {
    status,
    progress,
    error,
    retryInitialization,
    isInitialized,
  } = useDataInitialization();

  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Don't render if not loading
  if (status === 'idle' || status === 'completed') {
    return null;
  }

  const isLoading = status === 'loading';
  const hasError = status === 'error';

  // Get current stage info
  const getCurrentStageInfo = () => {
    if (progress.currentItem && LOADING_STEPS[progress.currentItem]) {
      return LOADING_STEPS[progress.currentItem];
    }
    return { name: 'Loading...', icon: '📄' };
  };

  const currentStageInfo = getCurrentStageInfo();

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  // Handle completion - auto-hide after delay
  useEffect(() => {
    if (isInitialized && isVisible) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
      setHideTimeout(timeout);
      onComplete?.();
      return () => clearTimeout(timeout);
    }
  }, [isInitialized, isVisible, autoHideDelay, onComplete]);

  // Handle visibility toggle
  const toggleVisibility = () => {
    if (isLoading || hasError) {
      setIsExpanded(!isExpanded);
    } else {
      setIsVisible(false);
    }
  };

  // Handle retry
  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
    await retryInitialization();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed z-50 w-full max-w-sm
        ${getPositionClasses()}
        transition-all duration-300 ease-in-out
      `}
    >
      <div
        className={`
          bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
          overflow-hidden transition-all duration-300
          ${isExpanded ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
        `}
      >
        {/* Header - Clickable to expand/collapse */}
        <button
          onClick={toggleVisibility}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          {/* Status indicator */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${hasError
              ? 'bg-red-100 dark:bg-red-900/30'
              : isLoading
                ? 'bg-blue-100 dark:bg-blue-900/30 animate-pulse'
                : 'bg-green-100 dark:bg-green-900/30'
            }
          `}>
            {hasError ? (
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : isLoading ? (
              <LoadingSpinner size={16} className="text-blue-500" />
            ) : (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {hasError
                ? 'Data loading failed'
                : isLoading
                  ? 'Loading data...'
                  : 'Data loaded'
              }
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading && `${progress.percentage || 0}% complete`}
              {hasError && (error || 'Tap to retry')}
              {isInitialized && 'All data ready'}
            </div>
          </div>

          {/* Current stage indicator */}
          {isLoading && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentStageInfo.icon}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300 max-w-[100px] truncate">
                {currentStageInfo.name}
              </span>
            </div>
          )}

          {/* Expand/collapse icon */}
          <svg
            className={`
              w-5 h-5 text-gray-400 transition-transform duration-200
              ${isExpanded ? 'rotate-180' : ''}
            `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded content */}
        {(isExpanded || isInitialized) && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Progress bar */}
            <div className="px-4 py-3">
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`
                    h-full rounded-full transition-all duration-300
                    ${hasError
                      ? 'bg-red-500'
                      : isLoading
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-green-500'
                    }
                  `}
                  style={{ width: `${progress.percentage || 0}%` }}
                />
              </div>
            </div>

            {/* Error message */}
            {hasError && (
              <div className="px-4 pb-3">
                <div className="text-xs text-red-600 dark:text-red-400 mb-2">
                  {error || 'Failed to load some data'}
                </div>
                <button
                  onClick={handleRetry}
                  className="text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading stages */}
            {isLoading && showStages && (
              <div className="px-4 py-2 space-y-1 max-h-48 overflow-y-auto">
                {Object.entries(LOADING_STEPS).map(([key, info]) => {
                  const isCurrent = progress.currentItem === key;
                  const isLoaded = (progress.loaded || 0) > 0;

                  return (
                    <div
                      key={key}
                      className={`
                        flex items-center gap-2 text-xs py-1 px-2 rounded
                        ${isCurrent
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400'
                        }
                      `}
                    >
                      <span className="w-4">{info.icon}</span>
                      <span className="flex-1 truncate">{info.name}</span>
                      <span className={`
                        ${isCurrent
                          ? 'text-blue-500'
                          : isLoaded
                            ? 'text-green-500'
                            : 'text-gray-400'
                        }
                      `}>
                        {isCurrent ? '⏳' : isLoaded ? '✓' : '○'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Success message */}
            {isInitialized && !hasError && (
              <div className="px-4 py-3 text-xs text-green-600 dark:text-green-400">
                ✓ All data loaded successfully
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundDataLoader;
