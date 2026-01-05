import { useState, useEffect, useCallback } from 'react';
import { ApiError, parseApiError } from '@/lib/error-handler';

export interface UseDataFetchState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  retry: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useDataFetch<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  options?: {
    onError?: (error: ApiError) => void;
    onSuccess?: (data: T) => void;
  }
): UseDataFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError);
      options?.onError?.(apiError);
      console.error('useDataFetch error:', apiError);
    } finally {
      setLoading(false);
    }
  }, [fetcher, options]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const retry = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, retry, refetch };
}

export default useDataFetch;
