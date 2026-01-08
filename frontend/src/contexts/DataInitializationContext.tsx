import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Types
type InitializationStatus = 'idle' | 'loading' | 'completed' | 'error' | 'cancelled';

interface User {
  role?: string;
}

interface DataInitializationState {
  status: InitializationStatus;
  progress: {
    total: number;
    loaded: number;
    failed: number;
    percentage: number;
    currentItem?: string;
    currentItemName?: string;
  };
  error: string | null;
  isDataComplete: boolean;
  lastLoadedAt: number | null;
  backgroundMode: boolean;
}

type InitializationAction =
  | { type: 'START_LOADING'; payload?: { backgroundMode?: boolean } }
  | { type: 'UPDATE_PROGRESS'; payload: DataInitializationState['progress'] }
  | { type: 'COMPLETE_LOADING'; payload: { isDataComplete: boolean } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }
  | { type: 'CANCEL_LOADING' }
  | { type: 'SET_BACKGROUND_MODE'; payload: boolean };

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
  backgroundMode: false,
};

// Reducer
const initializationReducer = (state: DataInitializationState, action: InitializationAction): DataInitializationState => {
  switch (action.type) {
    case 'START_LOADING':
      return {
        ...initialState,
        status: 'loading',
        backgroundMode: action.payload?.backgroundMode ?? state.backgroundMode,
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
        backgroundMode: state.backgroundMode,
      };
    case 'CANCEL_LOADING':
      return {
        ...state,
        status: 'cancelled',
      };
    case 'SET_BACKGROUND_MODE':
      return {
        ...state,
        backgroundMode: action.payload,
      };
    default:
      return state;
  }
};

// Context type
interface DataInitializationContextType {
  status: InitializationStatus;
  progress: DataInitializationState['progress'];
  error: string | null;
  isDataComplete: boolean;
  lastLoadedAt: number | null;
  backgroundMode: boolean;
  startInitialization: (options?: { backgroundMode?: boolean }) => Promise<void>;
  retryInitialization: () => Promise<void>;
  cancelInitialization: () => void;
  reset: () => void;
  getData: (key: string) => any;
  isInitialized: boolean;
  setBackgroundMode: (enabled: boolean) => void;
}

const DataInitializationContext = createContext<DataInitializationContextType | undefined>(undefined);

// Provider props
interface DataInitializationProviderProps {
  children: React.ReactNode;
  onInitialized?: () => void;
  /** Default mode for data loading */
  defaultBackgroundMode?: boolean;
}

export const DataInitializationProvider: React.FC<DataInitializationProviderProps> = ({ 
  children,
  onInitialized,
  defaultBackgroundMode = true,
}) => {
  const [state, dispatch] = useReducer(initializationReducer, {
    ...initialState,
    backgroundMode: defaultBackgroundMode,
  });
  const queryClient = useQueryClient();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Set background mode
  const setBackgroundMode = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_BACKGROUND_MODE', payload: enabled });
  }, []);

  // Start data initialization using React Query
  const startInitialization = useCallback(async (options?: { backgroundMode?: boolean }) => {
    if (state.status === 'loading') {
      return;
    }

    const backgroundMode = options?.backgroundMode ?? state.backgroundMode;
    dispatch({ type: 'START_LOADING', payload: { backgroundMode } });

    try {
      // Use React Query to fetch data in parallel with proper deduplication
      const promises: Promise<unknown>[] = [];
      
      // Essential data
      promises.push(
        queryClient.prefetchQuery({
          queryKey: ['auth', 'me'],
          queryFn: () => fetch('/api/auth/me').then(res => res.json()),
          staleTime: 5 * 60 * 1000, // 5 minutes
        })
      );

      // Main data
      promises.push(
        queryClient.prefetchQuery({
          queryKey: ['projects'],
          queryFn: () => fetch('/api/projects').then(res => res.json()),
          staleTime: 5 * 60 * 1000,
        })
      );

      // Admin/PM data
      const userQuery = queryClient.getQueryData(['auth', 'me']) as User | undefined;
      const isAdmin = userQuery?.role === 'admin' || userQuery?.role === 'ADMIN';
      const isPM = userQuery?.role === 'PROJECT_MANAGER' || userQuery?.role === 'project_manager';

      if (isAdmin || isPM) {
        promises.push(
          queryClient.prefetchQuery({
            queryKey: ['users'],
            queryFn: () => fetch('/api/users').then((res: any) => res.json()),
            staleTime: 5 * 60 * 1000,
          })
        );

        promises.push(
          queryClient.prefetchQuery({
            queryKey: ['tasks'],
            queryFn: () => fetch('/api/tasks').then((res: any) => res.json()),
            staleTime: 5 * 60 * 1000,
          })
        );
      }

      // Wait for all critical data with timeout
      // In background mode, use a longer timeout since we don't block the UI
      const timeoutDuration = backgroundMode ? 30000 : 10000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout')), timeoutDuration);
      });

      const results = await Promise.race([
        Promise.allSettled(promises),
        timeoutPromise
      ]);

      // Update progress
      const totalPromises = promises.length;
      const completedPromises = results.filter(r => r.status === 'fulfilled').length;
      
      dispatch({ 
        type: 'UPDATE_PROGRESS', 
        payload: {
          total: totalPromises,
          loaded: completedPromises,
          failed: 0,
          percentage: Math.round((completedPromises / totalPromises) * 100),
        }
      });

      // Complete initialization
      dispatch({ 
        type: 'COMPLETE_LOADING', 
        payload: { isDataComplete: true } 
      });
      
      onInitialized?.();
    } catch (error: any) {
      console.error('Data initialization failed:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to initialize data. Please try again.' 
      });
    }
  }, [state.status, state.backgroundMode, onInitialized, queryClient]);

  // Retry initialization
  const retryInitialization = useCallback(async () => {
    dispatch({ type: 'RESET' });
    await queryClient.invalidateQueries();
    await startInitialization();
  }, [startInitialization, queryClient]);

  // Cancel initialization
  const cancelInitialization = useCallback(() => {
    // Cancel any ongoing queries
    dispatch({ type: 'CANCEL_LOADING' });
  }, []);

  // Reset
  const reset = useCallback(() => {
    queryClient.clear();
    dispatch({ type: 'RESET' });
  }, [queryClient]);

  // Get cached data
  const getData = useCallback((key: string) => {
    return queryClient.getQueryData([key]);
  }, [queryClient]);

  // Computed values
  const isInitialized = state.status === 'completed' && state.isDataComplete;

  const value: DataInitializationContextType = {
    status: state.status,
    progress: state.progress,
    error: state.error,
    isDataComplete: state.isDataComplete,
    lastLoadedAt: state.lastLoadedAt,
    backgroundMode: state.backgroundMode,
    startInitialization,
    retryInitialization,
    cancelInitialization,
    reset,
    getData,
    isInitialized,
    setBackgroundMode,
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
