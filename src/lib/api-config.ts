/**
 * API Configuration - Centralized API settings
 */

declare global {
  interface Window {
    __API_URL__?: string;
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      REACT_APP_API_URL?: string;
      API_URL?: string;
    }
  }
}

// Check if running in development mode
const isDevelopment = 
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') || 
  (typeof window !== 'undefined' && 
   (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'));

// Get API base URL from environment or default
export const getApiBaseUrl = (): string => {
  // Try environment variables first
  const envUrl = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
    (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) ||
    (typeof window !== 'undefined' && window.__API_URL__);

  if (envUrl) return envUrl;

  // Default URLs based on environment
  if (isDevelopment) {
    return 'http://localhost:5000/api';
  }
  
  // In production, default to ticket-apw-backend on Vercel
  return 'https://ticket-apw-backend.vercel.app/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_TIMEOUT = 10000; // 10 seconds
