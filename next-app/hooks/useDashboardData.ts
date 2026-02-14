/**
 * Safe Dashboard Data Hook
 * Prevents race conditions and memory leaks during data fetching
 */

'use client';

import { useEffect, useRef, useState } from 'react';

export interface DashboardData {
  rows: any[];
  cashflow: any[];
  spiTrend: any[];
  spiSnaps: any[];
  activities: any[];
  execReport: any;
  weeklySummary: any[];
}

export interface UseDashboardDataReturn extends DashboardData {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching dashboard data safely
 * Prevents race conditions when dependencies change
 */
export function useDashboardData(dependencies: any[] = []): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData>({
    rows: [],
    cashflow: [],
    spiTrend: [],
    spiSnaps: [],
    activities: [],
    execReport: null,
    weeklySummary: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const fetchCounterRef = useRef(0);

  const fetchData = async (isRefresh = false) => {
    // Create new AbortController for this fetch
    controllerRef.current = new AbortController();
    const controller = controllerRef.current;
    const fetchId = ++fetchCounterRef.current; // Track fetch order

    try {
      if (!isRefresh) setLoading(true);
      setRefreshing(isRefresh);
      setError(null);

      // Fetch all endpoints in parallel with AbortSignal
      const [pfRes, actRes, erRes, wsRes] = await Promise.all([
        fetch('/api/dashboard/portfolio', {
          cache: 'no-store',
          signal: controller.signal,
        }).catch(() => ({ ok: false })),
        fetch('/api/dashboard/activities', {
          cache: 'no-store',
          signal: controller.signal,
        }).catch(() => ({ ok: false })),
        fetch('/api/projects/executive-report', {
          cache: 'no-store',
          signal: controller.signal,
        }).catch(() => ({ ok: false })),
        fetch('/api/projects/weekly-summary', {
          cache: 'no-store',
          signal: controller.signal,
        }).catch(() => ({ ok: false })),
      ]);

      // Check if this fetch was aborted before processing
      if (controller.signal.aborted || fetchId !== fetchCounterRef.current) {
        return;
      }

      // Parse responses
      const [pfJson, actJson, erJson, wsJson] = await Promise.all([
        pfRes.ok ? (pfRes as Response).json() : { rows: [], cashflow: [], spiTrend: [], spiSnaps: [] },
        actRes.ok ? (actRes as Response).json() : [],
        erRes.ok ? (erRes as Response).json() : null,
        wsRes.ok ? (wsRes as Response).json() : { summary: [] },
      ]);

      // Verify not aborted before updating state
      if (controller.signal.aborted || fetchId !== fetchCounterRef.current) {
        return;
      }

      // Update state with new data
      setData({
        rows: pfJson.rows || [],
        cashflow: pfJson.cashflow || [],
        spiTrend: pfJson.spiTrend || [],
        spiSnaps: pfJson.spiSnaps || [],
        activities: actJson || [],
        execReport: erJson || null,
        weeklySummary: wsJson?.summary || [],
      });
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      // Set error only if not aborted and this is the latest fetch
      if (!controller.signal.aborted && fetchId === fetchCounterRef.current) {
        const errorMsg = err instanceof Error ? err.message : 'Unable to load dashboard data';
        setError(errorMsg);
        console.error('Dashboard fetch error:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchData(false);

    // Cleanup: abort ongoing requests on unmount
    return () => {
      controllerRef.current?.abort();
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...data,
    loading,
    refreshing,
    error,
    refetch: () => fetchData(true),
  };
}
