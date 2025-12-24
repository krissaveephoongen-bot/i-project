import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  BarChart3,
  Users,
  DollarSign,
  Settings,
  Search as SearchIcon,
  ChevronRight,
  Home,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    category: 'Main',
  },
  {
    title: 'Projects',
    path: '/projects',
    icon: FolderKanban,
    category: 'Projects',
    children: [
      { title: 'All Projects', path: '/projects', icon: FolderKanban, category: 'Projects' },
      { title: 'My Projects', path: '/projects/my-projects', icon: FolderKanban, category: 'Projects' },
      { title: 'Create Project', path: '/projects/create', icon: FolderKanban, category: 'Projects' },
      { title: 'Project Table', path: '/projects/table', icon: FolderKanban, category: 'Projects' },
    ],
  },
  {
    title: 'Time & Expenses',
    path: '/timesheet',
    icon: Clock,
    category: 'Time & Expenses',
    children: [
      { title: 'Timesheet', path: '/timesheet', icon: Clock, category: 'Time & Expenses' },
      { title: 'Expenses', path: '/expenses', icon: DollarSign, category: 'Time & Expenses' },
      { title: 'Cost Management', path: '/cost-management', icon: DollarSign, category: 'Time & Expenses' },
    ],
  },
  {
    title: 'Resources',
    path: '/resources',
    icon: Users,
    category: 'Resources',
    children: [
      { title: 'Resource Management', path: '/resources', icon: Users, category: 'Resources' },
      { title: 'Team Members', path: '/resources/team', icon: Users, category: 'Resources' },
      { title: 'Allocation', path: '/resources/allocation', icon: Users, category: 'Resources' },
    ],
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    category: 'Analytics',
    children: [
      { title: 'Reports', path: '/reports', icon: BarChart3, category: 'Analytics' },
      { title: 'Analytics', path: '/analytics', icon: BarChart3, category: 'Analytics' },
      { title: 'Activity Log', path: '/activity', icon: SearchIcon, category: 'Analytics' },
    ],
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    category: 'Settings',
  },
];

interface EnhancedNavigationProps {
  className?: string;
  collapsed?: boolean;
}

export const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({ className = '', collapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('navExpandedCategories') || '[]'))
  );

  const currentPath = location.pathname;

  // Find current page info
  const currentPageInfo = useMemo(() => {
    const flattenedItems = navItems.flatMap(item => [item, ...(item.children || [])]);
    const current = flattenedItems.find(item => item.path === currentPath);
    return current;
  }, [currentPath]);

  const getBreadcrumbs = () => {
    const crumbs = [{ title: 'Home', path: '/dashboard', icon: Home }];
    const flattenedItems = navItems.flatMap(item => [item, ...(item.children || [])]);
    const current = flattenedItems.find(item => item.path === currentPath);
    if (current) {
      crumbs.push(current);
    }
    return crumbs;
  };

  const toggleCategory = (category: string) => {
    const updated = new Set(expandedCategories);
    if (updated.has(category)) {
      updated.delete(category);
    } else {
      updated.add(category);
    }
    setExpandedCategories(updated);
    localStorage.setItem('navExpandedCategories', JSON.stringify(Array.from(updated)));
  };

  const isPathActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {getBreadcrumbs().map((crumb, idx) => {
            const Icon = crumb.icon;
            return (
              <div key={crumb.path} className="flex items-center gap-2 whitespace-nowrap">
                {idx > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                <button
                  onClick={() => navigate(crumb.path)}
                  className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
                    isPathActive(crumb.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{crumb.title}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Page Indicator */}
      {currentPageInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentPageInfo && <currentPageInfo.icon className="h-6 w-6 text-blue-600" />}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{currentPageInfo?.title}</h2>
                <p className="text-sm text-gray-600">{currentPageInfo?.category}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white">
              Current Page
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      {!collapsed && (
        <div className="bg-white border-b border-gray-200">
          <div className="overflow-x-auto">
            <div className="flex gap-1 px-4 py-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = isPathActive(item.path);
                const isExpanded = expandedCategories.has(item.category);

                return (
                  <div key={item.path}>
                    <button
                      onClick={() => {
                        if (item.children?.length) {
                          toggleCategory(item.category);
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.children && item.children.length > 0 && (
                        <span className="text-xs ml-1">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      )}
                    </button>

                    {/* Submenu */}
                    {isExpanded && item.children && item.children.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map(subItem => {
                          const SubIcon = subItem.icon;
                          return (
                            <button
                              key={subItem.path}
                              onClick={() => navigate(subItem.path)}
                              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm w-full text-left transition-colors ${
                                isPathActive(subItem.path)
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <SubIcon className="h-3 w-3" />
                              <span>{subItem.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNavigation;
