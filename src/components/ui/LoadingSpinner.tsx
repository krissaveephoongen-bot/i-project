import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ className, size = 24, fullScreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      style={{ width: size, height: size }}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
