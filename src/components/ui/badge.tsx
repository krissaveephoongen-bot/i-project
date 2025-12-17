import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
        secondary: 'border-transparent bg-secondary-600 text-white hover:bg-secondary-700 dark:bg-secondary-500 dark:hover:bg-secondary-600',
        destructive: 'border-transparent bg-error-600 text-white hover:bg-error-700 dark:bg-error-500 dark:hover:bg-error-600',
        outline: 'border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800',
        success: 'border-transparent bg-success-100 text-success-800 hover:bg-success-200 dark:bg-success-900/30 dark:text-success-200',
        warning: 'border-transparent bg-warning-100 text-warning-800 hover:bg-warning-200 dark:bg-warning-900/30 dark:text-warning-200',
        info: 'border-transparent bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-200',
        error: 'border-transparent bg-error-100 text-error-800 hover:bg-error-200 dark:bg-error-900/30 dark:text-error-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
