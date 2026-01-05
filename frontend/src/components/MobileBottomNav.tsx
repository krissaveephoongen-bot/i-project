import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Plus,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    title: 'Projects',
    icon: FolderKanban,
    path: '/projects',
  },
  {
    title: 'Timesheet',
    icon: CheckSquare,
    path: '/timesheet',
  },
  {
    title: 'Expenses',
    icon: Users,
    path: '/expenses',
  },
  {
    title: 'More',
    icon: MoreHorizontal,
    path: '/search',
  },
];

interface MobileBottomNavProps {
  className?: string;
}

const MobileBottomNav = ({ className }: MobileBottomNavProps) => {
  const location = useLocation();

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom',
      'lg:hidden shadow-lg',
      className
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          // Special handling for main navigation items
          const isMainNav = ['/dashboard', '/projects', '/timesheet', '/expenses'].includes(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 min-w-0 h-full px-2 transition-colors',
                'relative group'
              )}
            >
              <div className={cn(
                'flex flex-col items-center justify-center relative',
                isActive && isMainNav && 'scale-110'
              )}>
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
                
                <Icon className={cn(
                  'h-5 w-5 mb-1 transition-colors',
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 group-hover:text-gray-700'
                )} />
                
                <span className={cn(
                  'text-xs font-medium transition-colors truncate max-w-[4rem]',
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 group-hover:text-gray-700'
                )}>
                  {item.title}
                </span>
                
                {/* Badge for notifications (projects) */}
                {item.title === 'Projects' && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center min-w-[1rem] bg-blue-500"
                  >
                    2
                  </Badge>
                )}
              </div>
              
              {/* Ripple effect on tap */}
              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-active:opacity-100 rounded-lg transition-opacity"></div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;