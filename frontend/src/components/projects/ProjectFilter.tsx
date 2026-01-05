import { useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Search, X, ChevronDown } from 'lucide-react';

export interface ProjectFilters {
  search: string;
  status: string;
  priority: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ProjectFilterProps {
  filters: ProjectFilters;
  onFilterChange: (filters: ProjectFilters) => void;
  onReset: () => void;
}

/**
 * ProjectFilter Component
 * Provides advanced filtering and sorting options for projects
 */
export function ProjectFilter({ filters, onFilterChange, onReset }: ProjectFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  const handlePriorityChange = (value: string) => {
    onFilterChange({ ...filters, priority: value });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value });
  };

  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    onFilterChange({ ...filters, sortOrder: value });
  };

  const activeFilterCount = [
    filters.search !== '',
    filters.status !== 'all',
    filters.priority !== 'all',
    filters.sortBy !== 'name',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Toggle Advanced Filters */}
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full sm:w-auto"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          <span className="hidden sm:inline ml-2">Filters</span>
          {activeFilterCount > 1 && (
            <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-700">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <Select value={filters.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Project Name</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="team">Team Size</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <Select value={filters.sortOrder} onValueChange={handleSortOrderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort order..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {activeFilterCount > 0 ? (
              <p>
                Applied filters:
                {filters.search && <span className="font-medium"> search</span>}
                {filters.status !== 'all' && <span className="font-medium">, status</span>}
                {filters.priority !== 'all' && <span className="font-medium">, priority</span>}
                {filters.sortBy !== 'name' && <span className="font-medium">, sorted</span>}
              </p>
            ) : (
              <p>No filters applied</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
