import { toast } from 'react-hot-toast';

// Cross-Platform Compatibility Service
class PlatformService {
  private platformInfo: {
    isMobile: boolean;
    isDesktop: boolean;
    isTablet: boolean;
    os: string;
    browser: string;
    screenSize: string;
    touchSupport: boolean;
    deviceType: string;
  } = this.detectPlatform();

  constructor() {
    // Set up platform detection
    this.detectPlatform();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  // Detect current platform
  private detectPlatform(): any {
    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;

    // Detect OS
    let os = 'unknown';
    if (/Windows/.test(userAgent)) os = 'windows';
    if (/Macintosh|Mac OS X/.test(userAgent)) os = 'macos';
    if (/Linux/.test(userAgent)) os = 'linux';
    if (/Android/.test(userAgent)) os = 'android';
    if (/iPhone|iPad|iPod/.test(userAgent)) os = 'ios';

    // Detect browser
    let browser = 'unknown';
    if (/Edg/.test(userAgent)) browser = 'edge';
    if (/Chrome/.test(userAgent)) browser = 'chrome';
    if (/Firefox/.test(userAgent)) browser = 'firefox';
    if (/Safari/.test(userAgent)) browser = 'safari';
    if (/Opera|OPR/.test(userAgent)) browser = 'opera';

    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || screenWidth < 768;
    const isTablet = (screenWidth >= 768 && screenWidth < 1024) || /Tablet|iPad/i.test(userAgent);
    const isDesktop = screenWidth >= 1024;

    // Screen size category
    let screenSize = 'small';
    if (screenWidth >= 1200) screenSize = 'large';
    else if (screenWidth >= 992) screenSize = 'medium';
    else if (screenWidth >= 768) screenSize = 'small-medium';

    // Touch support
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Device type
    let deviceType = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';

    return {
      isMobile,
      isDesktop,
      isTablet,
      os,
      browser,
      screenSize,
      touchSupport,
      deviceType
    };
  }

  // Handle window resize
  private handleResize(): void {
    const newPlatformInfo = this.detectPlatform();
    this.platformInfo = newPlatformInfo;

    // Dispatch custom event for platform changes
    const event = new CustomEvent('platformChange', {
      detail: newPlatformInfo
    });
    window.dispatchEvent(event);
  }

  // Get current platform information
  getPlatformInfo(): any {
    return { ...this.platformInfo };
  }

  // Check if platform is mobile
  isMobile(): boolean {
    return this.platformInfo.isMobile;
  }

  // Check if platform is tablet
  isTablet(): boolean {
    return this.platformInfo.isTablet;
  }

  // Check if platform is desktop
  isDesktop(): boolean {
    return this.platformInfo.isDesktop;
  }

  // Get device type
  getDeviceType(): string {
    return this.platformInfo.deviceType;
  }

  // Get screen size category
  getScreenSize(): string {
    return this.platformInfo.screenSize;
  }

  // Check if touch is supported
  hasTouchSupport(): boolean {
    return this.platformInfo.touchSupport;
  }

  // Get OS information
  getOS(): string {
    return this.platformInfo.os;
  }

  // Get browser information
  getBrowser(): string {
    return this.platformInfo.browser;
  }

  // Platform-specific optimizations
  getPlatformOptimizations(): any {
    const { deviceType, os, browser, screenSize } = this.platformInfo;

    const optimizations: Record<string, any> = {
      mobile: {
        ui: {
          fontSize: '16px',
          touchTargets: '48px',
          navigation: 'bottom',
          inputSize: 'large'
        },
        performance: {
          imageQuality: 'medium',
          animationComplexity: 'reduced',
          prefetchStrategy: 'conservative'
        },
        features: {
          offlineSupport: true,
          pushNotifications: true,
          cameraAccess: true
        }
      },
      tablet: {
        ui: {
          fontSize: '16px',
          touchTargets: '44px',
          navigation: 'side',
          inputSize: 'medium'
        },
        performance: {
          imageQuality: 'high',
          animationComplexity: 'standard',
          prefetchStrategy: 'moderate'
        },
        features: {
          offlineSupport: true,
          pushNotifications: true,
          multiWindow: true
        }
      },
      desktop: {
        ui: {
          fontSize: '14px',
          touchTargets: '40px',
          navigation: 'side',
          inputSize: 'standard'
        },
        performance: {
          imageQuality: 'ultra',
          animationComplexity: 'enhanced',
          prefetchStrategy: 'aggressive'
        },
        features: {
          offlineSupport: false,
          pushNotifications: true,
          keyboardShortcuts: true,
          multiWindow: true
        }
      }
    };

    return optimizations[deviceType] || optimizations.desktop;
  }

  // Adaptive UI recommendations
  getAdaptiveUIRecommendations(): any {
    const { screenSize, deviceType, touchSupport } = this.platformInfo;

    return {
      layout: screenSize === 'small' ? 'single-column' :
             screenSize === 'small-medium' ? 'two-column' : 'multi-column',
      navigation: deviceType === 'mobile' ? 'bottom-nav' :
                  deviceType === 'tablet' ? 'collapsible-side' : 'permanent-side',
      inputMethod: touchSupport ? 'touch-optimized' : 'precision',
      density: screenSize === 'large' ? 'comfortable' :
              screenSize === 'medium' ? 'compact' : 'cozy',
      interaction: touchSupport ? {
        hoverEffects: 'subtle',
        clickTargets: 'large',
        gestures: 'enabled'
      } : {
        hoverEffects: 'prominent',
        clickTargets: 'standard',
        gestures: 'disabled'
      }
    };
  }

  // Performance optimization recommendations
  getPerformanceRecommendations(): any {
    const { deviceType, screenSize } = this.platformInfo;

    return {
      imageLoading: deviceType === 'mobile' ? 'lazy' : 'eager',
      codeSplitting: true,
      bundleOptimization: 'aggressive',
      cachingStrategy: deviceType === 'mobile' ? 'aggressive' : 'standard',
      resourceLoading: {
        scripts: 'defer',
        styles: 'preload',
        fonts: deviceType === 'mobile' ? 'swap' : 'block'
      },
      rendering: {
        virtualization: true,
        debounceInput: deviceType === 'mobile' ? 300 : 150,
        animationFrameBudget: deviceType === 'mobile' ? 10 : 16
      }
    };
  }

  // Feature compatibility matrix
  getFeatureCompatibility(): any {
    const { os, browser, deviceType } = this.platformInfo;

    return {
      webRTC: this.isWebRTCAvailable(),
      serviceWorkers: 'serviceWorker' in navigator,
      webAssembly: 'WebAssembly' in window,
      fileSystemAccess: 'showOpenFilePicker' in window,
      notifications: 'Notification' in window,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator,
      clipboard: 'clipboard' in navigator,
      offlineStorage: 'indexedDB' in window,
      webGL: this.isWebGLAvailable(),
      recommendations: this.getFeatureRecommendations()
    };
  }

  // Check WebRTC availability
  private isWebRTCAvailable(): boolean {
    return 'RTCPeerConnection' in window ||
           'webkitRTCPeerConnection' in window ||
           'mozRTCPeerConnection' in window;
  }

  // Check WebGL availability
  private isWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // Get feature recommendations based on platform
  private getFeatureRecommendations(): any {
    const { deviceType } = this.platformInfo;

    const recommendations: any = {
      preferredFeatures: [],
      avoidedFeatures: [],
      fallbacks: []
    };

    // Mobile recommendations
    if (deviceType === 'mobile') {
      recommendations.preferredFeatures.push(
        'touch-optimized-ui',
        'offline-first',
        'progressive-loading',
        'responsive-images'
      );
      recommendations.avoidedFeatures.push(
        'heavy-animations',
        'complex-transitions',
        'large-data-sets'
      );
      recommendations.fallbacks.push(
        'server-side-rendering',
        'reduced-motion',
        'simplified-layouts'
      );
    }

    // Desktop recommendations
    if (deviceType === 'desktop') {
      recommendations.preferredFeatures.push(
        'keyboard-shortcuts',
        'multi-window-support',
        'advanced-animations',
        'high-resolution-assets'
      );
      recommendations.avoidedFeatures.push(
        'touch-specific-gestures',
        'mobile-only-features'
      );
    }

    // OS-specific recommendations
    const platformOs = this.platformInfo.os;
    if (platformOs === 'ios') {
      recommendations.preferredFeatures.push('safari-optimizations');
      recommendations.avoidedFeatures.push('pwa-install-prompt');
    }

    if (platformOs === 'android') {
      recommendations.preferredFeatures.push('pwa-install-prompt');
    }

    return recommendations;
  }

  // Platform-specific error handling
  getErrorHandlingStrategy(): any {
    const { deviceType, os } = this.platformInfo;

    return {
      networkErrors: deviceType === 'mobile' ?
        'retry-with-exponential-backoff' : 'immediate-retry',
      renderingErrors: 'graceful-degradation',
      apiErrors: deviceType === 'mobile' ?
        'offline-cache-fallback' : 'user-notification',
      resourceErrors: 'fallback-content',
      recommendations: {
        mobile: 'Use toast notifications for errors',
        desktop: 'Use modal dialogs for critical errors',
        all: 'Log all errors for debugging'
      }
    };
  }

  // Cross-platform testing recommendations
  getTestingRecommendations(): any {
    return {
      browsers: ['chrome', 'firefox', 'safari', 'edge'],
      devices: ['mobile', 'tablet', 'desktop'],
      os: ['windows', 'macos', 'linux', 'android', 'ios'],
      screenSizes: ['320px', '768px', '1024px', '1440px', '1920px'],
      strategies: {
        responsive: 'Test at all breakpoints',
        performance: 'Measure on low-end devices',
        accessibility: 'Test with screen readers',
        compatibility: 'Test on older browser versions'
      }
    };
  }

  // Platform-specific analytics
  getPlatformAnalytics(): any {
    const { deviceType, os, browser, screenSize } = this.platformInfo;

    return {
      deviceType,
      os,
      browser,
      screenSize,
      performanceMetrics: this.getPerformanceMetrics(),
      usagePatterns: this.getUsagePatterns()
    };
  }

  // Get performance metrics
  private getPerformanceMetrics(): any {
    if (!('performance' in window)) return {};

    const [timing] = window.performance.getEntriesByType('navigation') || [];
    const [lcp] = window.performance.getEntriesByType('largest-contentful-paint') || [];
    const [cls] = window.performance.getEntriesByType('layout-shift') || [];
    const [fid] = window.performance.getEntriesByType('first-input') || [];

    return {
      loadTime: timing ? (timing.duration) : 0,
      domReady: 0, // Would use actual DOM ready timing in real implementation
      lcp: lcp ? lcp.startTime : 0,
      cls: cls ? (cls as any).value : 0, // Type cast for demo
      fid: fid ? fid.startTime : 0,
      memory: this.getMemoryUsage()
    };
  }

  // Get memory usage (mock - real apps would use performance.memory if available)
  private getMemoryUsage(): any {
    return {
      usedJSHeapSize: Math.floor(Math.random() * 100) + 50, // MB
      totalJSHeapSize: Math.floor(Math.random() * 50) + 100, // MB
      jsHeapSizeLimit: 2048 // MB
    };
  }

  // Get usage patterns
  private getUsagePatterns(): any {
    const { deviceType } = this.platformInfo;

    return {
      sessionDuration: deviceType === 'mobile' ? 'short-frequent' : 'long-infrequent',
      interactionStyle: deviceType === 'mobile' ? 'touch-gestures' : 'mouse-keyboard',
      navigationPattern: deviceType === 'mobile' ? 'linear' : 'non-linear',
      featureUsage: deviceType === 'mobile' ? 'core-features' : 'advanced-features'
    };
  }

  // Cleanup
  cleanup(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}

export const platformService = new PlatformService();