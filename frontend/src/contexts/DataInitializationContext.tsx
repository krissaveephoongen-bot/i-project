/**
 * Data Initialization Context
 * 
 * Manages the state of data loading after login.
 * Provides loading progress, error handling, and completion status.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { dataManager, DATA_CACHE_KEYS, LoadProgress } from '@/services/dataManager';

// Types
type InitializationStatus = 'idle' | 'loading' | 'completed' | 'error' | 'cancelled';

interface DataInitializationState {
  status: InitializationStatus;
  progress: LoadProgress;
  error: string | null;
  isDataComplete: boolean;
  lastLoadedAt: number | null;
}

type InitializationAction =
  | { type: 'START_LOADING' }
  | { type: 'UPDATE_PROGRESS'; payload: LoadProgress }
  | { type: 'COMPLETE_LOADING'; payload: { isDataComplete: boolean } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }
  | { type: 'CANCEL_LOADING' };

// Initial state
const initialState: DataInitializationState = {
  status: 'idle',
  progress: {
    total: 0,
    loaded: 0,
    failed: 0,
    percentage: 0,
  },
  error: null,
  isDataComplete: false,
  lastLoadedAt: null,
};

// Reducer
const initializationReducer = (state: DataInitializationState, action: InitializationAction): DataInitializationState => {
  switch (action.type) {
    case 'START_LOADING':
      return {
        ...initialState,
        status: 'loading',
        progress: {
          total: 0,
          loaded: 0,
          failed: 0,
          percentage: 0,
        },
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: action.payload,
      };
    case 'COMPLETE_LOADING':
      return {
        ...state,
        status: 'completed',
        isDataComplete: action.payload.isDataComplete,
        lastLoadedAt: Date.now(),
        progress: {
          ...state.progress,
          percentage: 100,
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };
    case 'RESET':
      return {
        ...initialState,
      };
    case 'CANCEL_LOADING':
      return {
        ...state,
        status: 'cancelled',
      };
    default:
      return state;
  }
};

// Context type
interface DataInitializationContextType {
  status: InitializationStatus;
  progress: LoadProgress;
  error: string | null;
  isDataComplete: boolean;
  lastLoadedAt: number | null;
  startInitialization: () => Promise<void>;
  retryInitialization: () => Promise<void>;
  cancelInitialization: () => void;
  reset: () => void;
  getData: (key: string) => any;
  isInitialized: boolean;
}

const DataInitializationContext = createContext<DataInitializationContextType | undefined>(undefined);

// Provider props
interface DataInitializationProviderProps {
  children: React.ReactNode;
  onInitialized?: () => void;
}

export const DataInitializationProvider: React.FC<DataInitializationProviderProps> = ({ 
  children,
  onInitialized 
}) => {
  const [state, dispatch] = useReducer(initializationReducer, initialState);
  const initializationPromise = useRef<Promise<void> | null>(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Start data initialization
  const startInitialization = useCallback(async () => {
    if (state.status === 'loading') {
      return;
    }

    dispatch({ type: 'START_LOADING' });

    try {
      // Load cached data first for instant display
      dataManager.loadCachedData();

      // Start fresh initialization
      const progress = await dataManager.initialize();

      if (!isMounted.current) {
        return;
      }

      // Update progress
      dispatch({ type: 'UPDATE_PROGRESS', payload: progress });

      // Check if critical data is complete
      const isComplete = dataManager.isDataComplete();

      if (isComplete) {
        dispatch({ type: 'COMPLETE_LOADING', payload: { isDataComplete: true } });
        onInitialized?.();
      } else {
        // Some required data failed to load
        const failedItems = progress.failed > 0;
        if (failedItems) {
          dispatch({ 
            type: 'SET_ERROR', 
            payload: `Failed to load ${progress.failed} data sources. Some features may not work correctly.` 
          });
        } else {
          dispatch({ type: 'COMPLETE_LOADING', payload: { isDataComplete: true } });
          onInitialized?.();
        }
      }
    } catch (error: any) {
      if (!isMounted.current) {
        return;
      }

      console.error('Data initialization failed:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to initialize data. Please try again.' 
      });
    }
  }, [state.status, onInitialized]);

  // Retry initialization after error
  const retryInitialization = useCallback(async () => {
    dispatch({ type: 'RESET' });
    await startInitialization();
  }, [startInitialization]);

  // Cancel ongoing initialization
  const cancelInitialization = useCallback(() => {
    dataManager.abort();
    dispatch({ type: 'CANCEL_LOADING' });
  }, []);

  // Reset initialization state
  const reset = useCallback(() => {
    dataManager.clearCache();
    dispatch({ type: 'RESET' });
  }, []);

  // Get cached data
  const getData = useCallback((key: string) => {
    return dataManager.getData(key);
  }, []);

  // Computed values
  const isInitialized = state.status === 'completed' && state.isDataComplete;

  const value: DataInitializationContextType = {
    status: state.status,
    progress: state.progress,
    error: state.error,
    isDataComplete: state.isDataComplete,
    lastLoadedAt: state.lastLoadedAt,
    startInitialization,
    retryInitialization,
    cancelInitialization,
    reset,
    getData,
    isInitialized,
  };

  return (
    <DataInitializationContext.Provider value={value}>
      {children}
    </DataInitializationContext.Provider>
  );
};

// Custom hook to use data initialization context
export const useDataInitialization = () => {
  const context = useContext(DataInitializationContext);
  if (context === undefined) {
    throw new Error('useDataInitialization must be used within a DataInitializationProvider');
  }
  return context;
};

// Export context for advanced use cases
export { DataInitializationContext };
