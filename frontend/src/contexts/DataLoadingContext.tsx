/**
 * Data Loading Context
 * Manages global data loading state after login
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import DataManager from '../services/dataManager';

interface DataLoadProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
  currentItem?: string;
}

interface DataLoadingContextType {
  isLoading: boolean;
  isReady: boolean;
  progress: DataLoadProgress;
  error: string | null;
  startLoading: () => Promise<void>;
  retry: () => Promise<void>;
  skipAndContinue: () => void;
  refreshData: () => Promise<void>;
}

const DataLoadingContext = createContext<DataLoadingContextType | null>(null);

export const useDataLoading = (): DataLoadingContextType => {
  const context = useContext(DataLoadingContext);
  if (!context) {
    throw new Error('useDataLoading must be used within DataLoadingProvider');
  }
  return context;
};

interface DataLoadingProviderProps {
  children: React.ReactNode;
}

export const DataLoadingProvider: React.FC<DataLoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState<DataLoadProgress>({
    total: 0,
    loaded: 0,
    failed: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Check if data was already loaded in this session
  useEffect(() => {
    const checkExistingData = async () => {
      const hasData = await DataManager.validateAllData();
      if (hasData) {
        setIsReady(true);
      }
    };
    checkExistingData();
  }, []);

  const startLoading = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await DataManager.loadAllWithProgress((update) => {
        setProgress({
          total: update.total,
          loaded: update.loaded,
          failed: update.failed,
          percentage: Math.round(update.percentage),
          currentItem: update.currentItem,
        });
      });

      // Validate all data after loading
      const isValid = await DataManager.validateAllData();
      
      if (isValid) {
        setIsReady(true);
      } else {
        setError('Some data failed to validate. Please try again or continue with limited functionality.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(async () => {
    await startLoading();
  }, [startLoading]);

  const skipAndContinue = useCallback(() => {
    // Mark as ready even with partial data
    setIsReady(true);
    setError(null);
  }, []);

  const refreshData = useCallback(async () => {
    setIsReady(false);
    await startLoading();
  }, [startLoading]);

  return (
    <DataLoadingContext.Provider
      value={{
        isLoading,
        isReady,
        progress,
        error,
        startLoading,
        retry,
        skipAndContinue,
        refreshData,
      }}
    >
      {children}
    </DataLoadingContext.Provider>
  );
};

export default DataLoadingContext;
