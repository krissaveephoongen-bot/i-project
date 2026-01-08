import React, { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

export interface LoadingStage {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  duration?: number;
}

interface ProgressLoadingProps {
  stages: LoadingStage[];
  progress: number;
  title?: string;
  subtitle?: string;
  showPercentage?: boolean;
  showTimer?: boolean;
  tips?: string[];
  variant?: 'default' | 'minimal' | 'detailed' | 'toast';
  onRetry?: (stageId: string) => void;
  onClose?: () => void;
  showStages?: boolean; // Option for toast variant
}

const STAGE_ICONS: Record<string, string> = {
  USER_PROFILE: '👤',
  PROJECTS: '📁',
  USERS: '👥',
  TASKS: '✓',
  CUSTOMERS: '🏢',
  ANALYTICS: '📊',
  EXPENSES: '💰',
  TIMESHEETS: '⏱️',
  TEAMS: '👨‍👩‍👧‍👦',
  PERFORMANCE: '⚡',
  RESOURCES: '📦',
  SEARCH: '🔍',
  REPORTS: '📋',
  default: '📄',
};

const LOADING_TIPS = [
  'Pro tip: Use keyboard shortcuts to navigate faster',
  'Tip: Press Ctrl+K to open the command palette',
  'Did you know? You can customize your dashboard layout',
  'Tip: Enable notifications to stay updated on project changes',
  'Pro tip: Use bulk actions to save time on repetitive tasks',
];

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  stages,
  progress,
  title = 'Loading Application',
  subtitle = 'Please wait while we prepare your data',
  showPercentage = true,
  showTimer = true,
  tips = LOADING_TIPS,
  variant = 'detailed',
  onRetry,
  onClose,
  showStages = false,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const [animationKey, setAnimationKey] = useState(0);

  // Derive current stage from the stages array
  const currentStageName = useMemo(() => {
    const loadingStage = stages.find(s => s.status === 'loading');
    if (loadingStage) return loadingStage.name;
    const pendingStage = stages.find(s => s.status === 'pending');
    if (pendingStage) return pendingStage.name;
    if (stages.length > 0) return stages[stages.length - 1].name;
    return 'Initializing...';
  }, [stages]);

  // Timer effect
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate tips
  useEffect(() => {
    if (variant !== 'detailed' && variant !== 'toast') return;
    const tipInterval = setInterval(() => {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
      setAnimationKey(prev => prev + 1);
    }, 5000);
    return () => clearInterval(tipInterval);
  }, [tips, variant]);

  // Get status class based on stage status
  const getStatusClass = (status: LoadingStage['status']) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'loading': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  // Get stage icon
  const getStageIcon = (stage: LoadingStage) => {
    return STAGE_ICONS[stage.id] || STAGE_ICONS.default;
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (variant === 'toast') {
    return (
      <div className="fixed bottom-4 right-4 w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-1">
            <LoadingSpinner size={20} className="text-blue-500" />
          </div>
          <div className="flex-1 ml-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
              {onClose && (
                 <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path></svg>
                 </button>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentStageName}</p>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-blue-500 animate-pulse transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
             <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{progress}%</span>
              {showTimer && <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(elapsedTime)}</span>}
            </div>
            {showStages && (
              <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2 space-y-1">
                {stages.map(stage => (
                  <div key={stage.id} className="flex items-center text-xs">
                     <span className={`mr-2 ${getStatusClass(stage.status)}`}>•</span>
                     <span className="flex-1 text-gray-600 dark:text-gray-300">{stage.name}</span>
                     <span className={`font-medium ${getStatusClass(stage.status)}`}>{stage.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentStageName}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 animate-pulse transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'default') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>

          {/* Progress bar */}
          <div className="relative mb-8">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {showPercentage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white drop-shadow-md">{progress}%</span>
              </div>
            )}
          </div>

          {/* Current stage */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <LoadingSpinner size={20} />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {currentStageName}
            </span>
          </div>

          {/* Timer */}
          {showTimer && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Elapsed time: {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed variant (game-style)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        {/* Main progress bar */}
        <div className="relative mb-6">
          <div className="h-4 md:h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 animate-pulse transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm md:text-base font-bold text-white drop-shadow-md">
              {progress}%
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-center gap-4 md:gap-8 mb-6">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {stages.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {stages.filter(s => s.status === 'loading').length}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Loading</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {stages.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Pending</div>
          </div>
          {showTimer && (
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Elapsed</div>
            </div>
          )}
        </div>

        {/* Stage list */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Loading Stages</h3>
          <div className="space-y-2 md:space-y-3">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-lg transition-all duration-300 ${
                  stage.status === 'loading' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {/* Status icon */}
                <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                  stage.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                  stage.status === 'error' ? 'bg-red-100 dark:bg-red-900' :
                  stage.status === 'loading' ? 'bg-blue-100 dark:bg-blue-900 animate-pulse' :
                  'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {stage.status === 'completed' && (
                    <svg className="w-4 h-4 md:w-6 md:h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {stage.status === 'error' && (
                    <svg className="w-4 h-4 md:w-6 md:h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {stage.status === 'loading' && (
                    <LoadingSpinner size={16} className="text-blue-500" />
                  )}
                  {stage.status === 'pending' && (
                    <span className="text-lg md:text-xl">{getStageIcon(stage)}</span>
                  )}
                </div>

                {/* Stage info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm md:text-base font-medium ${
                    stage.status === 'completed' ? 'text-green-700 dark:text-green-400' :
                    stage.status === 'error' ? 'text-red-700 dark:text-red-400' :
                    stage.status === 'loading' ? 'text-blue-700 dark:text-blue-400' :
                    'text-gray-700 dark:text-gray-400'
                  }`}>
                    {stage.name}
                  </div>
                  {stage.description && (
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {stage.description}
                    </div>
                  )}
                </div>

                {/* Status text */}
                <div className={`text-xs md:text-sm font-medium ${getStatusClass(stage.status)}`}>
                  {stage.status === 'completed' && 'Done'}
                  {stage.status === 'error' && (
                    <button
                      onClick={() => onRetry?.(stage.id)}
                      className="underline hover:no-underline"
                    >
                      Retry
                    </button>
                  )}
                  {stage.status === 'loading' && 'Loading...'}
                  {stage.status === 'pending' && 'Waiting'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading tip */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-3 md:p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <span className="text-lg md:text-xl">💡</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Loading Tip</div>
              <div key={animationKey} className="text-xs md:text-sm text-blue-700 dark:text-blue-300 transition-opacity duration-500">
                {currentTip}
              </div>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <div className="text-center mt-6 text-xs md:text-sm text-gray-500 dark:text-gray-400">
          Project Management System
        </div>
      </div>
    </div>
  );
};

export default ProgressLoading;
