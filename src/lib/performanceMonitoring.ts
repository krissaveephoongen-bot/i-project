import { useEffect, useRef } from 'react';

/**
 * Performance monitoring and logging utilities
 * 
 * Helps identify slow operations and bottlenecks
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  severity: 'info' | 'warning' | 'error';
}

const metrics: PerformanceMetric[] = [];

// Thresholds for different operation types (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  apiCall: 2000, // API calls should complete < 2 seconds
  pageLoad: 3000, // Full page load < 3 seconds
  componentRender: 1000, // Component render < 1 second
  interaction: 100, // User interaction response < 100ms
  animation: 60, // 60fps = 16.67ms per frame
} as const;

/**
 * Log a performance metric
 * 
 * Usage:
 * ```
 * const start = performance.now();
 * await fetchProjects();
 * logMetric('fetchProjects', performance.now() - start);
 * ```
 */
export const logMetric = (name: string, duration: number) => {
  let severity: 'info' | 'warning' | 'error' = 'info';

  // Determine severity based on operation type
  if (name.includes('api') && duration > PERFORMANCE_THRESHOLDS.apiCall) {
    severity = 'warning';
  } else if (name.includes('load') && duration > PERFORMANCE_THRESHOLDS.pageLoad) {
    severity = 'warning';
  } else if (name.includes('render') && duration > PERFORMANCE_THRESHOLDS.componentRender) {
    severity = 'warning';
  }

  const metric: PerformanceMetric = {
    name,
    duration,
    timestamp: Date.now(),
    severity,
  };

  metrics.push(metric);

  // Log to console
  const emoji = severity === 'warning' ? '⚠️' : severity === 'error' ? '❌' : 'ℹ️';
  console.log(`${emoji} ${name}: ${duration.toFixed(2)}ms`);

  // Send to monitoring service if available
  if (severity !== 'info' && typeof window !== 'undefined' && (window as any).sendMetric) {
    (window as any).sendMetric(metric);
  }
};

/**
 * Hook to measure page load time
 * 
 * Usage:
 * ```
 * export const Dashboard = () => {
 *   usePageLoadMetrics('Dashboard');
 *   return <div>...</div>;
 * };
 * ```
 */
export const usePageLoadMetrics = (pageName: string) => {
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    return () => {
      const duration = performance.now() - startTimeRef.current;
      logMetric(`pageLoad:${pageName}`, duration);

      // Warn if page load is slow
      if (duration > PERFORMANCE_THRESHOLDS.pageLoad) {
        console.warn(`Page ${pageName} took ${duration.toFixed(2)}ms to load`);
      }
    };
  }, [pageName]);
};

/**
 * Hook to measure component render time
 * 
 * Usage:
 * ```
 * const MyComponent = () => {
 *   useComponentRenderMetrics('MyComponent');
 *   return <div>...</div>;
 * };
 * ```
 */
export const useComponentRenderMetrics = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    // Use requestIdleCallback if available for non-blocking measurement
    const idleCallback =
      (window as any).requestIdleCallback ||
      ((cb: FrameRequestCallback) => setTimeout(cb, 0));

    idleCallback(() => {
      const duration = performance.now() - startTime;
      logMetric(`componentRender:${componentName}`, duration);
    });
  }, [componentName]);
};

/**
 * Measure async operation time
 * 
 * Usage:
 * ```
 * await measureAsync('fetchProjects', async () => {
 *   return await fetchProjects();
 * });
 * ```
 */
export const measureAsync = async <T,>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await operation();
    logMetric(operationName, performance.now() - start);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Measure synchronous operation time
 * 
 * Usage:
 * ```
 * const result = measureSync('processData', () => {
 *   return expensiveDataProcessing(data);
 * });
 * ```
 */
export const measureSync = <T,>(
  operationName: string,
  operation: () => T
): T => {
  const start = performance.now();
  const result = operation();
  logMetric(operationName, performance.now() - start);
  return result;
};

/**
 * Get all recorded metrics
 */
export const getMetrics = () => metrics;

/**
 * Clear recorded metrics
 */
export const clearMetrics = () => {
  metrics.length = 0;
};

/**
 * Get metrics summary
 */
export const getMetricsSummary = () => {
  const summary = {
    total: metrics.length,
    avgDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
    slowest: [...metrics].sort((a, b) => b.duration - a.duration).slice(0, 5),
    warnings: metrics.filter((m) => m.severity !== 'info'),
  };

  return summary;
};

/**
 * Web Vitals monitoring
 * Tracks Cumulative Layout Shift (CLS), Largest Contentful Paint (LCP), etc.
 */
export const initWebVitalsMonitoring = () => {
  if (!('PerformanceObserver' in window)) return;

  try {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const duration = lastEntry.renderTime || lastEntry.loadTime;
      if (duration !== undefined && duration !== null) {
        logMetric('webVital:LCP', duration);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).hadRecentInput) continue;
        clsValue += (entry as any).value;
      }
      logMetric('webVital:CLS', clsValue * 1000); // Convert to milliseconds for logging
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // First Input Delay (FID) / Interaction to Next Paint (INP)
    const fdiObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const duration = (entry as any).processingDuration;
        if (duration !== undefined && duration !== null) {
          logMetric('webVital:FID', duration);
        }
      }
    });
    fdiObserver.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    console.error('Failed to initialize Web Vitals monitoring', error);
  }
};

/**
 * Log Core Web Vitals summary to console
 */
export const logWebVitalsSummary = () => {
  if (typeof window === 'undefined') return;

  try {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    console.table({
      'Page Load Time': `${pageLoadTime}ms`,
      'Connect Time': `${connectTime}ms`,
      'Render Time': `${renderTime}ms`,
      'DOM Content Loaded': `${perfData.domContentLoadedEventEnd - perfData.navigationStart}ms`,
    });
  } catch (error) {
    console.error('Failed to log Web Vitals summary', error);
  }
};

/**
 * Request/Response interceptor for API monitoring
 */
export const createPerformanceInterceptor = () => {
  const onRequest = (config: any) => {
    config.metadata = { startTime: performance.now() };
    return config;
  };

  const onResponse = (response: any) => {
    if (response.config.metadata) {
      const duration = performance.now() - response.config.metadata.startTime;
      logMetric(`api:${response.config.method} ${response.config.url}`, duration);
    }
    return response;
  };

  const onError = (error: any) => {
    if (error.config?.metadata) {
      const duration = performance.now() - error.config.metadata.startTime;
      console.error(
        `❌ api:${error.config.method} ${error.config.url} failed after ${duration.toFixed(2)}ms`
      );
    }
    return Promise.reject(error);
  };

  return { onRequest, onResponse, onError };
};

export default {
  logMetric,
  measureAsync,
  measureSync,
  usePageLoadMetrics,
  useComponentRenderMetrics,
  getMetrics,
  getMetricsSummary,
  initWebVitalsMonitoring,
  logWebVitalsSummary,
  createPerformanceInterceptor,
};
