import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api-client';

interface ConnectionStatus {
  connected: boolean;
  lastConnectionAttempt?: string;
  lastError?: string;
  retryCount?: number;
  lastSuccessfulConnection?: string;
  connectionDuration?: number;
  provider?: string;
}

interface UseDatabaseStatusResult {
  status: ConnectionStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch and track database connection status
 * @param refreshInterval - Interval in milliseconds to refresh status (default: 30000ms)
 * @returns Connection status, loading state, error, and refetch function
 */
export const useDatabaseStatus = (refreshInterval: number = 30000): UseDatabaseStatusResult => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest<{ success: boolean; data: ConnectionStatus; message?: string }>('/api/health/db/status');

      if (data.success) {
        setStatus(data.data);
        setError(null);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาด');
        setStatus(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์';
      setError(errorMessage);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Set up refresh interval
    const interval = setInterval(fetchStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchStatus, refreshInterval]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
};

export default useDatabaseStatus;
