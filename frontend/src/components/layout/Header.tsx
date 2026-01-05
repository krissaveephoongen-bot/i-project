import { User, LogOut, Settings, Menu, LayoutGrid, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ThemeToggle } from '../ThemeToggle';
import { NotificationCenter } from '../NotificationCenter';
import { SearchBar } from '../SearchBar';
import { ProjectSelector } from '../ProjectSelector';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  onMenuClick?: () => void;
}

const Header = ({ user, onLogout, onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();

  const handleMenuClick = () => {
    navigate('/menu');
  };

  const handleSearchClick = () => {
    navigate('/menu-search');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Menu button for mobile/desktop */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={onMenuClick}
            title="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Project Selector */}
          <ProjectSelector />
          
          {/* Menu Access Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMenuClick}
            title="Open Menu"
            className="hidden md:inline-flex"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>

          {/* Search bar */}
          <div className="hidden md:block">
            <SearchBar
              placeholder="Search projects, tasks..."
              className="w-80"
              onSearch={(query) => console.log('Search:', query)}
            />
          </div>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchClick}
            className="md:hidden"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationCenter
            notifications={[]}
            onClear={() => {}}
            onMarkAsRead={() => {}}
          />
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
