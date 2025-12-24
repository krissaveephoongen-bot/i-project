/**
 * Advanced Fetch Hook with Error Handling, Loading States, and Retry Logic
 * Provides comprehensive data fetching with timeout, retries, and error recovery
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchWithErrorHandling, parseJsonResponse, FetchOptions } from '@/lib/fetch-wrapper';
import { parseApiError, AppError, ApiError } from '@/lib/error-handler';
import { useApiError } from './use-api-error';

interface UseFetchState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  retrying: boolean;
}

interface UseFetchOptions extends FetchOptions {
  skip?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook for fetching data with error handling
 */
export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
) {
  const {
    skip = false,
    onSuccess,
    onError: onErrorCallback,
    timeout = 30000,
    retries = 3,
    ...fetchOptions
  } = options;

  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    error: null,
    loading: true,
    retrying: false,
  });

  const { handleError } = useApiError();
  const isMountedRef = useRef(true);

  // Fetch function
  const fetchData = useCallback(async () => {
    if (!url || skip) {
      setState({ data: null, error: null, loading: false, retrying: false });
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, retrying: false }));

      const response = await fetchWithErrorHandling(url, {
        timeout,
        retries,
        ...fetchOptions,
      });

      const data = await parseJsonResponse(response);

      if (isMountedRef.current) {
        setState({ data: data as T, error: null, loading: false, retrying: false });
        onSuccess?.(data);
      }
    } catch (error) {
      const apiError = parseApiError(error);
      handleError(error, `fetch: ${url}`);

      if (isMountedRef.current) {
        setState({
          data: null,
          error: apiError,
          loading: false,
          retrying: false,
        });
        onErrorCallback?.(apiError);
      }
    }
  }, [url, skip, timeout, retries, fetchOptions, onSuccess, onErrorCallback, handleError]);

  // Retry function
  const retry = useCallback(async () => {
    setState((prev) => ({ ...prev, retrying: true }));
    await fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [url, skip]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    retry,
  };
}

/**
 * Hook for posting/mutating data with error handling
 */
export function useMutate<T = any, R = any>(
  url: string,
  options: UseFetchOptions = {}
) {
  const { onSuccess, onError: onErrorCallback, timeout = 30000, ...fetchOptions } = options;
  const [state, setState] = useState<UseFetchState<R>>({
    data: null,
    error: null,
    loading: false,
    retrying: false,
  });

  const { handleError } = useApiError();
  const isMountedRef = useRef(true);

  // Mutate function
  const mutate = useCallback(
    async (payload: T, mutateOptions: FetchOptions = {}) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));

        const response = await fetchWithErrorHandling(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
          body: JSON.stringify(payload),
          timeout,
          ...mutateOptions,
        });

        const data = await parseJsonResponse(response);

        if (isMountedRef.current) {
          setState({ data: data as R, error: null, loading: false, retrying: false });
          onSuccess?.(data);
        }

        return data as R;
      } catch (error) {
        const apiError = parseApiError(error);
        handleError(error, `mutate: ${url}`);

        if (isMountedRef.current) {
          setState({
            data: null,
            error: apiError,
            loading: false,
            retrying: false,
          });
          onErrorCallback?.(apiError);
        }

        throw apiError;
      }
    },
    [url, timeout, fetchOptions.headers, fetchOptions, onSuccess, onErrorCallback, handleError]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    mutate,
  };
}

/**
 * Hook for paginated fetching
 */
export function usePaginatedFetch<T = any>(
  baseUrl: string,
  pageSize: number = 10,
  options: UseFetchOptions = {}
) {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const url =
    page === 1
      ? `${baseUrl}?limit=${pageSize}`
      : `${baseUrl}?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

  const { data, error, loading, retry } = useFetch<{ data: T[]; total: number }>(
    url,
    options
  );

  // Update all data when new page loads
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        setAllData((prev) => [...prev, ...data.data]);
      }
      setHasMore((page - 1) * pageSize + data.data.length < data.total);
    }
  }, [data, page, pageSize]);

  const nextPage = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  return {
    data: allData,
    error,
    loading,
    hasMore,
    page,
    nextPage,
    reset,
    retry,
  };
}
