"use client";

import { useEffect, useRef, useState } from "react";

export interface UseFetchOptions extends RequestInit {
  timeout?: number; // milliseconds
}

export interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for fetching data with proper AbortController cleanup
 * Prevents race conditions and memory leaks
 *
 * @param url - URL to fetch from
 * @param options - Fetch options (method, headers, etc.)
 * @param dependencies - useEffect dependencies (trigger refetch when these change)
 *
 * @example
 * const { data, loading, error } = useFetchWithAbort(
 *   `/api/tasks/${taskId}`,
 *   { method: 'GET' },
 *   [taskId]
 * );
 */
export function useFetchWithAbort<T = any>(
  url: string,
  options?: UseFetchOptions,
  dependencies: any[] = [],
): UseFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create new AbortController for this fetch
    controllerRef.current = new AbortController();
    const controller = controllerRef.current;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Optional timeout
        const timeout = options?.timeout || 30000; // 30 seconds default
        timeoutRef.current = setTimeout(() => {
          controller.abort();
        }, timeout);

        // Fetch with AbortSignal
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        // Clear timeout if fetch completes
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: T = await response.json();
        // Only update state if component is still mounted (not aborted)
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        // Ignore abort errors (component unmounted or dependency changed)
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        // Set error only if component is still mounted
        if (!controller.signal.aborted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          console.error("Fetch error:", error);
        }
      } finally {
        // Clear timeout on cleanup
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setLoading(false);
      }
    })();

    // Cleanup: abort fetch if component unmounts or dependencies change
    return () => {
      controller.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

/**
 * Hook for POST requests with proper cleanup
 */
export function useFetchWithAbortPost<T = any, R = any>(
  url: string,
  options?: UseFetchOptions,
  dependencies: any[] = [],
): UseFetchState<T> & { execute: (body: R) => Promise<T | null> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = async (body: R): Promise<T | null> => {
    controllerRef.current = new AbortController();
    const controller = controllerRef.current;

    try {
      setLoading(true);
      setError(null);

      const timeout = options?.timeout || 30000;
      timeoutRef.current = setTimeout(() => {
        controller.abort();
      }, timeout);

      const response = await fetch(url, {
        method: "POST",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: T = await response.json();
      if (!controller.signal.aborted) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return null;
      }

      if (!controller.signal.aborted) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("POST request error:", error);
      }
      return null;
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      controllerRef.current?.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, execute };
}
