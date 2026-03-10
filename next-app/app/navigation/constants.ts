/**
 * Navigation Constants
 * Centralized configuration for all navigation structure
 */

export const NAVIGATION_PATHS = {
  // Analytics
  DASHBOARD: '/',
  REPORTS: '/reports',

  // Operations
  PROJECTS: '/projects',
  PROJECTS_WEEKLY: '/projects/weekly-activities',
  TASKS: '/tasks',
  TIMESHEET: '/timesheet',
  EXPENSES: '/expenses',
  EXPENSES_VENDOR: '/expenses/vendor-payments',
  DELIVERY: '/delivery',
  WARRANTY: '/warranty',
  WARRANTY_TICKETS: '/warranty/tickets',
  WARRANTY_PM: '/warranty/pm-schedule',

  // Workspace
  CLIENTS: '/clients',
  APPROVALS: '/approvals',
  RESOURCES: '/resources',

  // Admin
  ADMIN: '/admin',
  ADMIN_MASTER_DATA: '/admin/master-data',
  ADMIN_USERS: '/admin/users',
  ADMIN_ASSIGN: '/admin/project-assign',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_HEALTH: '/admin/health',
} as const;

export const SECTION_TITLES = {
  ANALYTICS: 'navigation.analytics',
  OPERATIONS: 'OPERATIONS (LIFECYCLE)',
  WORKSPACE: 'navigation.workspace',
  ADMIN: 'navigation.admin_section',
} as const;

export const ROLE_HIERARCHY = {
  admin: 3,
  manager: 2,
  member: 1,
} as const;
