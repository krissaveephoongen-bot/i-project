/**
 * Safe interval hook with automatic cleanup
 * Prevents memory leaks from orphaned intervals
 */

'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook for setInterval with automatic cleanup
 * 
 * @param callback Function to call on each interval
 * @param delay Interval delay in milliseconds (null to disable)
 * @param dependencies useEffect dependencies
 * 
 * @example
 * useIntervalCleanup(() => {
 *   console.log('Running every second');
 * }, 1000, []);
 */
export function useIntervalCleanup(
  callback: () => void,
  delay: number | null,
  dependencies: any[] = []
): void {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (delay === null || delay === undefined) return;

    // Start interval
    intervalRef.current = setInterval(callback, delay);

    // Cleanup: clear interval on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callback, delay, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook for setTimeout with automatic cleanup
 * 
 * @param callback Function to call after delay
 * @param delay Timeout delay in milliseconds (null to disable)
 * @param dependencies useEffect dependencies
 * 
 * @example
 * useTimeoutCleanup(() => {
 *   console.log('Running after 2 seconds');
 * }, 2000, []);
 */
export function useTimeoutCleanup(
  callback: () => void,
  delay: number | null,
  dependencies: any[] = []
): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (delay === null || delay === undefined) return;

    // Start timeout
    timeoutRef.current = setTimeout(callback, delay);

    // Cleanup: clear timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [callback, delay, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook for managing event listeners with automatic cleanup
 * 
 * @param target Element to attach listener to (window, document, etc.)
 * @param eventName Event name (e.g., 'click', 'scroll')
 * @param handler Event handler function
 * @param dependencies useEffect dependencies
 * 
 * @example
 * useEventListenerCleanup(window, 'resize', () => {
 *   console.log('Window resized');
 * }, []);
 */
export function useEventListenerCleanup(
  target: Window | Document | Element | null,
  eventName: string,
  handler: (event: Event) => void,
  dependencies: any[] = []
): void {
  useEffect(() => {
    if (!target) return;

    // Add listener
    target.addEventListener(eventName, handler);

    // Cleanup: remove listener on unmount or dependency change
    return () => {
      target.removeEventListener(eventName, handler);
    };
  }, [target, eventName, handler, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
}
