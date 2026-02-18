import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

interface UseRedisCacheOptions<T> {
  key: string;
  ttl?: number;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

interface UseRedisCacheResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  invalidate: () => Promise<void>;
  setCache: (data: T) => Promise<void>;
}

export function useRedisCache<T = any>(
  fetcher: () => Promise<T>,
  options: UseRedisCacheOptions<T>
): UseRedisCacheResult<T> {
  const queryClient = useQueryClient();
  const [isSettingCache, setIsSettingCache] = useState(false);

  const {
    key,
    ttl = 300, // 5 minutes default
    staleTime = 60, // 1 minute default
    refetchOnWindowFocus = false,
    refetchOnReconnect = true
  } = options;

  // Query for cached data
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['redis-cache', key],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/redis?key=${encodeURIComponent(key)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch from cache');
        }
        const result = await response.json();
        return result.found ? result.value : null;
      } catch (error) {
        console.error('Cache fetch error:', error);
        return null;
      }
    },
    staleTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    enabled: !!key
  });

  // Invalidate cache
  const invalidate = useCallback(async () => {
    try {
      await fetch(`/api/redis?key=${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      queryClient.invalidateQueries({ queryKey: ['redis-cache', key] });
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }, [key, queryClient]);

  // Set cache data
  const setCache = useCallback(async (data: T) => {
    setIsSettingCache(true);
    try {
      const response = await fetch('/api/redis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value: data,
          ttl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to set cache');
      }

      // Update local state
      queryClient.setQueryData(['redis-cache', key], data);
    } catch (error) {
      console.error('Cache set error:', error);
    } finally {
      setIsSettingCache(false);
    }
  }, [key, ttl, queryClient]);

  return {
    data,
    isLoading: isLoading || isSettingCache,
    error,
    refetch,
    invalidate,
    setCache
  };
}

// Hook for caching API responses
export function useCachedApi<T = any>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  options?: {
    ttl?: number;
    staleTime?: number;
  }
) {
  const queryClient = useQueryClient();
  const [isFetching, setIsFetching] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cached-api', cacheKey],
    queryFn: async () => {
      // Try cache first
      try {
        const cacheResponse = await fetch(`/api/redis?key=${encodeURIComponent(cacheKey)}`);
        if (cacheResponse.ok) {
          const result = await cacheResponse.json();
          if (result.found) {
            return result.value;
          }
        }
      } catch (cacheError) {
        console.log('Cache miss, fetching from API');
      }

      // Fetch from API
      setIsFetching(true);
      try {
        const apiData = await apiCall();
        
        // Cache the result
        try {
          await fetch('/api/redis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: cacheKey,
              value: apiData,
              ttl: options?.ttl || 300
            })
          });
        } catch (cacheError) {
          console.error('Failed to cache API response:', cacheError);
        }
        
        return apiData;
      } finally {
        setIsFetching(false);
      }
    },
    staleTime: options?.staleTime || 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });

  const invalidateCache = useCallback(async () => {
    try {
      await fetch(`/api/redis?key=${encodeURIComponent(cacheKey)}`, {
        method: 'DELETE'
      });
      queryClient.invalidateQueries({ queryKey: ['cached-api', cacheKey] });
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
    }
  }, [cacheKey, queryClient]);

  return {
    data,
    isLoading: isLoading || isFetching,
    error,
    refetch,
    invalidateCache
  };
}

// Hook for rate limiting
export function useRateLimit(
  action: string,
  limit: number = 10,
  window: number = 60
) {
  const [isLimited, setIsLimited] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(limit);

  const checkLimit = useCallback(async () => {
    try {
      const response = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, limit, window })
      });
      
      const result = await response.json();
      setIsLimited(result.limited);
      setRemainingRequests(result.remaining || 0);
      
      return !result.limited;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow request on error
    }
  }, [action, limit, window]);

  return {
    isLimited,
    remainingRequests,
    checkLimit
  };
}
