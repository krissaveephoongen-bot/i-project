// Performance monitoring and optimization utilities
import { performance } from 'perf_hooks';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      navigation: {},
      resources: {},
      vitals: {},
      custom: {}
    };
    this.observers = new Map();
    this.isMonitoring = process.env.NODE_ENV === 'production';
  }

  // Start monitoring
  startMonitoring() {
    if (!this.isMonitoring) return;

    // Monitor page load performance
    this.observePageLoad();
    
    // Monitor navigation timing
    this.observeNavigation();
    
    // Monitor resource loading
    this.observeResources();
    
    // Monitor Core Web Vitals
    this.observeVitals();
    
    // Monitor custom metrics
    this.observeCustomMetrics();
  }

  // Observe page load performance
  observePageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.pageLoad = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint(),
          largestContentfulPaint: this.getLargestContentfulPaint()
        };
      }
    });
  }

  // Observe navigation timing
  observeNavigation() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.metrics.navigation = {
            type: entry.type,
            startTime: entry.startTime,
            duration: entry.duration,
            redirectCount: entry.redirectCount,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            serverTiming: entry.serverTiming
          };
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.set('navigation', observer);
  }

  // Observe resource loading
  observeResources() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const resources = list.getEntriesByType('resource');
      this.metrics.resources = {
        total: resources.length,
        totalSize: resources.reduce((sum, resource) => sum + resource.transferSize, 0),
        slowResources: resources.filter(r => r.duration > 1000).length,
        resourcesByType: this.groupResourcesByType(resources)
      };
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resources', observer);
  }

  // Observe Core Web Vitals
  observeVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.vitals.lcp = {
        value: lastEntry.startTime,
        element: lastEntry.element,
        url: lastEntry.url
      };
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      this.metrics.vitals.fid = {
        value: firstEntry.processingStart - firstEntry.startTime,
        inputDelay: firstEntry.processingStart - firstEntry.startTime
      };
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.metrics.vitals.cls = { value: clsValue };
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Observe custom metrics
  observeCustomMetrics() {
    if (typeof window === 'undefined') return;

    // Monitor API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const end = performance.now();
      
      // Log slow API calls
      if (end - start > 2000) {
        console.warn(`Slow API call: ${args[0]} took ${end - start}ms`);
      }
      
      return response;
    };

    // Monitor React render performance
    if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (rendererID, appID) => {
        const renderStart = performance.now();
        setTimeout(() => {
          const renderEnd = performance.now();
          this.metrics.custom.reactRender = {
            duration: renderEnd - renderStart,
            timestamp: renderEnd
          };
        }, 0);
      };
    }
  }

  // Helper methods
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    return paintEntries.length > 0 ? paintEntries[0].startTime : 0;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    return paintEntries.length > 1 ? paintEntries[1].startTime : 0;
  }

  getLargestContentfulPaint() {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
  }

  groupResourcesByType(resources) {
    return resources.reduce((acc, resource) => {
      const type = resource.name.split('.').pop() || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  // Get current metrics
  getMetrics() {
    return this.metrics;
  }

  // Generate performance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      metrics: this.metrics,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  // Generate optimization recommendations
  generateRecommendations() {
    const recommendations = [];

    // Page load recommendations
    if (this.metrics.pageLoad.loadComplete > 3000) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Page load time is slow. Consider optimizing images, reducing JavaScript bundle size, or implementing lazy loading.',
        value: this.metrics.pageLoad.loadComplete
      });
    }

    // Resource recommendations
    if (this.metrics.resources.slowResources > 5) {
      recommendations.push({
        type: 'resources',
        severity: 'medium',
        message: `${this.metrics.resources.slowResources} resources are loading slowly. Consider optimizing images and implementing caching.`,
        value: this.metrics.resources.slowResources
      });
    }

    // Core Web Vitals recommendations
    if (this.metrics.vitals.lcp?.value > 2500) {
      recommendations.push({
        type: 'vitals',
        severity: 'high',
        message: 'Largest Contentful Paint (LCP) is slow. Optimize above-the-fold content and reduce server response time.',
        value: this.metrics.vitals.lcp.value
      });
    }

    if (this.metrics.vitals.fid?.value > 100) {
      recommendations.push({
        type: 'vitals',
        severity: 'medium',
        message: 'First Input Delay (FID) is high. Reduce JavaScript execution time and break up long tasks.',
        value: this.metrics.vitals.fid.value
      });
    }

    if (this.metrics.vitals.cls?.value > 0.1) {
      recommendations.push({
        type: 'vitals',
        severity: 'high',
        message: 'Cumulative Layout Shift (CLS) is high. Avoid layout shifts by specifying dimensions for images and videos.',
        value: this.metrics.vitals.cls.value
      });
    }

    return recommendations;
  }

  // Stop monitoring
  stopMonitoring() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }

  // Send metrics to analytics (optional)
  sendToAnalytics() {
    if (!this.isMonitoring) return;

    const report = this.generateReport();
    
    // Send to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metrics', {
        event_category: 'Performance',
        event_label: 'Page Load',
        value: this.metrics.pageLoad.loadComplete,
        custom_map: {
          custom_parameter_1: this.metrics.vitals.lcp?.value || 0,
          custom_parameter_2: this.metrics.vitals.fid?.value || 0,
          custom_parameter_3: this.metrics.vitals.cls?.value || 0
        }
      });
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  performanceMonitor.startMonitoring();
}

export default performanceMonitor;
