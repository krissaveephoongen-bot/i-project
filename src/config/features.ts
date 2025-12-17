/**
 * Feature Configuration
 * Enables/disables and configures major features
 */

export const FEATURES = {
  // Admin & Role Management
  roleManagement: {
    enabled: true,
    path: '/admin/roles',
    name: 'Role Management',
    icon: 'Shield',
    requiresAdmin: true,
    description: 'Manage user roles and permissions'
  },

  // Analytics Dashboard
  analyticsDashboard: {
    enabled: true,
    path: '/analytics',
    name: 'Analytics Dashboard',
    icon: 'BarChart3',
    requiresAdmin: false,
    description: 'Real-time project metrics and analytics',
    subFeatures: {
      dashboardMetrics: true,
      charts: true,
      reports: true,
      export: true,
      riskAssessment: true,
      resourceUtilization: true
    }
  },

  // Real-time Notifications
  notifications: {
    enabled: true,
    path: '/notifications',
    name: 'Notifications',
    icon: 'Bell',
    requiresAdmin: false,
    description: 'Real-time project and team notifications',
    subFeatures: {
      webSocket: true,
      fallbackHttp: true,
      preferences: true,
      categories: {
        projects: true,
        tasks: true,
        comments: true,
        team: true,
        system: true
      }
    }
  }
};

// Navigation menu items for admin
export const ADMIN_MENU_ITEMS = [
  {
    label: 'Admin Dashboard',
    path: '/admin/dashboard',
    icon: 'LayoutDashboard'
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: 'Users'
  },
  {
    label: 'Role Management',
    path: '/admin/roles',
    icon: 'Shield'
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3'
  },
  {
    label: 'Audit Logs',
    path: '/admin/audit-logs',
    icon: 'ActivityLog'
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: 'Settings'
  }
];

// Default analytics configuration
export const ANALYTICS_CONFIG = {
  chartDefaults: {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 300
    }
  },
  dataRefreshInterval: 5 * 60 * 1000, // 5 minutes
  metricsRetention: 90, // days
  exportFormats: ['pdf', 'csv', 'xlsx'],
  periods: ['week', 'month', 'quarter', 'year']
};

// Notification configuration
export const NOTIFICATION_CONFIG = {
  wsReconnectAttempts: 5,
  wsReconnectDelay: 3000,
  wsMaxReconnectDelay: 30000,
  notificationRetention: 30, // days
  maxNotificationsDisplay: 50,
  toastDuration: 3000,
  categories: [
    'projects',
    'tasks',
    'comments',
    'team',
    'system'
  ],
  frequencies: ['immediate', 'hourly', 'daily'],
  batchingEnabled: true,
  batchSize: 10,
  batchInterval: 1000 // ms
};

// Role configuration
export const ROLE_CONFIG = {
  defaultRoles: [
    {
      name: 'Administrator',
      description: 'Full system access',
      permissions: ['admin:*']
    },
    {
      name: 'Project Manager',
      description: 'Manage projects and teams',
      permissions: [
        'project:*',
        'task:*',
        'user:view',
        'report:view',
        'report:export'
      ]
    },
    {
      name: 'Team Member',
      description: 'Standard team member access',
      permissions: [
        'project:view',
        'task:view',
        'task:create',
        'report:view'
      ]
    },
    {
      name: 'Viewer',
      description: 'Read-only access',
      permissions: [
        'project:view',
        'task:view',
        'report:view'
      ]
    }
  ],
  permissionCategories: [
    'Projects',
    'Tasks',
    'Users',
    'Reports',
    'Administration'
  ]
};

// Feature flags
export const FEATURE_FLAGS = {
  enableRoleManagement: true,
  enableAnalyticsDashboard: true,
  enableRealTimeNotifications: true,
  enableAdvancedReporting: true,
  enableBudgetTracking: true,
  enableResourcePlanning: true,
  enableRiskManagement: true,
  enableAuditLogging: true,
  enableAPITokens: true,
  enableWebHooks: true
};

// Permission definitions
export const PERMISSIONS = {
  projects: [
    'project:view',
    'project:create',
    'project:edit',
    'project:delete',
    'project:manage_team',
    'project:archive'
  ],
  tasks: [
    'task:view',
    'task:create',
    'task:edit',
    'task:delete',
    'task:assign',
    'task:comment'
  ],
  users: [
    'user:view',
    'user:create',
    'user:edit',
    'user:delete',
    'user:manage_roles'
  ],
  reports: [
    'report:view',
    'report:create',
    'report:edit',
    'report:delete',
    'report:export'
  ],
  admin: [
    'admin:system',
    'admin:users',
    'admin:roles',
    'admin:audit',
    'admin:settings',
    'admin:integrations'
  ]
};

// Get feature by key
export function getFeature(key: keyof typeof FEATURES) {
  return FEATURES[key];
}

// Check if feature is enabled
export function isFeatureEnabled(key: keyof typeof FEATURES): boolean {
  return FEATURES[key]?.enabled || false;
}

// Check if feature flag is enabled
export function isFeatureFlagEnabled(key: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[key] || false;
}

// Get all admin menu items
export function getAdminMenuItems() {
  return ADMIN_MENU_ITEMS.filter(item => {
    // Filter based on feature enablement if needed
    if (item.path === '/admin/roles' && !FEATURES.roleManagement.enabled) {
      return false;
    }
    if (item.path === '/analytics' && !FEATURES.analyticsDashboard.enabled) {
      return false;
    }
    return true;
  });
}
