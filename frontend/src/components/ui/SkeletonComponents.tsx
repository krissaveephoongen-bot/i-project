import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        'animate-pulse',
        'bg-gray-200',
        'rounded-lg',
        className
      )}
    >
      {children}
    </div>
  );
};

interface SkeletonTextProps {
  className?: string;
  lines?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ className, lines = 1 }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  className?: string;
  children?: React.ReactNode;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        'bg-white',
        'rounded-lg',
        'shadow-sm',
        'border',
        'border-gray-200',
        'p-6',
        className
      )}
    >
      {children}
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="bg-white rounded-lg shadow-sm border border border-gray-200 p-6">
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-gray-200 rounded animate-pulse flex-1"
                  style={{ width: `${Math.random() * 100 + 100}px` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div
      className={cn(
        'bg-gray-200',
        'rounded-full',
        'animate-pulse',
        sizeClasses[size],
        className
      )}
    />
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin',
          'rounded-full',
          'border-2',
          'border-gray-300',
          'border-t-blue-600',
          sizeClasses[size]
        )}
        >
        <div className="sr-only">Loading...</div>
      </div>
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'กำลังงาน...', 
  submessage,
  className 
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">{message}</p>
          {submessage && (
            <p className="text-sm text-gray-600">{submessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon,
  title = 'ไม่มีข้อมูล',
  description = 'ไม่พบข้อมูลที่ต้องการค้นหา',
  action,
  className 
}) => {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="max-w-md mx-auto">
        {icon && (
          <div className="flex justify-center mb-4">
            <div className="text-gray-400">
              {icon}
            </div>
          </div>
        )}
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        {action && (
          <div className="flex justify-center">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonAvatar,
  LoadingSpinner,
  LoadingState,
  EmptyState
};
