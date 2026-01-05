import { toast } from 'react-hot-toast';
import { User } from './dataService';

// Customization and Scalability Service
class CustomizationService {
    // User preferences storage
    private async getUserPreferences(userId: string): Promise<any> {
        try {
            const preferences = localStorage.getItem(`preferences:${userId}`);
            return preferences ? JSON.parse(preferences) : this.getDefaultPreferences();
        } catch (error) {
            console.error('Failed to get user preferences:', error);
            return this.getDefaultPreferences();
        }
    }

    private async saveUserPreferences(userId: string, preferences: any): Promise<void> {
        try {
            localStorage.setItem(`preferences:${userId}`, JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save user preferences:', error);
            toast.error('Failed to save preferences');
        }
    }

    // Default preferences
    private getDefaultPreferences(): any {
        return {
            theme: 'system',
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12-hour',
            density: 'comfortable',
            notifications: {
                email: true,
                push: true,
                inApp: true
            },
            dashboard: {
                layout: 'grid',
                widgets: ['project-overview', 'task-list', 'team-activity', 'upcoming-deadlines']
            },
            projectViews: {
                defaultView: 'kanban',
                showCompleted: false,
                groupBy: 'status'
            },
            taskManagement: {
                defaultPriority: 'medium',
                showEstimates: true,
                autoAssign: false
            }
        };
    }

    // Get all customization options
    async getCustomizationOptions(userId: string): Promise<any> {
        try {
            const preferences = await this.getUserPreferences(userId);

            return {
                themeOptions: ['light', 'dark', 'system'],
                languageOptions: ['en', 'es', 'fr', 'de', 'zh'],
                dateFormatOptions: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
                timeFormatOptions: ['12-hour', '24-hour'],
                densityOptions: ['cozy', 'comfortable', 'compact'],
                dashboardLayoutOptions: ['grid', 'list', 'masonry'],
                projectViewOptions: ['kanban', 'list', 'gantt', 'calendar'],
                groupByOptions: ['status', 'priority', 'assignee', 'project', 'due-date'],
                currentPreferences: preferences
            };
        } catch (error) {
            console.error('Failed to get customization options:', error);
            return { error: 'Failed to get customization options' };
        }
    }

    // Update user preferences
    async updatePreferences(userId: string, updates: any): Promise<any> {
        try {
            const currentPreferences = await this.getUserPreferences(userId);
            const updatedPreferences = { ...currentPreferences, ...updates };

            await this.saveUserPreferences(userId, updatedPreferences);
            toast.success('Preferences updated successfully');

            return updatedPreferences;
        } catch (error) {
            toast.error('Failed to update preferences');
            console.error('Preferences Update Error:', error);
            throw error;
        }
    }

    // Reset to default preferences
    async resetPreferences(userId: string): Promise<any> {
        try {
            const defaultPreferences = this.getDefaultPreferences();
            await this.saveUserPreferences(userId, defaultPreferences);
            toast.success('Preferences reset to defaults');

            return defaultPreferences;
        } catch (error) {
            toast.error('Failed to reset preferences');
            console.error('Preferences Reset Error:', error);
            throw error;
        }
    }

    // Get theme preferences
    async getThemePreferences(userId: string): Promise<string> {
        try {
            const preferences = await this.getUserPreferences(userId);
            return preferences.theme || 'system';
        } catch (error) {
            console.error('Failed to get theme preferences:', error);
            return 'system';
        }
    }

    // Update theme preferences
    async updateThemePreferences(userId: string, theme: string): Promise<void> {
        try {
            await this.updatePreferences(userId, { theme });
        } catch (error) {
            console.error('Failed to update theme preferences:', error);
            throw error;
        }
    }

    // Get dashboard customization
    async getDashboardCustomization(userId: string): Promise<any> {
        try {
            const preferences = await this.getUserPreferences(userId);
            return preferences.dashboard || this.getDefaultPreferences().dashboard;
        } catch (error) {
            console.error('Failed to get dashboard customization:', error);
            return this.getDefaultPreferences().dashboard;
        }
    }

    // Update dashboard customization
    async updateDashboardCustomization(userId: string, dashboardConfig: any): Promise<void> {
        try {
            await this.updatePreferences(userId, { dashboard: dashboardConfig });
            toast.success('Dashboard customized successfully');
        } catch (error) {
            toast.error('Failed to update dashboard customization');
            console.error('Dashboard Customization Error:', error);
            throw error;
        }
    }

    // Get project view preferences
    async getProjectViewPreferences(userId: string): Promise<any> {
        try {
            const preferences = await this.getUserPreferences(userId);
            return preferences.projectViews || this.getDefaultPreferences().projectViews;
        } catch (error) {
            console.error('Failed to get project view preferences:', error);
            return this.getDefaultPreferences().projectViews;
        }
    }

    // Update project view preferences
    async updateProjectViewPreferences(userId: string, viewPreferences: any): Promise<void> {
        try {
            await this.updatePreferences(userId, { projectViews: viewPreferences });
            toast.success('Project view preferences updated');
        } catch (error) {
            toast.error('Failed to update project view preferences');
            console.error('Project View Preferences Error:', error);
            throw error;
        }
    }

    // Scalability features
    async getScalabilityOptions(): Promise<any> {
        return {
            teamScaling: {
                maxTeamSize: 100,
                roleBasedPermissions: true,
                departmentSupport: true,
                customRoles: true
            },
            projectScaling: {
                maxProjects: 500,
                projectTemplates: true,
                projectHierarchy: true,
                crossProjectDependencies: true
            },
            performanceScaling: {
                dataCaching: true,
                lazyLoading: true,
                backgroundSync: true,
                loadBalancing: true
            },
            storageScaling: {
                unlimitedStorage: true,
                fileVersioning: true,
                archiveSupport: true,
                externalStorageIntegration: true
            },
            integrationScaling: {
                apiAccess: true,
                webhooks: true,
                thirdPartyIntegrations: true,
                customIntegrations: true
            }
        };
    }

    // Team customization
    async getTeamCustomizationOptions(teamId: string): Promise<any> {
        try {
            const response = await fetch(`/api/teams/${teamId}/customization`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch team customization');
            }

            const teamCustomizations = await response.json();
            return teamCustomizations;
        } catch (error) {
            console.error('Failed to get team customization options:', error);
            return { error: 'Failed to get team customization options' };
        }
    }

    // Update team customization
    async updateTeamCustomization(teamId: string, customization: any): Promise<void> {
        try {
            const response = await fetch(`/api/teams/${teamId}/customization`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(customization),
            });

            if (!response.ok) {
                throw new Error('Failed to update team customization');
            }

            toast.success('Team customization updated successfully');
        } catch (error) {
            toast.error('Failed to update team customization');
            console.error('Team Customization Error:', error);
            throw error;
        }
    }

    // Workflow customization
    async getWorkflowOptions(): Promise<any> {
        return {
            standardWorkflows: [
                {
                    id: 'agile',
                    name: 'Agile Development',
                    stages: ['backlog', 'sprint-planning', 'development', 'testing', 'review', 'done']
                },
                {
                    id: 'waterfall',
                    name: 'Waterfall',
                    stages: ['requirements', 'design', 'implementation', 'testing', 'deployment', 'maintenance']
                },
                {
                    id: 'kanban',
                    name: 'Kanban',
                    stages: ['todo', 'in-progress', 'review', 'done']
                }
            ],
            customWorkflowSupport: true,
            stageCustomization: true,
            transitionRules: true,
            automationIntegration: true
        };
    }

    // Create custom workflow
    async createCustomWorkflow(workflowConfig: any): Promise<string> {
        try {
            // Mock workflow creation
            const workflowId = `workflow-${Math.random().toString(36).substr(2, 9)}`;

            console.log('Created custom workflow:', workflowConfig);
            toast.success('Custom workflow created successfully');

            return workflowId;
        } catch (error) {
            toast.error('Failed to create custom workflow');
            console.error('Custom Workflow Creation Error:', error);
            throw error;
        }
    }

    // User interface customization
    async getUICustomizationOptions(): Promise<any> {
        return {
            themeCustomization: {
                primaryColor: true,
                secondaryColor: true,
                accentColor: true,
                fontFamily: true,
                borderRadius: true
            },
            layoutCustomization: {
                sidebarWidth: true,
                headerHeight: true,
                contentSpacing: true,
                navigationPosition: true
            },
            componentCustomization: {
                cardStyles: true,
                buttonStyles: true,
                formStyles: true,
                tableStyles: true
            },
            accessibilityOptions: {
                highContrast: true,
                reducedMotion: true,
                largerText: true,
                colorBlindModes: true
            }
        };
    }

    // Update UI customization
    async updateUICustomization(userId: string, uiConfig: any): Promise<void> {
        try {
            const currentPreferences = await this.getUserPreferences(userId);
            const updatedPreferences = {
                ...currentPreferences,
                uiCustomization: {
                    ...currentPreferences.uiCustomization,
                    ...uiConfig
                }
            };

            await this.saveUserPreferences(userId, updatedPreferences);
            toast.success('UI customization updated successfully');
        } catch (error) {
            toast.error('Failed to update UI customization');
            console.error('UI Customization Error:', error);
            throw error;
        }
    }

    // Notification preferences
    async getNotificationPreferences(userId: string): Promise<any> {
        try {
            const preferences = await this.getUserPreferences(userId);
            return preferences.notifications || this.getDefaultPreferences().notifications;
        } catch (error) {
            console.error('Failed to get notification preferences:', error);
            return this.getDefaultPreferences().notifications;
        }
    }

    // Update notification preferences
    async updateNotificationPreferences(userId: string, notificationConfig: any): Promise<void> {
        try {
            await this.updatePreferences(userId, { notifications: notificationConfig });
            toast.success('Notification preferences updated');
        } catch (error) {
            toast.error('Failed to update notification preferences');
            console.error('Notification Preferences Error:', error);
            throw error;
        }
    }

    // Export customization settings
    async exportCustomizationSettings(userId: string): Promise<string> {
        try {
            const preferences = await this.getUserPreferences(userId);
            const exportData = JSON.stringify(preferences, null, 2);

            // Mock export - in real app this would download a file
            console.log('Exporting customization settings:', exportData);
            toast.success('Customization settings exported');

            return exportData;
        } catch (error) {
            toast.error('Failed to export customization settings');
            console.error('Export Error:', error);
            throw error;
        }
    }

    // Import customization settings
    async importCustomizationSettings(userId: string, importData: string): Promise<void> {
        try {
            const preferences = JSON.parse(importData);
            await this.saveUserPreferences(userId, preferences);

            console.log('Imported customization settings');
            toast.success('Customization settings imported successfully');
        } catch (error) {
            toast.error('Failed to import customization settings');
            console.error('Import Error:', error);
            throw error;
        }
    }

    // Get scalability recommendations
    async getScalabilityRecommendations(currentUsage: any): Promise<any> {
        try {
            const recommendations: any = {
                performance: [],
                storage: [],
                team: [],
                integrations: []
            };

            // Performance recommendations
            if (currentUsage.activeUsers > 50) {
                recommendations.performance.push('Consider implementing data caching');
                recommendations.performance.push('Review database indexing');
            }

            if (currentUsage.concurrentUsers > 20) {
                recommendations.performance.push('Implement load balancing');
                recommendations.performance.push('Consider CDN for static assets');
            }

            // Storage recommendations
            if (currentUsage.storageUsage > 80) {
                recommendations.storage.push('Review file retention policies');
                recommendations.storage.push('Consider archiving old projects');
            }

            // Team recommendations
            if (currentUsage.teamSize > 30) {
                recommendations.team.push('Implement department-based access control');
                recommendations.team.push('Consider role hierarchy');
            }

            // Integration recommendations
            if (currentUsage.apiCalls > 10000) {
                recommendations.integrations.push('Review API rate limiting');
                recommendations.integrations.push('Consider API caching');
            }

            return {
                currentUsage,
                recommendations,
                scalabilityScore: this.calculateScalabilityScore(currentUsage)
            };
        } catch (error) {
            console.error('Failed to get scalability recommendations:', error);
            return { error: 'Failed to get scalability recommendations' };
        }
    }

    // Calculate scalability score
    private calculateScalabilityScore(usage: any): number {
        let score = 100;

        // User load factor
        if (usage.activeUsers > 80) score -= 20;
        else if (usage.activeUsers > 50) score -= 10;

        // Storage factor
        if (usage.storageUsage > 90) score -= 25;
        else if (usage.storageUsage > 80) score -= 15;

        // Performance factor
        if (usage.responseTime > 2000) score -= 15;
        else if (usage.responseTime > 1000) score -= 5;

        // Team factor
        if (usage.teamSize > 50) score -= 10;

        return Math.max(0, Math.min(100, score));
    }

    // Get enterprise features
    async getEnterpriseFeatures(): Promise<any> {
        return {
            advancedSecurity: {
                ssoIntegration: true,
                advancedAuditLogging: true,
                ipRestrictions: true,
                customSecurityPolicies: true
            },
            advancedAnalytics: {
                customReports: true,
                dataWarehouseIntegration: true,
                advancedVisualizations: true,
                predictiveAnalytics: true
            },
            advancedAutomation: {
                customWorkflowAutomation: true,
                aiPoweredAutomation: true,
                crossSystemIntegration: true,
                scheduledAutomation: true
            },
            advancedCustomization: {
                whiteLabeling: true,
                customBranding: true,
                customDomain: true,
                customSSO: true
            },
            scalability: {
                multiRegionDeployment: true,
                autoScaling: true,
                dedicatedInstances: true,
                highAvailability: true
            },
            support: {
                dedicatedAccountManager: true,
                support247: true,
                slaGuarantees: true,
                priorityFeatureRequests: true
            }
        };
    }

    // Check feature availability based on plan
    async checkFeatureAvailability(user: User, featureId: string): Promise<boolean> {
        try {
            // Mock feature availability logic
            const enterpriseFeatures = [
                'advanced-analytics',
                'custom-workflows',
                'sso-integration',
                'api-access',
                'white-labeling'
            ];

            const premiumFeatures = [
                'automation-rules',
                'custom-reports',
                'team-templates',
                'advanced-security'
            ];

            const basicFeatures = [
                'task-management',
                'project-tracking',
                'basic-reports',
                'file-storage'
            ];

            // In real app, this would check user's subscription plan
            const isEnterprise = user.role === 'admin'; // Mock enterprise check
            const isPremium = user.role === 'manager'; // Mock premium check

            if (isEnterprise && enterpriseFeatures.includes(featureId)) return true;
            if ((isEnterprise || isPremium) && premiumFeatures.includes(featureId)) return true;
            if (basicFeatures.includes(featureId)) return true;

            return false;
        } catch (error) {
            console.error('Failed to check feature availability:', error);
            return false;
        }
    }
}

export const customizationService = new CustomizationService();