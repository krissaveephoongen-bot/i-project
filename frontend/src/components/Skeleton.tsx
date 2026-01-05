import React from 'react';

interface SkeletonProps {
  count?: number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  height = '1rem',
  circle = false,
  className = '',
}) => {
  const heightValue = typeof height === 'number' ? `${height}px` : height;
  const isCircle = circle ? 'rounded-full' : 'rounded';

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${isCircle}`}
          style={{ height: heightValue, width: circle ? heightValue : '100%' }}
        />
      ))}
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4 animate-pulse"
        >
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
