import { cn } from '../../lib/utils';

/**
 * Skeleton loader for card items
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse', className)}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for grid items (multiple cards)
 */
export function GridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  const columnClass =
    columns === 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1';

  return (
    <div className={`grid ${columnClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for list items
 */
export function ListItemSkeleton() {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for list (multiple items)
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for page content
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>

      {/* Controls */}
      <div className="flex gap-2 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40" />
      </div>

      {/* Content Grid */}
      <GridSkeleton count={6} />
    </div>
  );
}

/**
 * Skeleton loader for stats card
 */
export function StatsSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for table
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 animate-pulse">
        <div className="flex gap-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for search results
 */
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default {
  CardSkeleton,
  GridSkeleton,
  ListItemSkeleton,
  ListSkeleton,
  PageSkeleton,
  StatsSkeleton,
  TableSkeleton,
  SearchResultsSkeleton,
};
