import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from './ui/button';

export interface SearchFilters {
  query: string;
  status?: string;
  priority?: string;
  assignee?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  entityType?: 'project' | 'task' | 'all';
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
  showAdvanced?: boolean;
}

export function AdvancedSearch({
  onSearch,
  placeholder = 'Search projects, tasks...',
  showAdvanced = true,
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: '',
    priority: '',
    assignee: '',
    entityType: 'all',
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch({ ...filters, query });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters, onSearch]);

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? '' : status,
    }));
  };

  const handlePriorityChange = (priority: string) => {
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority === priority ? '' : priority,
    }));
  };

  const handleEntityTypeChange = (type: 'project' | 'task' | 'all') => {
    setFilters((prev) => ({
      ...prev,
      entityType: type,
    }));
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({
      query: '',
      status: '',
      priority: '',
      assignee: '',
      entityType: 'all',
    });
  };

  const hasActiveFilters = query || filters.status || filters.priority || filters.entityType !== 'all';

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                Active
              </span>
            )}
          </Button>

          {showFilters && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Entity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Type
                </label>
                <div className="flex gap-2">
                  {(['all', 'project', 'task'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={filters.entityType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleEntityTypeChange(type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['todo', 'in_progress', 'in_review', 'done'].map((status) => (
                    <Button
                      key={status}
                      variant={filters.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange(status)}
                      className="capitalize"
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <Button
                      key={priority}
                      variant={filters.priority === priority ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePriorityChange(priority)}
                      className="capitalize"
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
