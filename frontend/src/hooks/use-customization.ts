import { useState } from 'react';
import { customizationService } from '../services/customizationService';
import { User } from '../services/dataService';

export function useCustomization() {
  const [isLoading, setIsLoading] = useState(false);
  const [customizationData, setCustomizationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const getCustomizationOptions = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const options = await customizationService.getCustomizationOptions(userId);
      setCustomizationData(options);
      return options;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get customization options');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (userId: string, updates: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedPreferences = await customizationService.updatePreferences(userId, updates);
      setCustomizationData(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPreferences = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const defaultPreferences = await customizationService.resetPreferences(userId);
      setCustomizationData(defaultPreferences);
      return defaultPreferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getThemePreferences = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const theme = await customizationService.getThemePreferences(userId);
      return theme;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get theme preferences');
      return 'system';
    } finally {
      setIsLoading(false);
    }
  };

  const updateThemePreferences = async (userId: string, theme: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await customizationService.updateThemePreferences(userId, theme);
      setCustomizationData((prev: any) => ({ ...prev, theme }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardCustomization = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const dashboardConfig = await customizationService.getDashboardCustomization(userId);
      setCustomizationData((prev: any) => ({ ...prev, dashboard: dashboardConfig }));
      return dashboardConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get dashboard customization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDashboardCustomization = async (userId: string, dashboardConfig: any) => {
    try {
      setIsLoading(true);
      setError(null);

      await customizationService.updateDashboardCustomization(userId, dashboardConfig);
      setCustomizationData((prev: any) => ({ ...prev, dashboard: dashboardConfig }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dashboard customization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectViewPreferences = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const viewPreferences = await customizationService.getProjectViewPreferences(userId);
      setCustomizationData((prev: any) => ({ ...prev, projectViews: viewPreferences }));
      return viewPreferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get project view preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectViewPreferences = async (userId: string, viewPreferences: any) => {
    try {
      setIsLoading(true);
      setError(null);

      await customizationService.updateProjectViewPreferences(userId, viewPreferences);
      setCustomizationData((prev: any) => ({ ...prev, projectViews: viewPreferences }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project view preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getScalabilityOptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const scalabilityOptions = await customizationService.getScalabilityOptions();
      setCustomizationData((prev: any) => ({ ...prev, scalability: scalabilityOptions }));
      return scalabilityOptions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get scalability options');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamCustomizationOptions = async (teamId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const teamOptions = await customizationService.getTeamCustomizationOptions(teamId);
      setCustomizationData((prev: any) => ({ ...prev, teamCustomization: teamOptions }));
      return teamOptions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get team customization options');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTeamCustomization = async (teamId: string, customization: any) => {
    try {
      setIsLoading(true);
      setError(null);

      await customizationService.updateTeamCustomization(teamId, customization);
      setCustomizationData((prev: any) => ({ ...prev, teamCustomization: customization }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team customization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkflowOptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const workflowOptions = await customizationService.getWorkflowOptions();
      setCustomizationData((prev: any) => ({ ...prev, workflows: workflowOptions }));
      return workflowOptions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get workflow options');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomWorkflow = async (workflowConfig: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const workflowId = await customizationService.createCustomWorkflow(workflowConfig);
      setCustomizationData((prev: any) => ({ ...prev, customWorkflowId: workflowId }));
      return workflowId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom workflow');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUICustomizationOptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const uiOptions = await customizationService.getUICustomizationOptions();
      setCustomizationData((prev: any) => ({ ...prev, uiCustomization: uiOptions }));
      return uiOptions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get UI customization options');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUICustomization = async (userId: string, uiConfig: any) => {
    try {
      setIsLoading(true);
      setError(null);

      await customizationService.updateUICustomization(userId, uiConfig);
      setCustomizationData((prev: any) => ({ ...prev, uiCustomization: uiConfig }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update UI customization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationPreferences = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const notificationPrefs = await customizationService.getNotificationPreferences(userId);
      setCustomizationData((prev: any) => ({ ...prev, notifications: notificationPrefs }));
      return notificationPrefs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get notification preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationPreferences = async (userId: string, notificationConfig: any) => {
    try {
      setIsLoading(true);
      setError(null);

      await customizationService.updateNotificationPreferences(userId, notificationConfig);
      setCustomizationData((prev: any) => ({ ...prev, notifications: notificationConfig }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification preferences');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const exportCustomizationSettings = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const exportData = await customizationService.exportCustomizationSettings(userId);
      return exportData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export customization settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const importCustomizationSettings = async (userId: string, importData: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await customizationService.importCustomizationSettings(userId, importData);
      const updatedPreferences = await customizationService.getCustomizationOptions(userId);
      setCustomizationData(updatedPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import customization settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getScalabilityRecommendations = async (currentUsage: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const recommendations = await customizationService.getScalabilityRecommendations(currentUsage);
      setCustomizationData((prev: any) => ({ ...prev, scalabilityRecommendations: recommendations }));
      return recommendations;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get scalability recommendations');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getEnterpriseFeatures = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const enterpriseFeatures = await customizationService.getEnterpriseFeatures();
      setCustomizationData((prev: any) => ({ ...prev, enterpriseFeatures }));
      return enterpriseFeatures;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get enterprise features');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkFeatureAvailability = async (user: User, featureId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const isAvailable = await customizationService.checkFeatureAvailability(user, featureId);
      return isAvailable;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check feature availability');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    customizationData,
    error,
    getCustomizationOptions,
    updatePreferences,
    resetPreferences,
    getThemePreferences,
    updateThemePreferences,
    getDashboardCustomization,
    updateDashboardCustomization,
    getProjectViewPreferences,
    updateProjectViewPreferences,
    getScalabilityOptions,
    getTeamCustomizationOptions,
    updateTeamCustomization,
    getWorkflowOptions,
    createCustomWorkflow,
    getUICustomizationOptions,
    updateUICustomization,
    getNotificationPreferences,
    updateNotificationPreferences,
    exportCustomizationSettings,
    importCustomizationSettings,
    getScalabilityRecommendations,
    getEnterpriseFeatures,
    checkFeatureAvailability,
  };
}