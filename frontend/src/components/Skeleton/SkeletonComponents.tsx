/**
 * Skeleton Loading Components
 * 
 * Provides various skeleton components for showing placeholder UI
 * while data is being loaded.
 */

import React from 'react';

// Base skeleton props
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

/**
 * Individual skeleton component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  animation = 'pulse',
  width,
  height,
}) => {
  const baseStyles = 'bg-slate-700';
  
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };
  
  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-[wave_1.5s_ease-in-out_infinite]',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={style}
    />
  );
};

/**
 * Skeleton text with multiple lines
 */
export const SkeletonText: React.FC<{
  lines?: number;
  spacing?: string;
  className?: string;
}> = ({ lines = 3, spacing = '1rem', className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant={i === lines - 1 && lines > 1 ? 'text' : 'rounded'}
          width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
          height="1em"
        />
      ))}
    </div>
  );
};

/**
 * Skeleton card component
 */
export const SkeletonCard: React.FC<{
  showImage?: boolean;
  showHeader?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
}> = ({ 
  showImage = true, 
  showHeader = true, 
  showContent = true, 
  showFooter = true 
}) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
      {showImage && (
        <Skeleton 
          variant="rounded" 
          width="100%" 
          height="160px" 
        />
      )}
      {showHeader && (
        <div className="space-y-2">
          <Skeleton variant="rounded" width="70%" height="24px" />
          <Skeleton variant="text" width="40%" />
        </div>
      )}
      {showContent && <SkeletonText lines={3} />}
      {showFooter && (
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rounded" width="80px" height="36px" />
          <Skeleton variant="rounded" width="80px" height="36px" />
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton table component
 */
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}> = ({ rows = 5, columns = 4, showHeader = true }) => {
  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex gap-4 border-b border-slate-700 pb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton 
              key={i} 
              variant="text" 
              width={`${100 / columns}%`} 
              height="20px" 
            />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="text" 
              width={`${100 / columns}%`} 
              height="16px" 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton list component
 */
export const SkeletonList: React.FC<{
  items?: number;
  showAvatar?: boolean;
}> = ({ items = 5, showAvatar = true }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          {showAvatar && (
            <Skeleton 
              variant="circular" 
              width="40px" 
              height="40px" 
            />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" height="16px" />
            <Skeleton variant="text" width="60%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton stats/analytics component
 */
export const SkeletonStats: React.FC<{
  items?: number;
}> = ({ items = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-slate-800/50 rounded-lg p-4 space-y-2">
          <Skeleton variant="text" width="50%" height="12px" />
          <Skeleton variant="rounded" width="80%" height="32px" />
          <Skeleton variant="text" width="60%" height="12px" />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton chart component
 */
export const SkeletonChart: React.FC<{
  height?: string;
}> = ({ height = '300px' }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton variant="rounded" width="150px" height="24px" />
        <Skeleton variant="rounded" width="100px" height="32px" />
      </div>
      <div 
        className="bg-slate-700/50 rounded-lg flex items-end justify-between p-4 gap-2"
        style={{ height }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width="8%"
            height={`${20 + Math.random() * 60}%`}
            animation="pulse"
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton form component
 */
export const SkeletonForm: React.FC<{
  fields?: number;
  showButtons?: boolean;
}> = ({ fields = 4, showButtons = true }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="100px" height="16px" />
          <Skeleton variant="rounded" width="100%" height="40px" />
        </div>
      ))}
      {showButtons && (
        <div className="flex gap-3 pt-4">
          <Skeleton variant="rounded" width="100px" height="40px" />
          <Skeleton variant="rounded" width="100px" height="40px" />
        </div>
      )}
    </div>
  );
};

/**
 * Dashboard skeleton layout
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="rounded" width="200px" height="32px" />
          <Skeleton variant="text" width="150px" />
        </div>
        <Skeleton variant="rounded" width="120px" height="40px" />
      </div>

      {/* Stats */}
      <SkeletonStats items={4} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <SkeletonChart height="250px" />
        </div>
        
        {/* Side list */}
        <div className="bg-slate-800/50 rounded-xl p-4">
          <Skeleton variant="rounded" width="120px" height="24px" className="mb-4" />
          <SkeletonList items={5} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 rounded-xl p-4">
        <Skeleton variant="rounded" width="150px" height="24px" className="mb-4" />
        <SkeletonTable rows={5} columns={4} />
      </div>
    </div>
  );
};

// Export all skeleton components
export default {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonStats,
  SkeletonChart,
  SkeletonForm,
  DashboardSkeleton,
};
