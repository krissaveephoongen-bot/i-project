import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  FolderKanban,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface MenuStatItem {
  id: string;
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  description?: string;
}

interface MenuStatsProps {
  items?: MenuStatItem[];
  compact?: boolean;
}

const defaultStats: MenuStatItem[] = [
  {
    id: 'active-projects',
    title: 'Active Projects',
    value: '12',
    icon: FolderKanban,
    trend: 'up',
    trendValue: '+3 this month',
    color: 'primary',
    description: 'Projects in progress',
  },
  {
    id: 'hours-logged',
    title: 'Hours This Week',
    value: '38h',
    icon: Clock,
    trend: 'up',
    trendValue: '+2h vs last week',
    color: 'success',
    description: 'Total billable hours',
  },
  {
    id: 'expenses-pending',
    title: 'Pending Expenses',
    value: '5',
    icon: DollarSign,
    trend: 'down',
    trendValue: '-2 since yesterday',
    color: 'warning',
    description: 'Awaiting approval',
  },
  {
    id: 'team-members',
    title: 'Team Members',
    value: '24',
    icon: Users,
    color: 'secondary',
    description: 'Active users',
  },
  {
    id: 'reports-generated',
    title: 'Reports This Month',
    value: '8',
    icon: BarChart3,
    trend: 'up',
    trendValue: '+2',
    color: 'primary',
    description: 'Performance reports',
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    value: '156',
    icon: Activity,
    color: 'error',
    description: 'System events',
  },
];

const getColorClasses = (color: string, dark: boolean = false) => {
  const colorMap: { [key: string]: { light: string; dark: string } } = {
    primary: {
      light: 'bg-primary-50',
      dark: 'dark:bg-primary-900/20',
    },
    secondary: {
      light: 'bg-secondary-50',
      dark: 'dark:bg-secondary-900/20',
    },
    success: {
      light: 'bg-success-100',
      dark: 'dark:bg-success-900/20',
    },
    warning: {
      light: 'bg-warning-100',
      dark: 'dark:bg-warning-900/20',
    },
    error: {
      light: 'bg-error-50',
      dark: 'dark:bg-error-900/20',
    },
  };
  const colors = colorMap[color] || colorMap.primary;
  return dark ? colors.dark : colors.light;
};

const getIconColorClasses = (color: string) => {
  const colorMap: { [key: string]: string } = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
  };
  return colorMap[color] || colorMap.primary;
};

export const MenuStats = ({ items = defaultStats, compact = false }: MenuStatsProps) => {
  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id} className={`p-4 ${getColorClasses(stat.color)}`}>
              <div className="flex flex-col items-center text-center gap-2">
                <Icon className={`h-5 w-5 ${getIconColorClasses(stat.color)}`} />
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {stat.title}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(stat => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

        return (
          <Card
            key={stat.id}
            className={`p-6 border-l-4 ${
              stat.color === 'primary'
                ? 'border-l-primary-600'
                : stat.color === 'secondary'
                ? 'border-l-secondary-600'
                : stat.color === 'success'
                ? 'border-l-success-600'
                : stat.color === 'warning'
                ? 'border-l-warning-600'
                : 'border-l-error-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {stat.description}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)} ${getColorClasses(stat.color, true)}`}>
                <Icon className={`h-6 w-6 ${getIconColorClasses(stat.color)}`} />
              </div>
            </div>

            {stat.trend && stat.trendValue && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <TrendIcon className={`h-4 w-4 ${
                  stat.trend === 'up'
                    ? 'text-success-600'
                    : 'text-error-600'
                }`} />
                <span className={`text-sm font-medium ${
                  stat.trend === 'up'
                    ? 'text-success-700 dark:text-success-400'
                    : 'text-error-700 dark:text-error-400'
                }`}>
                  {stat.trendValue}
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default MenuStats;
