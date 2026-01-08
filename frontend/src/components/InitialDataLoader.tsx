/**
 * Initial Data Loader Component
 * 
 * Loading overlay shown while data is being loaded.
 * Can work in two modes:
 * - Blocking mode: Full-screen overlay that prevents interaction until loading is complete
 * - Background mode: Non-blocking toast notification that allows interaction
 * 
 * Uses game-style ProgressLoading component for detailed progress display.
 */

import React, { useEffect, useState } from 'react';
import { useDataInitialization } from '@/contexts/DataInitializationContext';
import ProgressLoading, { LoadingStage } from './ProgressLoading';
import BackgroundDataLoader from './BackgroundDataLoader';

// Loading step labels with icons
const LOADING_STEPS: Record<string, { name: string; description?: string }> = {
  cache_user_profile: { name: 'User Profile', description: 'Loading your account information' },
  cache_projects: { name: 'Projects', description: 'Loading your projects and tasks' },
  cache_users: { name: 'Team Members', description: 'Loading user data' },
  cache_tasks: { name: 'Tasks', description: 'Loading task assignments' },
  cache_customers: { name: 'Customers', description: 'Loading customer information' },
  cache_analytics: { name: 'Analytics', description: 'Loading dashboard statistics' },
  cache_expenses: { name: 'Expenses', description: 'Loading expense records' },
  cache_timesheets: { name: 'Timesheets', description: 'Loading time tracking data' },
  cache_teams: { name: 'Teams', description: 'Loading team information' },
  cache_performance: { name: 'Performance', description: 'Loading performance metrics' },
  cache_resources: { name: 'Resources', description: 'Loading resource allocation' },
  cache_search: { name: 'Search', description: 'Loading search index' },
  cache_reports: { name: 'Reports', description: 'Loading report data' },
};

interface InitialDataLoaderProps {
  /** Callback when initialization is complete */
  onComplete?: () => void;
  /** Custom spinner component (deprecated, using ProgressLoading) */
  spinner?: React.ReactNode;
  /** Whether to show detailed progress */
  showDetails?: boolean;
  /** Brand color for the loader */
  brandColor?: string;
  /** Whether to use blocking mode (full-screen) or background mode (non-blocking) */
  blockingMode?: boolean;
  /** Children to render when in non-blocking mode */
  children?: React.ReactNode;
}

export const InitialDataLoader: React.FC<InitialDataLoaderProps> = ({
  onComplete,
  showDetails = true,
  brandColor = '#3B82F6',
  blockingMode = false,
  children,
}) => {
  const { 
    status, 
    progress, 
    error, 
    retryInitialization, 
    isInitialized,
    backgroundMode,
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

  // Convert progress to stages for ProgressLoading
  const getStages = (): LoadingStage[] => {
    const stages: LoadingStage[] = [];
    
    // Create stages based on LOADING_STEPS
    Object.entries(LOADING_STEPS).forEach(([key, info]) => {
      const index = stages.length;
      let stageStatus: LoadingStage['status'] = 'pending';
      
      if (progress.currentItem === key) {
        stageStatus = 'loading';
      } else if (progress.loaded > index) {
        stageStatus = 'completed';
      } else if (progress.failed > 0 && progress.loaded + progress.failed >= index + 1) {
        stageStatus = 'error';
      }
      
      stages.push({
        id: key,
        name: info.name,
        description: info.description,
        status: stageStatus,
      });
    });
    
    return stages;
  };

  // Get current loading stage name
  const getCurrentStageName = (): string | undefined => {
    if (progress.currentItem && LOADING_STEPS[progress.currentItem]) {
      return LOADING_STEPS[progress.currentItem].name;
    }
    return undefined;
  };

  // Handle retry
  const handleRetry = async (stageId?: string) => {
    if (stageId) {
      // Retry specific stage
      await retryInitialization();
    } else {
      await retryInitialization();
    }
  };

  // Don't render if not loading
  if (status === 'idle' || status === 'completed') {
    return null;
  }

  const stages = getStages();
  const currentStageName = getCurrentStageName();
  const isLoading = status === 'loading';
  const hasError = status === 'error';

  // If in non-blocking mode and children are provided, render children with background loader
  if (!blockingMode && children) {
    return (
      <>
        {children}
        <BackgroundDataLoader
          onComplete={onComplete}
          position="bottom-right"
          showStages={true}
          autoHideDelay={3000}
        />
      </>
    );
  }

  // If background mode is enabled (non-blocking), use BackgroundDataLoader
  if (backgroundMode && !blockingMode) {
    return <BackgroundDataLoader onComplete={onComplete} />;
  }

  // Blocking mode: Full-screen overlay
  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
        transition-opacity duration-500 ease-in-out
        ${fadeIn ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ minHeight: '100vh' }}
    >
      {/* Game-style Progress Loading */}
      <ProgressLoading
        stages={stages}
        progress={progress.percentage}
        title={hasError ? 'Loading Failed' : 'Loading Your Workspace'}
        subtitle={hasError 
          ? error || 'Failed to load data. Please try again.'
          : 'Please wait while we prepare your data'
        }
        variant="detailed"
        showTimer={true}
        onRetry={handleRetry}
        tips={hasError 
          ? ['Tap "Retry" to try loading again', 'Check your connection and try again']
          : undefined
        }
      />
    </div>
  );
};

export default InitialDataLoader;
