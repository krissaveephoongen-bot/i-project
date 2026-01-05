/**
 * Database Service
 * Handles all database health check and status API calls
 */

interface HealthCheckResponse {
  success: boolean;
  message?: string;
  data?: {
    status: 'healthy' | 'unhealthy' | 'error';
    database: string;
    provider: string;
    currentTime?: string;
    postgresVersion?: string;
    connectionStatus?: ConnectionStatus;
    error?: string;
  };
  error?: string;
}

interface SimpleTestResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  error?: string;
}

interface StatusResponse {
  success: boolean;
  status: 'connected' | 'disconnected';
  data?: ConnectionStatus;
  message?: string;
  error?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastConnectionAttempt?: string;
  lastError?: string;
  retryCount?: number;
  lastSuccessfulConnection?: string;
  connectionDuration?: number;
  provider?: string;
}

const API_BASE = '/api';
const TIMEOUT = 10000; // 10 seconds

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get full database health check
 */
export async function getHealthCheck(): Promise<HealthCheckResponse> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/health/db`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get simple connection test
 */
export async function testSimpleConnection(): Promise<SimpleTestResponse> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/health/db/simple`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get connection status
 */
export async function getConnectionStatus(): Promise<StatusResponse> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/health/db/status`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      status: 'disconnected',
      message: 'Failed to get connection status',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get formatted status message in Thai
 */
export function getStatusMessage(
  connected: boolean,
  lastError?: string
): {
  message: string;
  color: 'success' | 'warning' | 'error';
} {
  if (connected) {
    return {
      message: 'เชื่อมต่อแล้ว',
      color: 'success',
    };
  } else if (lastError) {
    return {
      message: `ข้อผิดพลาด: ${lastError}`,
      color: 'error',
    };
  } else {
    return {
      message: 'ไม่เชื่อมต่อ',
      color: 'warning',
    };
  }
}

/**
 * Format date in Thai locale
 */
export function formatDateThai(dateString?: string): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '-';
  }
}

export const databaseService = {
  getHealthCheck,
  testSimpleConnection,
  getConnectionStatus,
  getStatusMessage,
  formatDateThai,
};

export default databaseService;
