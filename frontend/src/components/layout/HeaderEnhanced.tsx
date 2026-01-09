import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  Search, 
  Bell, 
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Plus,
  FolderKanban,
  Building2,
  Briefcase,
  Target,
  TrendingUp,
  Package,
  CreditCard,
  User as UserIcon,
  Moon,
  Sun,
  Palette,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onLogout: () => void;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  onMenuClick,
  onSearchClick 
}) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    {
      icon: Building2,
      label: 'โครงการ',
      href: '/projects',
      badge: '3',
    },
    {
      icon: UserIcon,
      label: 'ทีมงาน',
      href: '/tasks',
      badge: '12',
    },
    {
      icon: Search,
      label: 'รายการอนุมัติ',
      href: '/approvals',
      badge: '5',
    },
    {
      icon: Bell,
      label: 'การแจ้ง',
      href: '/notifications',
      badge: '8',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Logo size="sm" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  i Project
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ระบบจัดการโครงการ
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center justify-center max-w-2xl mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="ค้นหาโครงการ, ทีมงาน, รายการ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setIsSearchOpen(false)}
                onSubmit={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {isSearchOpen && searchQuery && (
                <div className="absolute right-2 top-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">กดลอง:</span>
                    <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      Enter
                    </kbd>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleSearch}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    ค้นหา
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </a>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {8 > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      8
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuItem>
                  <div className="flex items-center justify-between">
                    <span>การแจ้ง</span>
                    <Badge className="bg-blue-500 text-white text-xs">8</Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex items-center justify-between">
                    <span>ทั้งหมด</span>
                    <Badge className="bg-green-500 text-white text-xs">3</Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex items-center justify-between">
                    <span>ระบบระบบ</span>
                    <Badge className="bg-yellow-500 text-white text-xs">2</Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center justify-between">
                    <span>อนุมัติ</span>
                    <Badge className="bg-purple-500 text-white text-xs">5</Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex items-center justify-between">
                    <span>การเงิน</span>
                    <Badge className="bg-orange-500 text-white text-xs">1</Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    ตั้งค่า
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="ghost" className="w-full justify-start">
                    <Palette className="h-4 w-4 mr-2" />
                    ธีมสว่าง
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  {user?.avatar ? (
                    <AvatarImage 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-8 w-8" 
                    />
                  ) : (
                    <AvatarFallback className="h-8 w-8 bg-blue-600 text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role === 'PROJECT_MANAGER' ? 'ผู้จัดการโครงการ' : user?.role === 'ADMIN' ? 'ผู้ดูแล' : 'พนักงาน'}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        โปรไลสอบ
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ดูและแก้ไขโปรไฟล์
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        โครงการ
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ดูโครงการทั้งหมด
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    ตั้งค่า
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกจากระบบ
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-2">
                  <Logo size="sm" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      i Project
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ระบบจัดการโครงการ
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-2">
                {menuItems.map((item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      "text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {item.icon && React.createElement(item.icon, { className: "h-5 w-5" })}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </div>
                      {item.badge && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
