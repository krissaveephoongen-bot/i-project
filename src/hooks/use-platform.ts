import { useState, useEffect } from 'react';
import { platformService } from '../services/platformService';

export function usePlatform() {
  const [platformInfo, setPlatformInfo] = useState(platformService.getPlatformInfo());
  const [isMobile, setIsMobile] = useState(platformService.isMobile());
  const [isTablet, setIsTablet] = useState(platformService.isTablet());
  const [isDesktop, setIsDesktop] = useState(platformService.isDesktop());
  const [screenSize, setScreenSize] = useState(platformService.getScreenSize());
  const [deviceType, setDeviceType] = useState(platformService.getDeviceType());

  // Update platform info on changes
  useEffect(() => {
    const handlePlatformChange = (event: any) => {
      const newPlatformInfo = event.detail;
      setPlatformInfo(newPlatformInfo);
      setIsMobile(newPlatformInfo.isMobile);
      setIsTablet(newPlatformInfo.isTablet);
      setIsDesktop(newPlatformInfo.isDesktop);
      setScreenSize(newPlatformInfo.screenSize);
      setDeviceType(newPlatformInfo.deviceType);
    };

    window.addEventListener('platformChange', handlePlatformChange);

    return () => {
      window.removeEventListener('platformChange', handlePlatformChange);
    };
  }, []);

  // Get platform optimizations
  const getPlatformOptimizations = () => {
    return platformService.getPlatformOptimizations();
  };

  // Get adaptive UI recommendations
  const getAdaptiveUIRecommendations = () => {
    return platformService.getAdaptiveUIRecommendations();
  };

  // Get performance recommendations
  const getPerformanceRecommendations = () => {
    return platformService.getPerformanceRecommendations();
  };

  // Get feature compatibility
  const getFeatureCompatibility = () => {
    return platformService.getFeatureCompatibility();
  };

  // Get error handling strategy
  const getErrorHandlingStrategy = () => {
    return platformService.getErrorHandlingStrategy();
  };

  // Get testing recommendations
  const getTestingRecommendations = () => {
    return platformService.getTestingRecommendations();
  };

  // Get platform analytics
  const getPlatformAnalytics = () => {
    return platformService.getPlatformAnalytics();
  };

  return {
    platformInfo,
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    deviceType,
    getPlatformOptimizations,
    getAdaptiveUIRecommendations,
    getPerformanceRecommendations,
    getFeatureCompatibility,
    getErrorHandlingStrategy,
    getTestingRecommendations,
    getPlatformAnalytics,
  };
}