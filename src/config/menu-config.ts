/**
 * Menu Configuration
 * Centralized menu items configuration for the application
 */

import {
  LayoutDashboard,
  Home,
  FolderKanban,
  Clock,
  DollarSign,
  BarChart3,
  Activity,
  Search,
  Settings,
  Users,
  Building2,
  FileText,
  Users2,
  GitBranch,
  ClipboardList,
} from 'lucide-react';

export interface MenuItemConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  badgeType?: 'info' | 'success' | 'warning' | 'error';
  category: string;
  requiredRole?: string[];
  stats?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down';
  };
  metadata?: {
    keywords?: string[];
    section?: string;
    priority?: number;
  };
}

export const MENU_CATEGORIES = [
  'Main',
  'Projects',
  'Project Manager',
  'Time Tracking',
  'Financial',
  'Analytics',
  'Tools',
  'Settings',
  'Administration',
] as const;

export const menuConfig: MenuItemConfig[] = [
  // Main Section
  {
    id: 'home',
    title: 'Home',
    description: 'Return to home page',
    icon: Home,
    path: '/',
    category: 'Main',
    metadata: {
      keywords: ['home', 'start', 'landing'],
      priority: 1,
    },
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'View your project overview and key metrics',
    icon: LayoutDashboard,
    path: '/dashboard',
    category: 'Main',
    badge: 'Popular',
    badgeType: 'info',
    stats: {
      label: 'Active Projects',
      value: '12',
      trend: 'up',
    },
    metadata: {
      keywords: ['dashboard', 'overview', 'metrics', 'analytics'],
      priority: 1,
    },
  },

  // Projects Section
  {
    id: 'projects',
    title: 'Projects',
    description: 'Manage and view all projects',
    icon: FolderKanban,
    path: '/projects',
    category: 'Projects',
    badge: 'New',
    badgeType: 'success',
    stats: {
      label: 'Total Projects',
      value: '48',
    },
    metadata: {
      keywords: ['projects', 'management', 'tasks', 'kanban'],
      priority: 2,
    },
  },

  // Project Manager Section
  {
    id: 'project-manager',
    title: 'Project Managers',
    description: 'View and manage project managers',
    icon: ClipboardList,
    path: '/project-manager',
    category: 'Project Manager',
    badge: 'New',
    badgeType: 'success',
    metadata: {
      keywords: ['project', 'manager', 'management', 'users', 'team'],
      section: 'Project Manager',
      priority: 2.1,
    },
  },
  {
    id: 'project-manager-users',
    title: 'All Users',
    description: 'Manage all system users and accounts',
    icon: Users,
    path: '/project-manager-users',
    category: 'Project Manager',
    requiredRole: ['admin'],
    badge: 'Admin',
    badgeType: 'error',
    metadata: {
      keywords: ['users', 'accounts', 'management', 'admin', 'system'],
      section: 'Project Manager',
      priority: 2.2,
    },
  },

  // Resources Section
  {
    id: 'resources-team',
    title: 'Team Management',
    description: 'Create and manage teams, assign members',
    icon: Users2,
    path: '/resources/team',
    category: 'Projects',
    metadata: {
      keywords: ['team', 'members', 'management', 'resources'],
      section: 'Resources',
      priority: 2.5,
    },
  },
  {
    id: 'resources-allocation',
    title: 'Resource Allocation',
    description: 'Manage resource allocation and utilization',
    icon: GitBranch,
    path: '/resources/allocation',
    category: 'Projects',
    metadata: {
      keywords: ['allocation', 'resources', 'capacity', 'utilization'],
      section: 'Resources',
      priority: 2.6,
    },
  },

  // Time Tracking Section
  {
    id: 'timesheet',
    title: 'Timesheet',
    description: 'Log and track your working hours',
    icon: Clock,
    path: '/timesheet',
    category: 'Time Tracking',
    stats: {
      label: 'This Week',
      value: '38h',
    },
    metadata: {
      keywords: ['timesheet', 'hours', 'time tracking', 'billing'],
      priority: 3,
    },
  },

  // Financial Section
  {
    id: 'expenses',
    title: 'Expenses',
    description: 'Track and manage project expenses',
    icon: DollarSign,
    path: '/expenses',
    category: 'Financial',
    stats: {
      label: 'Pending Review',
      value: '5',
    },
    metadata: {
      keywords: ['expenses', 'budget', 'costs', 'financial'],
      priority: 4,
    },
  },

  // Analytics Section
  {
    id: 'reports',
    title: 'Reports',
    description: 'Generate and view detailed reports',
    icon: BarChart3,
    path: '/reports',
    category: 'Analytics',
    requiredRole: ['admin', 'manager'],
    badge: 'Admin Only',
    badgeType: 'warning',
    metadata: {
      keywords: ['reports', 'analytics', 'data', 'insights', 'charts'],
      priority: 5,
    },
  },
  {
    id: 'activity',
    title: 'Activity Log',
    description: 'View system activity and changes',
    icon: Activity,
    path: '/activity',
    category: 'Analytics',
    metadata: {
      keywords: ['activity', 'logs', 'history', 'audit', 'events'],
      priority: 6,
    },
  },

  // Tools Section
  {
    id: 'search',
    title: 'Search',
    description: 'Search projects, tasks, and documents',
    icon: Search,
    path: '/search',
    category: 'Tools',
    metadata: {
      keywords: ['search', 'find', 'locate', 'query'],
      priority: 7,
    },
  },

  // Settings Section
  {
    id: 'settings',
    title: 'Settings',
    description: 'Manage account and application settings',
    icon: Settings,
    path: '/settings',
    category: 'Settings',
    metadata: {
      keywords: ['settings', 'preferences', 'configuration', 'options'],
      priority: 8,
    },
  },

  // Administration Section (Admin Only)
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage users and permissions',
    icon: Users,
    path: '/backoffice/users',
    category: 'Administration',
    requiredRole: ['admin'],
    badge: 'Admin',
    badgeType: 'error',
    metadata: {
      keywords: ['users', 'management', 'permissions', 'roles', 'admin'],
      priority: 9,
    },
  },
  {
    id: 'backoffice',
    title: 'Administration',
    description: 'System administration and settings',
    icon: Building2,
    path: '/backoffice/dashboard',
    category: 'Administration',
    requiredRole: ['admin'],
    badge: 'Admin',
    badgeType: 'error',
    metadata: {
      keywords: ['admin', 'administration', 'system', 'settings'],
      priority: 10,
    },
  },
];

/**
 * Quick actions configuration
 */
export interface QuickActionConfig {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  action: () => void;
  description?: string;
}

export const quickActionsConfig: QuickActionConfig[] = [
  {
    id: 'new-project',
    title: 'New Project',
    icon: FolderKanban,
    color: 'primary',
    action: () => window.location.href = '/projects',
    description: 'Create a new project',
  },
  {
    id: 'log-time',
    title: 'Log Time',
    icon: Clock,
    color: 'success',
    action: () => window.location.href = '/timesheet',
    description: 'Record your working hours',
  },
  {
    id: 'add-expense',
    title: 'Add Expense',
    icon: DollarSign,
    color: 'warning',
    action: () => window.location.href = '/expenses',
    description: 'Add a new expense',
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    icon: FileText,
    color: 'secondary',
    action: () => window.location.href = '/reports',
    description: 'Create a new report',
  },
];

/**
 * Get menu items by category
 */
export const getMenuItemsByCategory = (category: string): MenuItemConfig[] => {
  return menuConfig.filter(item => item.category === category);
};

/**
 * Get all categories
 */
export const getAllCategories = (): string[] => {
  return ['All', ...Array.from(new Set(menuConfig.map(item => item.category)))];
};

/**
 * Filter menu items by user roles
 */
export const filterMenuByRoles = (
  items: MenuItemConfig[],
  userRoles?: string[]
): MenuItemConfig[] => {
  return items.filter(item => {
    if (!item.requiredRole || item.requiredRole.length === 0) {
      return true;
    }

    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    return item.requiredRole.some(role => userRoles.includes(role));
  });
};

/**
 * Search menu items
 */
export const searchMenuItems = (
  items: MenuItemConfig[],
  query: string
): MenuItemConfig[] => {
  if (!query.trim()) return items;

  const normalizedQuery = query.toLowerCase().trim();

  return items
    .map(item => {
      let score = 0;

      // Title match
      if (item.title.toLowerCase() === normalizedQuery) score += 1000;
      else if (item.title.toLowerCase().startsWith(normalizedQuery)) score += 500;
      else if (item.title.toLowerCase().includes(normalizedQuery)) score += 250;

      // Description match
      if (item.description.toLowerCase().includes(normalizedQuery)) score += 100;

      // Keywords match
      if (item.metadata?.keywords) {
        if (item.metadata.keywords.some(k => k === normalizedQuery)) score += 150;
        if (item.metadata.keywords.some(k => k.includes(normalizedQuery))) score += 50;
      }

      return { item, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);
};

/**
 * Get recently used menu items
 */
export const getRecentlyUsed = (limit: number = 5): MenuItemConfig[] => {
  const recentlyVisited = localStorage.getItem('menuRecentlyVisited');
  if (!recentlyVisited) return [];

  try {
    const ids: string[] = JSON.parse(recentlyVisited);
    return ids
      .slice(0, limit)
      .map(id => menuConfig.find(item => item.id === id))
      .filter(Boolean) as MenuItemConfig[];
  } catch {
    return [];
  }
};

/**
 * Get favorite menu items
 */
export const getFavorites = (): MenuItemConfig[] => {
  const favorites = localStorage.getItem('menuFavorites');
  if (!favorites) return [];

  try {
    const ids: string[] = JSON.parse(favorites);
    return ids
      .map(id => menuConfig.find(item => item.id === id))
      .filter(Boolean) as MenuItemConfig[];
  } catch {
    return [];
  }
};

export default menuConfig;
