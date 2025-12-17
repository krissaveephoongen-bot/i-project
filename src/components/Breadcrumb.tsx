import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1">
        {/* Home link */}
        <li>
          <Link to="/dashboard" className="inline-flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-0"
              title="Dashboard"
            >
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />

            {item.href && !item.isActive ? (
              <Link to={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  {item.label}
                </Button>
              </Link>
            ) : (
              <span
                className={`px-1 py-1 rounded text-gray-900 dark:text-white ${
                  item.isActive ? 'font-semibold' : ''
                }`}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Breadcrumb with custom items
 */
export function SimpleBreadcrumb({
  current,
  parent,
}: {
  current: string;
  parent?: string;
}) {
  const items: BreadcrumbItem[] = [];

  if (parent) {
    items.push({ label: parent });
  }

  items.push({ label: current, isActive: true });

  return <Breadcrumb items={items} />;
}

export default Breadcrumb;
