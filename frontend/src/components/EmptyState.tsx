import React from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 
  | 'default'
  | 'noProjects' 
  | 'noTasks'
  | 'noCustomers'
  | 'noUsers'
  | 'noTeams'
  | 'noTimesheets'
  | 'noExpenses'
  | 'noResources'
  | 'noReports'
  | 'noSearchResults'
  | 'databaseEmpty'
  | 'permissionDenied'
  | 'offline';

interface EmptyStateProps {
  /** Icon to display (emoji, SVG, or React component) */
  icon?: string | React.ReactNode;
  /** Main title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Visual variant */
  variant?: EmptyStateVariant;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// Predefined empty state configurations
const EMPTY_STATE_CONFIG: Record<EmptyStateVariant, { icon: string; title: string; description: string }> = {
  noProjects: {
    icon: '📁',
    title: 'No Projects Yet',
    description: 'Get started by creating your first project to track tasks, deadlines, and team progress.',
  },
  noTasks: {
    icon: '✓',
    title: 'No Tasks Found',
    description: 'Create your first task to start tracking your work and collaborating with your team.',
  },
  noCustomers: {
    icon: '🏢',
    title: 'No Customers',
    description: 'Add your first customer to start managing relationships and tracking interactions.',
  },
  noUsers: {
    icon: '👥',
    title: 'No Team Members',
    description: 'Invite team members to collaborate on projects and share responsibilities.',
  },
  noTeams: {
    icon: '👨‍👩‍👧‍👦',
    title: 'No Teams',
    description: 'Create your first team to organize members and assign projects effectively.',
  },
  noTimesheets: {
    icon: '⏱️',
    title: 'No Timesheets',
    description: 'Start logging your time to track hours and generate reports.',
  },
  noExpenses: {
    icon: '💰',
    title: 'No Expenses',
    description: 'Record your first expense to track project costs and budgets.',
  },
  noResources: {
    icon: '📦',
    title: 'No Resources',
    description: 'Add resources to track equipment, materials, and allocations.',
  },
  noReports: {
    icon: '📋',
    title: 'No Reports',
    description: 'Generate your first report to analyze project performance and metrics.',
  },
  noSearchResults: {
    icon: '🔍',
    title: 'No Results Found',
    description: 'Try adjusting your search or filter criteria to find what you\'re looking for.',
  },
  databaseEmpty: {
    icon: '🗄️',
    title: 'Database is Empty',
    description: 'This section has no data yet. Start by adding your first item.',
  },
  permissionDenied: {
    icon: '🔒',
    title: 'Access Restricted',
    description: 'You don\'t have permission to view this content. Contact your administrator for access.',
  },
  offline: {
    icon: '📡',
    title: 'You\'re Offline',
    description: 'Check your internet connection and try again.',
  },
  default: {
    icon: '📭',
    title: 'No Data',
    description: 'There\'s nothing here yet.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
  size = 'md',
}) => {
  // Get preset config if variant is specified
  const preset = EMPTY_STATE_CONFIG[variant];
  const displayIcon = icon || preset?.icon || '📭';
  const displayTitle = title || preset?.title || 'No Data';
  const displayDescription = description || preset?.description;

  // Size classes
  const sizeClasses = {
    sm: { container: 'py-6 px-4', icon: 'text-3xl', title: 'text-sm', description: 'text-xs', maxWidth: 'max-w-sm' },
    md: { container: 'py-12 px-4', icon: 'text-5xl', title: 'text-lg', description: 'text-sm', maxWidth: 'max-w-md' },
    lg: { container: 'py-16 px-6', icon: 'text-7xl', title: 'text-xl', description: 'text-base', maxWidth: 'max-w-lg' },
  };

  const { container, icon: iconClass, title: titleClass, description: descriptionClass, maxWidth } = sizeClasses[size];

  return (
    <div className={cn('flex items-center justify-center', container, className)}>
      <div className={cn('text-center', maxWidth)}>
        {/* Icon */}
        <div className={cn('mb-4', iconClass)}>
          {typeof displayIcon === 'string' ? (
            <span role="img" aria-label="empty state icon">
              {displayIcon}
            </span>
          ) : (
            displayIcon
          )}
        </div>

        {/* Title */}
        <h3 className={cn('font-semibold text-gray-900 dark:text-white mb-2', titleClass)}>
          {displayTitle}
        </h3>

        {/* Description */}
        {displayDescription && (
          <p className={cn('text-gray-600 dark:text-gray-400 mb-6', descriptionClass)}>
            {displayDescription}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 justify-center">
            {action && (
              <Button onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button onClick={secondaryAction.onClick} variant="outline">
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Convenience components for common empty states
export const NoProjects: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="noProjects" action={action} />
);

export const NoTasks: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="noTasks" action={action} />
);

export const NoCustomers: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="noCustomers" action={action} />
);

export const NoUsers: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="noUsers" action={action} />
);

export const NoTeams: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="noTeams" action={action} />
);

export const NoTimesheets: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="noTimesheets" action={action} />
);

export const NoExpenses: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="noExpenses" action={action} />
);

export const NoResources: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="noResources" action={action} />
);

export const NoReports: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="noReports" action={action} />
);

export const NoSearchResults: React.FC<{ searchTerm?: string; action?: { label: string; onClick: () => void } }> = ({ searchTerm, action }) => (
  <EmptyState
    variant="noSearchResults"
    description={searchTerm ? `No results found for "${searchTerm}". Try a different search term.` : undefined}
    action={action}
  />
);

export const DatabaseEmpty: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="databaseEmpty" action={action} />
);

export const PermissionDenied: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="permissionDenied" action={action} />
);

export const Offline: React.FC<{ action?: { label: string; onClick: () => void } }> = ({ action }) => (
  <EmptyState variant="offline" action={action} />
);

export default EmptyState;
