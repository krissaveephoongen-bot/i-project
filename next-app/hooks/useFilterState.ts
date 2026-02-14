import { useState, useCallback, useMemo } from 'react';

interface FilterState {
  search: string;
  filters: Record<string, string>;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

interface UseFilterStateOptions {
  initialFilters?: Record<string, string>;
  onFilterChange?: (state: FilterState) => void;
}

export function useFilterState(options: UseFilterStateOptions = {}) {
  const { initialFilters = {}, onFilterChange } = options;
  
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      onFilterChange?.({ search, filters: newFilters, dateRange });
      return newFilters;
    });
  }, [search, dateRange, onFilterChange]);

  const updateSearch = useCallback((value: string) => {
    setSearch(value);
    onFilterChange?.({ search: value, filters, dateRange });
  }, [filters, dateRange, onFilterChange]);

  const updateDateRange = useCallback((range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    onFilterChange?.({ search, filters, dateRange: range });
  }, [search, filters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setFilters(initialFilters);
    setDateRange({ from: undefined, to: undefined });
    onFilterChange?.({ search: '', filters: initialFilters, dateRange: { from: undefined, to: undefined } });
  }, [initialFilters, onFilterChange]);

  const activeFiltersCount = useMemo(() => {
    const activeSearch = search ? 1 : 0;
    const activeDropdownFilters = Object.values(filters).filter(value => value && value !== 'all').length;
    const activeDateFilter = (dateRange?.from || dateRange?.to) ? 1 : 0;
    return activeSearch + activeDropdownFilters + activeDateFilter;
  }, [search, filters, dateRange]);

  const hasActiveFilters = activeFiltersCount > 0;

  const filterState = useMemo(() => ({
    search,
    filters,
    dateRange,
    activeFiltersCount,
    hasActiveFilters,
  }), [search, filters, dateRange, activeFiltersCount]);

  return {
    // State
    ...filterState,
    
    // Actions
    updateFilter,
    updateSearch,
    updateDateRange,
    clearAllFilters,
    
    // Utilities
    setFilters,
    setSearch,
    setDateRange,
  };
}
