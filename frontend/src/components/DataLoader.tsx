import React, { useEffect, useState, useCallback } from 'react';
import { ApiError } from '@/lib/error-handler';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';
import ProgressLoading, { LoadingStage } from './ProgressLoading';
import { dataManager, LoadProgress } from '@/services/dataManager';

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
  useProgressLoading?: boolean;
  progress?: LoadProgress;
  onProgressUpdate?: (progress: LoadProgress) => void;
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
  useProgressLoading = false,
  progress,
  onProgressUpdate,
}) => {
  const [localProgress, setLocalProgress] = useState<LoadProgress | null>(null);
  const [stages, setStages] = useState<LoadingStage[]>([]);

  // Set up progress callback when using progress loading
  useEffect(() => {
    if (useProgressLoading && onProgressUpdate) {
      const handleProgress = (p: LoadProgress) => {
        setLocalProgress(p);
        onProgressUpdate(p);
        
        // Convert LoadProgress to LoadingStage array
        const stageList: LoadingStage[] = p.stages.map(stage => ({
          id: stage.id,
          name: stage.name,
          description: stage.description,
          status: stage.status,
        }));
        setStages(stageList);
      };

      dataManager.setProgressCallback(handleProgress);
      
      // Cleanup
      return () => {
        dataManager.setProgressCallback(null);
      };
    }
  }, [useProgressLoading, onProgressUpdate]);

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Progress loading state (game-style)
  if (loading && useProgressLoading) {
    const currentProgress = progress || localProgress;
    const currentStageData = currentProgress?.stages.find(
      s => s.status === 'loading'
    );
    
    return (
      <ProgressLoading
        stages={stages.length > 0 ? stages : [
          { id: 'init', name: 'Initializing', status: 'loading' },
          { id: 'loading', name: 'Loading data...', status: 'pending' },
        ]}
        currentStage={currentProgress?.currentItemName || currentStageData?.name}
        progress={currentProgress?.percentage || 0}
        title="Loading Application"
        subtitle="Please wait while we prepare your data"
        variant="detailed"
        onRetry={(stageId) => {
          // Retry logic can be implemented here
          console.log('Retry stage:', stageId);
        }}
      />
    );
  }

  // Standard loading state
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

// Hook for using progress loading with data manager
export function useProgressLoading(enabled = true) {
  const [progress, setProgress] = useState<LoadProgress | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<ApiError | null>(null);

  const startLoading = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dataManager.initialize((p) => {
        setProgress(p);
      });
      setProgress(result);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    progress,
    startLoading,
    stages: progress?.stages || [],
  };
}

export default DataLoader;
