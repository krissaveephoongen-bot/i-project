import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  category: string;
  badge?: string;
  requiredRole?: string[];
}

export interface MenuFilter {
  searchQuery: string;
  selectedCategory: string;
  viewMode: 'grid' | 'list';
}

/**
 * Custom hook for menu management and navigation
 */
export const useMenu = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyVisited, setRecentlyVisited] = useState<MenuItem[]>([]);

  /**
   * Navigate to a menu item
   */
  const navigateTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  /**
   * Add menu item to favorites
   */
  const addToFavorites = useCallback((itemId: string) => {
    setFavorites(prev => {
      if (prev.includes(itemId)) {
        return prev;
      }
      return [...prev, itemId];
    });
  }, []);

  /**
   * Remove menu item from favorites
   */
  const removeFromFavorites = useCallback((itemId: string) => {
    setFavorites(prev => prev.filter(id => id !== itemId));
  }, []);

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback((itemId: string) => {
    if (favorites.includes(itemId)) {
      removeFromFavorites(itemId);
    } else {
      addToFavorites(itemId);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  /**
   * Add item to recently visited
   */
  const addToRecentlyVisited = useCallback((item: MenuItem) => {
    setRecentlyVisited(prev => {
      // Remove if already exists
      const filtered = prev.filter(x => x.id !== item.id);
      // Add to beginning and limit to 10 items
      return [item, ...filtered].slice(0, 10);
    });
  }, []);

  /**
   * Get recently visited items
   */
  const getRecentlyVisited = useCallback((): MenuItem[] => {
    return recentlyVisited;
  }, [recentlyVisited]);

  /**
   * Clear recently visited history
   */
  const clearRecentlyVisited = useCallback(() => {
    setRecentlyVisited([]);
  }, []);

  return {
    favorites,
    recentlyVisited,
    navigateTo,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite: (itemId: string) => favorites.includes(itemId),
    addToRecentlyVisited,
    getRecentlyVisited,
    clearRecentlyVisited,
  };
};

/**
 * Custom hook for menu filtering and search
 */
const debouncedSearch = debounce((query: string, callback: (query: string) => void) => {
  callback(query);
}, 300);

export const useMenuFilter = () => {
  const [filters, setFilters] = useState<MenuFilter>({
    searchQuery: '',
    selectedCategory: 'all',
    viewMode: 'grid',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize filter updates
  const updateFilters = useCallback((updates: Partial<MenuFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...updates,
    }));

    // Handle search query with debounce
    if (updates.searchQuery !== undefined) {
      debouncedSearch(updates.searchQuery, (query) => {
        setSearchQuery(query);
      });
    }
  }, []);

  // Memoize filtered items
  const filterItems = useCallback((items: MenuItem[]) => {
    return items.filter(item => {
      // Filter by category
      if (filters.selectedCategory && filters.selectedCategory !== 'all' && item.category !== filters.selectedCategory) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [filters.selectedCategory, searchQuery]);

  const getCategories = useCallback((items: MenuItem[]): string[] => {
    const categories = ['All', ...new Set(items.map(item => item.category))];
    return categories;
  }, []);

   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setViewMode('grid');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    filterItems,
    getCategories,
    resetFilters,
  };
};

/**
 * Custom hook for menu statistics
 */
export interface MenuStats {
  totalItems: number;
  itemsByCategory: { [key: string]: number };
  favoritesCount: number;
  recentlyVisitedCount: number;
}

export const useMenuStats = (items: MenuItem[], favorites: string[], recentlyVisited: MenuItem[]) => {
  const getStats = useCallback((): MenuStats => {
    const itemsByCategory: { [key: string]: number } = {};
    
    items.forEach(item => {
      itemsByCategory[item.category] = (itemsByCategory[item.category] || 0) + 1;
    });

    return {
      totalItems: items.length,
      itemsByCategory,
      favoritesCount: favorites.length,
      recentlyVisitedCount: recentlyVisited.length,
    };
  }, [items, favorites, recentlyVisited]);

  return { getStats };
};
