import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Search,
  FolderOpen,
  Inbox,
  Calendar,
  Star,
  Plus,
  AlertCircle,
} from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'no-data' | 'coming-soon' | 'error';
}

const iconMap = {
  default: FolderOpen,
  search: Search,
  'no-data': Inbox,
  'coming-soon': Calendar,
  error: AlertCircle,
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const defaultIcon = iconMap[variant];
  const IconComponent = Icon || defaultIcon;

  const variantStyles = {
    default: {
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-400 dark:text-gray-600',
      titleColor: 'text-gray-900 dark:text-white',
      descColor: 'text-gray-600 dark:text-gray-400',
    },
    search: {
      iconBg: 'bg-primary-100 dark:bg-primary-900/20',
      iconColor: 'text-primary-400 dark:text-primary-600',
      titleColor: 'text-gray-900 dark:text-white',
      descColor: 'text-gray-600 dark:text-gray-400',
    },
    'no-data': {
      iconBg: 'bg-warning-100 dark:bg-warning-900/20',
      iconColor: 'text-warning-400 dark:text-warning-600',
      titleColor: 'text-gray-900 dark:text-white',
      descColor: 'text-gray-600 dark:text-gray-400',
    },
    'coming-soon': {
      iconBg: 'bg-secondary-100 dark:bg-secondary-900/20',
      iconColor: 'text-secondary-400 dark:text-secondary-600',
      titleColor: 'text-gray-900 dark:text-white',
      descColor: 'text-gray-600 dark:text-gray-400',
    },
    error: {
      iconBg: 'bg-error-100 dark:bg-error-900/20',
      iconColor: 'text-error-400 dark:text-error-600',
      titleColor: 'text-gray-900 dark:text-white',
      descColor: 'text-gray-600 dark:text-gray-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <Card className="p-12 text-center">
      <div className={`p-4 ${style.iconBg} rounded-full w-fit mx-auto mb-4`}>
        <IconComponent className={`h-8 w-8 ${style.iconColor}`} />
      </div>

      <h3 className={`text-lg font-semibold ${style.titleColor} mb-2`}>
        {title}
      </h3>

      {description && (
        <p className={`${style.descColor} mb-6 max-w-sm mx-auto`}>
          {description}
        </p>
      )}

      {action && (
        <Button onClick={action.onClick} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </Card>
  );
}

/**
 * Empty state variants
 */

export function EmptySearchResults() {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description="Try searching with different keywords or adjust your filters"
      icon={Search}
    />
  );
}

export function EmptyDataState({ action }: { action?: EmptyStateProps['action'] }) {
  return (
    <EmptyState
      variant="no-data"
      title="No data available"
      description="There is no data to display at the moment"
      action={action}
    />
  );
}

export function ComingSoonState() {
  return (
    <EmptyState
      variant="coming-soon"
      title="Coming soon"
      description="This feature is currently under development and will be available soon"
    />
  );
}

export function ErrorState({ retry }: { retry?: () => void }) {
  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description="An error occurred while loading this content. Please try again."
      action={retry ? { label: 'Retry', onClick: retry } : undefined}
    />
  );
}

/**
 * Empty list state
 */
export function EmptyListState({
  title = 'No items',
  description = 'There are no items to display',
  action,
}: {
  title?: string;
  description?: string;
  action?: EmptyStateProps['action'];
}) {
  return (
    <div className="text-center py-12">
      <Inbox className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p className="text-gray-900 dark:text-white font-semibold mb-2">{title}</p>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
