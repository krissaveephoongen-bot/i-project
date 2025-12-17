/**
 * Menu Utilities - Helper functions for menu operations
 */

export interface MenuItemData {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  category: string;
  badge?: string;
  badgeType?: 'info' | 'success' | 'warning' | 'error';
  requiredRole?: string[];
  stats?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down';
  };
}

/**
 * Get badge variant from badge type
 */
export const getBadgeVariant = (type?: string): 'info' | 'success' | 'warning' | 'error' => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'info':
    default:
      return 'info';
  }
};

/**
 * Get color classes for a given color name
 */
export const getColorClasses = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
    secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
    success: 'bg-success-100 text-success-700 hover:bg-success-200',
    warning: 'bg-warning-100 text-warning-700 hover:bg-warning-200',
    error: 'bg-error-100 text-error-700 hover:bg-error-200',
  };
  return colorMap[color] || colorMap.primary;
};

/**
 * Get icon color classes
 */
export const getIconColorClasses = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
  };
  return colorMap[color] || colorMap.primary;
};

/**
 * Filter menu items based on search query and category
 */
export const filterMenuItems = (
  items: MenuItemData[],
  searchQuery: string,
  selectedCategory: string
): MenuItemData[] => {
  return items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
};

/**
 * Get unique categories from menu items
 */
export const getCategories = (items: MenuItemData[]): string[] => {
  const categories = new Set(items.map(item => item.category));
  return ['All', ...Array.from(categories).sort()];
};

/**
 * Get category statistics
 */
export const getCategoryStats = (items: MenuItemData[]) => {
  const categories = getCategories(items).filter(cat => cat !== 'All');

  return categories.map(category => ({
    name: category,
    count: items.filter(item => item.category === category).length,
    percentage: Math.round(
      (items.filter(item => item.category === category).length / items.length) * 100
    ),
  }));
};

/**
 * Sort menu items by category
 */
export const sortByCategory = (items: MenuItemData[]): MenuItemData[] => {
  return [...items].sort((a, b) => a.category.localeCompare(b.category));
};

/**
 * Group menu items by category
 */
export const groupByCategory = (items: MenuItemData[]): { [key: string]: MenuItemData[] } => {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [key: string]: MenuItemData[] });
};

/**
 * Search menu items with scoring (for better search results)
 */
export const searchMenuItems = (items: MenuItemData[], query: string): MenuItemData[] => {
  if (!query.trim()) return items;

  const normalizedQuery = query.toLowerCase().trim();

  const scored = items
    .map(item => {
      let score = 0;

      // Exact title match
      if (item.title.toLowerCase() === normalizedQuery) {
        score += 1000;
      }

      // Title starts with query
      if (item.title.toLowerCase().startsWith(normalizedQuery)) {
        score += 500;
      }

      // Title includes query
      if (item.title.toLowerCase().includes(normalizedQuery)) {
        score += 250;
      }

      // Description includes query
      if (item.description.toLowerCase().includes(normalizedQuery)) {
        score += 100;
      }

      // Category matches
      if (item.category.toLowerCase().includes(normalizedQuery)) {
        score += 50;
      }

      return { item, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);

  return scored;
};

/**
 * Copy menu item link to clipboard
 */
export const copyMenuItemLink = async (path: string): Promise<boolean> => {
  try {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy link:', error);
    return false;
  }
};

/**
 * Export menu items as JSON
 */
export const exportMenuItems = (items: MenuItemData[]): void => {
  const dataStr = JSON.stringify(items, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `menu-items-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Get menu item statistics
 */
export const getMenuStats = (items: MenuItemData[]) => {
  const categories = getCategories(items).filter(cat => cat !== 'All');
  const itemsWithBadges = items.filter(item => item.badge);
  const itemsWithStats = items.filter(item => item.stats);

  return {
    totalItems: items.length,
    totalCategories: categories.length,
    itemsWithBadges: itemsWithBadges.length,
    itemsWithStats: itemsWithStats.length,
    categoryBreakdown: Object.fromEntries(
      categories.map(cat => [
        cat,
        items.filter(item => item.category === cat).length,
      ])
    ),
  };
};

/**
 * Validate menu item structure
 */
export const validateMenuItem = (item: any): item is MenuItemData => {
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.icon === 'string' &&
    typeof item.path === 'string' &&
    typeof item.category === 'string'
  );
};

/**
 * Check if user has access to menu item based on role
 */
export const canAccessMenuItem = (
  item: MenuItemData,
  userRoles?: string[]
): boolean => {
  if (!item.requiredRole || item.requiredRole.length === 0) {
    return true;
  }

  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  return item.requiredRole.some(role => userRoles.includes(role));
};

/**
 * Get accessible menu items for user
 */
export const getAccessibleMenuItems = (
  items: MenuItemData[],
  userRoles?: string[]
): MenuItemData[] => {
  return items.filter(item => canAccessMenuItem(item, userRoles));
};
