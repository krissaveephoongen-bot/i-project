import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, FolderKanban, Clock, BarChart3, Settings, Activity, Search as SearchIcon, Home as HomeIcon, DollarSign, Star, Users, TrendingUp, FileText, Package, Target, Briefcase, ChevronDown, Plus, Shield, ClipboardList, LogOut, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MenuItem {
    title: string;
    icon: React.ComponentType<any>;
    path?: string;
    requiredRole?: string[];
    submenu?: SubMenuItem[];
}

interface SubMenuItem {
    title: string;
    icon: React.ComponentType<any>;
    path: string;
    requiredRole?: string[];
    className?: string;
}

const menuItems: MenuItem[] = [
    {
        title: 'Home',
        icon: HomeIcon,
        path: '/',
    },
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
    },
    {
        title: 'Projects',
        icon: FolderKanban,
        submenu: [
            { title: 'All Projects', icon: FolderKanban, path: '/projects' },
            { title: 'Project Table', icon: FileText, path: '/projects/table' },
            { title: 'Create Project', icon: Plus, path: '/projects/create' },
            { title: 'My Projects', icon: Briefcase, path: '/projects/my-projects', className: 'text-black' },
            { title: 'Project Billing', icon: DollarSign, path: '/project-billing' },
            { title: 'Issue Log', icon: Activity, path: '/project-issues' },
        ],
    },
    {
        title: 'Tasks',
        icon: ClipboardList,
        path: '/task-management',
    },
    {
        title: 'Project Manager',
        icon: ClipboardList,
        submenu: [
            { title: 'Manager Dashboard', icon: LayoutDashboard, path: '/project-manager' },
            { title: 'Project Managers', icon: Users, path: '/project-manager' },
            { title: 'All Users', icon: Users, path: '/project-manager-users', requiredRole: ['admin'] },
            { title: 'Workload', icon: Activity, path: '/workload' },
        ],
    },
    {
        title: 'Resources',
        icon: Users,
        submenu: [
            { title: 'Resource Dashboard', icon: LayoutDashboard, path: '/resources' },
            { title: 'Resource Planning', icon: Target, path: '/resources/planning' },
            { title: 'Team Members', icon: Users, path: '/resources/team' },
            { title: 'Resource Allocation', icon: Target, path: '/resources/allocation' },
            { title: 'Resource Calendar', icon: Calendar, path: '/resources/calendar' },
        ],
    },
    {
        title: 'Time & Expenses',
        icon: Clock,
        submenu: [
            { title: 'My Timesheet', icon: Clock, path: '/timesheet' },
            { title: 'Team Timesheets', icon: Clock, path: '/timesheets/team', requiredRole: ['manager', 'admin'] },
            { title: 'Expenses', icon: DollarSign, path: '/expenses' },
            { title: 'Expense Reports', icon: FileText, path: '/expenses/reports' },
            { title: 'Cost Management', icon: TrendingUp, path: '/cost-management' },
        ],
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        submenu: [
            { title: 'Reports', icon: BarChart3, path: '/reports' },
            { title: 'Analytics', icon: TrendingUp, path: '/analytics' },
            { title: 'Enhanced Analytics', icon: BarChart3, path: '/analytics/enhanced' },
        ],
        requiredRole: ['admin', 'manager'],
    },
    {
        title: 'Customers',
        icon: Users,
        path: '/customers',
    },
    {
        title: 'Organization',
        icon: Briefcase,
        submenu: [
            { title: 'Activity Log', icon: Activity, path: '/activity' },
            { title: 'Search', icon: SearchIcon, path: '/search' },
            { title: 'Menu Management', icon: Activity, path: '/menu' },
        ],
    },
    {
        title: 'Favorites',
        icon: Star,
        path: '/favorites',
    },
    {
        title: 'Settings',
        icon: Settings,
        path: '/settings',
    },
    {
        title: 'Admin Console',
        icon: Shield,
        requiredRole: ['admin'],
        submenu: [
            { title: 'User Management', icon: Users, path: '/admin/users' },
            { title: 'Role Management', icon: Shield, path: '/admin/role-management' },
            { title: 'Database Status', icon: Activity, path: '/admin/database' },
        ],
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
}

const Sidebar = ({ isOpen, onClose, onToggle }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user: currentUser } = useAuthContext();
    const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard']);
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

    const toggleSubmenu = (title: string) => {
        setExpandedItems((prev) =>
            prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
        );
    };

    const handleAdminConsoleClick = () => {
        if (!isAdmin) {
            toast.error('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
            return;
        }
        navigate('/admin');
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
        }
    };

    const isMenuActive = (item: MenuItem): boolean => {
        if (item.path) {
            return location.pathname === item.path;
        }
        if (item.submenu) {
            return item.submenu.some((sub) => location.pathname === sub.path);
        }
        return false;
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    onClick={onClose}
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                    'lg:sticky lg:top-0 lg:z-10 lg:block lg:h-screen lg:border-r lg:bg-white lg:shadow-sm',
                    'dark:border-gray-700 dark:bg-gray-800'
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sticky top-0 bg-white dark:bg-gray-900 z-40">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-sm font-bold">PM</span>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate block">
                                ProjectAPW
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">v2.0</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Toggle button - visible on all screen sizes */}
                        <Button
                            variant="text"
                            size="icon"
                            onClick={onToggle}
                            className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {isOpen ? (
                                <ChevronLeft className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>

                        {/* Close button - only visible on mobile */}
                        <Button
                            variant="text"
                            size="icon"
                            onClick={onClose}
                            className="lg:hidden h-8 w-8 text-gray-500 dark:text-gray-400"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <nav className="py-2 px-2 space-y-1">
                        {menuItems
                            .filter((item) => !item.requiredRole || (currentUser && item.requiredRole.includes(currentUser.role)))
                            .map((item, index) => {
                                const Icon = item.icon;
                                const isActive = isMenuActive(item);
                                const isExpanded = expandedItems.includes(item.title);

                                if (item.submenu) {
                                    return (
                                        <div key={item.title}>
                                            <button
                                                onClick={() => toggleSubmenu(item.title)}
                                                className={cn(
                                                    'group w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                                    <span className="truncate">{item.title}</span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                            </button>

                                            <div className={isExpanded ? 'block' : 'hidden'}>
                                                {item.submenu
                                                    .filter((subitem) => !subitem.requiredRole || (currentUser && subitem.requiredRole.some((role) => currentUser.role === role)))
                                                    .map((subitem, subIndex) => (
                                                        <div key={subIndex} className="pl-14">
                                                            <NavLink
                                                                to={subitem.path}
                                                                onClick={(e) => {
                                                                    if (subitem.requiredRole && !isAdmin) {
                                                                        e.preventDefault();
                                                                        toast.error('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
                                                                    }
                                                                }}
                                                                className={({ isActive }) =>
                                                                    cn(
                                                                        'flex items-center py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
                                                                        isActive && 'bg-gray-100 font-medium text-indigo-600 dark:bg-gray-700 dark:text-indigo-400',
                                                                        subitem.className
                                                                    )
                                                                }
                                                            >
                                                                <subitem.icon className="h-4 w-4" />
                                                                <span className="ml-3">{subitem.title}</span>
                                                            </NavLink>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    );
                                }

                                // Special handling for Admin Console
                                if (item.title === 'Admin Console') {
                                    return (
                                        <div key={item.title}>
                                            <button
                                                onClick={handleAdminConsoleClick}
                                                className={cn(
                                                    'group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                    'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20',
                                                    'relative overflow-hidden'
                                                )}
                                            >
                                                <Icon className="h-5 w-5 flex-shrink-0" />
                                                <span className="truncate relative z-10">{item.title}</span>
                                                <div className="ml-auto text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded font-semibold relative z-10">
                                                    🔐
                                                </div>
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={item.path}>
                                        <NavLink
                                            to={item.path!}
                                            className={({ isActive }) =>
                                                cn(
                                                    'flex items-center py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
                                                    isActive && 'bg-gray-100 font-medium text-indigo-600 dark:bg-gray-700 dark:text-indigo-400',
                                                    'w-full'
                                                )
                                            }
                                            onClick={onClose}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            <span className="truncate">{item.title}</span>
                                            {isActive && (
                                                <div className="absolute right-2 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                            )}
                                        </NavLink>
                                    </motion.div>
                                );
                            })}
                    </nav>
                </div>

                {/* User Profile Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50 sticky bottom-0">
                    {/* User Info */}
                    <NavLink
                        to="/settings"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold shadow-sm overflow-hidden">
                            {currentUser?.avatar ? (
                                <img
                                    src={currentUser.avatar}
                                    alt="User Avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span>{currentUser?.email?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                        </motion.div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                {currentUser?.name || 'User'}
                            </motion.p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                {currentUser?.email || 'user@example.com'}
                            </motion.p>
                        </div>
                    </NavLink>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors hover:text-red-600 dark:hover:text-red-400"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

        </>
    );
};

export default Sidebar;
