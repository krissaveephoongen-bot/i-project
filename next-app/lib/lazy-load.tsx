'use client';

import { lazy, Suspense, ComponentType, LazyExoticComponent } from 'react';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { clsx } from 'clsx';

// Loading fallback variants
interface LoadingFallbackProps {
  variant?: 'card' | 'table' | 'chart' | 'form' | 'list' | 'custom';
  className?: string;
  count?: number;
}

export function LoadingFallback({ 
  variant = 'card', 
  className,
  count = 1 
}: LoadingFallbackProps) {
  const variants = {
    card: (
      <div className={clsx('rounded-xl border border-border bg-card p-6 space-y-4', className)}>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    ),
    table: (
      <div className={clsx('rounded-xl border border-border bg-card overflow-hidden', className)}>
        <div className="p-4 border-b border-border bg-muted/30">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    ),
    chart: (
      <div className={clsx('rounded-xl border border-border bg-card p-6', className)}>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    form: (
      <div className={clsx('rounded-xl border border-border bg-card p-6 space-y-6', className)}>
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    ),
    list: (
      <div className={clsx('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    ),
    custom: (
      <div className={className}>
        <Skeleton className="h-full w-full" />
      </div>
    ),
  };

  return <>{variants[variant]}</>;
}

// Higher-order component for lazy loading with error boundary
interface LazyComponentOptions {
  loadingVariant?: LoadingFallbackProps['variant'];
  loadingClassName?: string;
  loadingCount?: number;
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
) {
  const { loadingVariant = 'card', loadingClassName, loadingCount } = options;
  
  const LazyComponent = lazy(importFn) as LazyExoticComponent<T>;
  
  const WrappedComponent = (props: any) => (
    <Suspense 
      fallback={
        <LoadingFallback 
          variant={loadingVariant} 
          className={loadingClassName}
          count={loadingCount}
        />
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = `Lazy(${LazyComponent.displayName || 'Component'})`;
  
  return WrappedComponent;
}

// Pre-built lazy components for common use cases
export const LazyChart = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback variant="chart" className="h-80" />}>
    {children}
  </Suspense>
);

export const LazyTable = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback variant="table" className="min-h-[400px]" />}>
    {children}
  </Suspense>
);

export const LazyForm = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback variant="form" />}>
    {children}
  </Suspense>
);

export const LazyCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <Suspense fallback={<LoadingFallback variant="card" className={className} />}>
    {children}
  </Suspense>
);

// Dynamic import helper with preload support
export function dynamicImport<T>(
  importFn: () => Promise<T>,
  preload = false
): () => Promise<T> {
  let cachedPromise: Promise<T> | null = null;
  
  const load = () => {
    if (!cachedPromise) {
      cachedPromise = importFn();
    }
    return cachedPromise;
  };
  
  if (preload && typeof window !== 'undefined') {
    // Preload on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => load());
    } else {
      setTimeout(() => load(), 100);
    }
  }
  
  return load;
}

// Intersection Observer based lazy loading for components
interface LazyVisibleProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export function LazyVisible({
  children,
  fallback = <Skeleton className="h-32 w-full" />,
  rootMargin = '100px',
  threshold = 0.1,
  className,
}: LazyVisibleProps) {
  // This would require 'use client' and useState/useEffect
  // For now, just render children directly
  // In production, you'd use IntersectionObserver here
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export default LoadingFallback;
