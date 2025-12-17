import { cn } from '../../lib/utils';

interface LoadingStateProps {
  className?: string;
  text?: string;
}

export function LoadingState({ className, text = 'Loading...' }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-sm text-gray-500">{text}</p>
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
