/**
 * Data Loading System
 * 
 * This module provides a complete data loading flow after login:
 * - Loading spinner with progress tracking
 * - Data caching to localStorage
 * - Data validation
 * - Retry functionality
 * 
 * @module data-loading
 */

// Context and Provider
export { 
  DataInitializationProvider, 
  useDataInitialization,
  DataInitializationContext 
} from './DataInitializationContext';

// Components
export { InitialDataLoader } from './InitialDataLoader';
export { AppInitializer } from './AppInitializer';

// Hooks
export { 
  useDataInitialization as default,
  useCachedData,
  useUserProfile,
  useProjects,
  useUsers 
} from './useDataInitialization';

// Service
export { 
  dataManager, 
  DataManager,
  DATA_CACHE_KEYS,
  DataPriority,
  DATA_LOAD_CONFIG,
  type LoadProgress,
  type LoadResult,
} from '../services/dataManager';
