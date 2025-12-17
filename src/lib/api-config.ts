/**
 * API Configuration - Centralized API settings
 */

// Get API base URL from environment or default
export const getApiBaseUrl = (): string => {
  // Try environment variables
  const envUrl = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
    (typeof process !== 'undefined' && (process as any).env?.REACT_APP_API_URL) ||
    (typeof window !== 'undefined' && (window as any).__API_URL__) ||
    '';

  if (envUrl) return envUrl;

  // Determine based on environment
  if (typeof window !== 'undefined') {
    // Client-side
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isDev ? 'http://localhost:5000/api' : '/api';
  } else {
    // Server-side
    return process.env.API_URL || 'http://localhost:5000/api';
  }
};

export const API_BASE_URL = getApiBaseUrl();
export const API_TIMEOUT = 10000; // 10 seconds
