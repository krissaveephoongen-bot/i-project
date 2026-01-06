import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  FileText, 
  Calendar, 
  BarChart3, 
  Clock, 
  CheckSquare, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Plus,
  Search,
  Menu,
  X,
  FolderKanban,
  Building2,
  Briefcase,
  Target,
  TrendingUp,
  Package,
  CreditCard,
  User,
  Bell,
  Moon,
  Sun,
  Palette,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger, 
  DropdownMenuSub, 
  DropdownMenuSubContent, 
  DropdownMenuSubTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  href?: string;
  badge?: string;
  badgeColor?: 'default' | 'success' | 'warning' | 'error';
  children?: React.ReactNode;
  submenu?: SidebarItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const menuItems: SidebarItem[] = [
    {
      id: 'dashboard',
      title: 'แดชบอ',
      icon: Home,
      href: '/',
      badge: '2',
      badgeColor: 'success',
    },
    {
      id: 'projects',
      title: 'โครงการ',
      icon: Building2,
      href: '/projects',
      badge: '5',
      badgeColor: 'warning',
      children: [
        {
          id: 'active',
          title: 'โครงการที่กำลงงาน',
          href: '/projects?filter=active',
        },
        {
          id: 'completed',
          title: 'โครงการที่แล้วแล้ว',
          href: '/projects?filter=completed',
        },
      ],
    },
    {
      id: 'tasks',
      title: 'งานทำ',
      icon: CheckSquare,
      href: '/tasks',
      badge: '12',
      badgeColor: 'error',
      submenu: [
        {
          id: 'my-tasks',
          title: 'งานของฉัน',
          href: '/tasks?assignee=me',
        },
        {
          id: 'team-tasks',
          title: 'งานทีม',
          href: '/tasks?assignee=team',
        },
      ],
    },
    {
      id: 'timesheet',
      title: 'บันทึกเวลา',
      icon: Clock,
      href: '/timesheet',
      badge: '3',
      badgeColor: 'success',
      submenu: [
        {
          id: 'entry',
          title: 'บันทึกระเวลา',
          href: '/timesheet',
        },
        {
          id: 'approval',
          title: 'อนุมัติ',
          href: '/approvals',
        },
        {
          id: 'history',
          title: 'ประวัติ',
          href: '/timesheet?view=history',
        },
      ],
    },
    {
      id: 'reports',
      title: 'รายงาน',
      icon: BarChart3,
      href: '/reports',
      badge: '8',
      submenu: [
        {
          id: 'project-reports',
          title: 'รายงานโครงการ',
          href: '/reports?type=projects',
        },
        {
          id: 'time-reports',
          title: 'รายงานเวลา',
          href: '/reports?type=time',
        },
        {
          id: 'expense-reports',
          title: 'รายงานค่าใช้',
          href: '/reports?type=expenses',
        },
      ],
    },
    {
      id: 'team',
      title: 'ทีมงาน',
      icon: Users,
      href: '/team',
      badge: '15',
    },
    {
      id: 'analytics',
      title: 'วิเคคล',
      icon: TrendingUp,
      href: '/analytics',
      badge: 'Pro',
      badgeColor: 'warning',
    },
    {
      id: 'settings',
      title: 'ตั้งค่า',
      icon: Settings,
      href: '/settings',
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              PM
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Project Management
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 px-2 py-4">
          {filteredMenuItems.map((item) => (
            <div key={item.id}>
              {item.submenu ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        expandedItems.has(item.id) && "text-gray-700 dark:text-gray-200",
                        "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {item.icon}
                          <span className="text-sm font-medium">{item.title}</span>
                          {item.badge && (
                            <Badge className={cn(
                              "ml-2",
                              item.badgeColor === 'success' ? "bg-green-100 text-green-800" :
                              item.badgeColor === 'warning' ? "bg-yellow-100 text-yellow-800" :
                              item.badgeColor === 'error' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                            )}>
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expandedItems.has(item.id) && "rotate-180"
                        )} />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {item.submenu.map((subItem) => (
                      <DropdownMenuItem key={subItem.id} asChild>
                        <Link
                          to={subItem.href}
                          className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {subItem.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white",
                    location.pathname === item.href && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  )}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.badge && (
                    <Badge className={cn(
                      "ml-2",
                      item.badgeColor === 'success' ? "bg-green-100 text-green-800" :
                      item.badgeColor === 'warning' ? "bg-yellow-100 text-yellow-800" :
                      item.badgeColor === 'error' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                    )}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 w-64 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="text-sm text-gray-500 dark:text-gray-400">ยินดี</div>
            </div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700">
              <AvatarFallback className="h-8 w-8 bg-blue-600 text-white font-bold">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                John Doe
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Project Manager
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>

    {/* Mobile Menu Toggle */}
    <div className="md:hidden fixed bottom-4 left-4 z-50">
      <Button
        variant="default"
        size="icon"
        onClick={onToggle}
        className="bg-blue-600 text-white rounded-full p-3 shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  </div>
  );
};

export default Sidebar;
