/**
 * Initial Data Loader Component
 * 
 * Full-screen loading overlay shown after login while data is being loaded.
 * Displays progress bar, current loading item, and status messages.
 */

import React, { useEffect, useState } from 'react';
import { useDataInitialization } from '@/contexts/DataInitializationContext';

// Loading step labels
const LOADING_STEPS: Record<string, string> = {
  cache_user_profile: 'Loading your profile...',
  cache_user_permissions: 'Loading permissions...',
  cache_dashboard_stats: 'Loading dashboard statistics...',
  cache_projects: 'Loading projects...',
  cache_users: 'Loading users...',
  cache_teams: 'Loading teams...',
  cache_tasks: 'Loading tasks...',
  cache_customers: 'Loading customers...',
  cache_timesheets: 'Loading timesheets...',
  cache_expenses: 'Loading expenses...',
  cache_notifications: 'Loading notifications...',
  cache_settings: 'Loading settings...',
};

// Status messages
const STATUS_MESSAGES = {
  loading: 'Preparing your workspace...',
  completing: 'Finalizing...',
  error: 'Something went wrong',
  cancelled: 'Loading was cancelled',
};

interface InitialDataLoaderProps {
  /** Callback when initialization is complete */
  onComplete?: () => void;
  /** Custom spinner component */
  spinner?: React.ReactNode;
  /** Whether to show detailed progress */
  showDetails?: boolean;
  /** Brand color for the loader */
  brandColor?: string;
}

export const InitialDataLoader: React.FC<InitialDataLoaderProps> = ({
  onComplete,
  spinner,
  showDetails = true,
  brandColor = '#3B82F6',
}) => {
  const { 
    status, 
    progress, 
    error, 
    retryInitialization, 
    cancelInitialization,
    isInitialized 
  } = useDataInitialization();

  const [fadeIn, setFadeIn] = useState(false);

  // Trigger fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Call onComplete when initialized
  useEffect(() => {
    if (isInitialized && status === 'completed') {
      onComplete?.();
    }
  }, [isInitialized, status, onComplete]);

  // Get current loading message
  const getCurrentMessage = (): string => {
    if (progress.currentItem && LOADING_STEPS[progress.currentItem]) {
      return LOADING_STEPS[progress.currentItem];
    }
    
    if (progress.percentage >= 80) {
      return STATUS_MESSAGES.completing;
    }
    
    return STATUS_MESSAGES.loading;
  };

  // Calculate animation duration based on progress
  const getProgressBarWidth = (): string => {
    return `${progress.percentage}%`;
  };

  // Handle retry
  const handleRetry = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await retryInitialization();
  };

  // Handle cancel
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cancelInitialization();
  };

  // Don't render if not loading
  if (status === 'idle' || status === 'completed') {
    return null;
  }

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
        transition-opacity duration-500 ease-in-out
        ${fadeIn ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 animate-pulse"
          style={{ backgroundColor: brandColor }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 animate-pulse"
          style={{ backgroundColor: brandColor, animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Logo/Brand area */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: brandColor }}
          >
            <svg 
              className="w-8 h-8 text-white animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Loading Your Workspace
          </h1>
          <p className="text-slate-400">
            {getCurrentMessage()}
          </p>
        </div>

        {/* Progress card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          {/* Progress bar */}
          <div className="relative mb-4">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: getProgressBarWidth(),
                  backgroundColor: brandColor,
                }}
              />
            </div>
            
            {/* Percentage badge */}
            <div 
              className="absolute -top-8 right-0 text-sm font-medium text-white"
              style={{ color: brandColor }}
            >
              {progress.percentage}%
            </div>
          </div>

          {/* Progress details */}
          {showDetails && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Progress</span>
                <span>
                  {progress.loaded} of {progress.total} items
                </span>
              </div>
              
              {progress.failed > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Failed</span>
                  <span>{progress.failed} items</span>
                </div>
              )}

              {/* Status text */}
              <div className="pt-2 border-t border-slate-700">
                <p className="text-slate-400 text-xs">
                  {progress.currentItem 
                    ? LOADING_STEPS[progress.currentItem] || 'Loading...'
                    : 'Initializing...'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Cancelled state */}
          {status === 'cancelled' && (
            <div className="mt-4 p-3 bg-slate-500/10 border border-slate-500/20 rounded-lg">
              <p className="text-slate-400 text-sm mb-3">
                Loading was cancelled. Some features may not work correctly.
              </p>
              <button
                onClick={handleRetry}
                className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Continue Anyway
              </button>
            </div>
          )}

          {/* Cancel button during loading */}
          {status === 'loading' && (
            <button
              onClick={handleCancel}
              className="mt-4 w-full px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          This ensures all your data is ready for offline use
        </p>
      </div>
    </div>
  );
};

export default InitialDataLoader;
