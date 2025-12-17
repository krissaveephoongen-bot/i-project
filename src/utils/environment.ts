/**
 * Environment utilities for determining client/server context
 */

export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

export const isClient = (): boolean => {
  return !isServer();
};

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || import.meta.env.DEV;
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production' || import.meta.env.PROD;
};
