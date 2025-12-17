import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    X,
    ChevronRight,
    ChevronLeft,
    LayoutDashboard,
    FolderKanban,
    Clock,
    BarChart3,
    Settings,
    Activity,
    Search as SearchIcon,
    Home as HomeIcon,
    DollarSign,
    Star,
    Users,
    TrendingUp,
    FileText,
    Package,
    Target,
    Briefcase,
    ChevronDown,
    Plus,
    Shield,
    ClipboardList,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/use-auth';
import { User } from '../../hooks/use-auth';
import AdminPINModal from '../AdminPINModal';

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
            { title: 'My Projects', icon: Briefcase, path: '/projects/my-projects' },
        ],
    },
    {
        title: 'Project Manager',
        icon: ClipboardList,
        submenu: [
            { title: 'Project Manager', icon: ClipboardList, path: '/project-manager' },
            { title: 'Manager Users', icon: Users, path: '/project-manager-users', requiredRole: ['admin'] },
        ],
    },
    {
        title: 'Resources',
        icon: Users,
        submenu: [
            { title: 'Resource Management', icon: Users, path: '/resources' },
            { title: 'Team Members', icon: Package, path: '/resources/team' },
            { title: 'Allocation', icon: Target, path: '/resources/allocation' },
        ],
    },
    {
        title: 'Time & Expenses',
        icon: Clock,
        submenu: [
            { title: 'Timesheet', icon: Clock, path: '/timesheet' },
            { title: 'Expenses', icon: DollarSign, path: '/expenses' },
            { title: 'Cost Management', icon: TrendingUp, path: '/cost-management' },
        ],
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        submenu: [
            { title: 'Reports', icon: BarChart3, path: '/reports' },
            { title: 'Analytics', icon: TrendingUp, path: '/analytics' },
        ],
        requiredRole: ['admin', 'manager'],
    },
    {
        title: 'Organization',
        icon: Briefcase,
        submenu: [
            { title: 'Activity Log', icon: Activity, path: '/activity' },
            { title: 'Search', icon: SearchIcon, path: '/search' },
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
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
}

const Sidebar = ({ isOpen, onClose, onToggle }: SidebarProps) => {
    const location = useLocation();
    const { getCurrentUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard']);
    const [showPINModal, setShowPINModal] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        };

        fetchUser();
    }, [getCurrentUser]);

    const toggleSubmenu = (title: string, e: React.MouseEvent) => {
        e.preventDefault();
        setExpandedItems((prev) =>
            prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
        );
    };

    const handleAdminConsoleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowPINModal(true);
    };

    const handlePINSuccess = () => {
        // Open Admin Console in new tab
        window.open('/admin/index.html', '_blank');
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

    const containerVariants = {
        hidden: { opacity: 0, x: -300 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
            },
        },
        exit: {
            opacity: 0,
            x: -300,
            transition: {
                duration: 0.25,
                ease: 'easeIn',
            },
        },
    };

    const submenuVariants = {
        hidden: { opacity: 0, height: 0, y: -10 },
        visible: {
            opacity: 1,
            height: 'auto',
            y: 0,
            transition: {
                duration: 0.25,
                ease: 'easeOut',
                staggerChildren: 0.05,
                delayChildren: 0.05,
            },
        },
        exit: {
            opacity: 0,
            height: 0,
            y: -10,
            transition: {
                duration: 0.2,
                ease: 'easeIn',
            },
        },
    };

    const submenuItemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.2,
                ease: 'easeOut',
            },
        },
    };

    const menuItemVariants = {
        hidden: { opacity: 0, y: -5 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.03,
                duration: 0.3,
                ease: 'easeOut',
            },
        }),
        hover: {
            x: 4,
            transition: {
                duration: 0.2,
                ease: 'easeOut',
            },
        },
    };

    return (
        <>
            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                variants={containerVariants}
                initial="hidden"
                animate={isOpen ? 'visible' : 'hidden'}
                exit="exit"
                className={cn(
                    'fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm transition-all duration-300 lg:sticky lg:translate-x-0',
                    !isOpen && '-translate-x-full'
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
                            .filter((item) => !item.requiredRole || (user && item.requiredRole.some((role) => user.role === role)))
                            .map((item, index) => {
                                const Icon = item.icon;
                                const isActive = isMenuActive(item);
                                const isExpanded = expandedItems.includes(item.title);

                                if (item.submenu) {
                                    return (
                                        <motion.div
                                            key={item.title}
                                            variants={menuItemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            custom={index}
                                        >
                                            <motion.button
                                                onClick={(e) => toggleSubmenu(item.title, e)}
                                                whileHover="hover"
                                                className={cn(
                                                    'group w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        initial={{ scale: 1, rotate: 0 }}
                                                        animate={{
                                                            scale: isActive ? 1.1 : 1,
                                                            rotate: isActive ? 0 : 0,
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                                    >
                                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                                    </motion.div>
                                                    <span className="truncate">{item.title}</span>
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                                >
                                                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                                </motion.div>
                                            </motion.button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        variants={submenuVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        className="mt-2 space-y-0.5 overflow-hidden"
                                                    >
                                                        {item.submenu
                                                            .filter((subitem) => !subitem.requiredRole || (user && subitem.requiredRole.some((role) => user.role === role)))
                                                            .map((subitem, subIndex) => {
                                                            const SubIcon = subitem.icon;
                                                            const isSubActive = location.pathname === subitem.path;

                                                            return (
                                                                <motion.div
                                                                    key={subitem.path}
                                                                    variants={submenuItemVariants}
                                                                    initial="hidden"
                                                                    animate="visible"
                                                                    custom={subIndex}
                                                                >
                                                                    <NavLink
                                                                        to={subitem.path}
                                                                        className={cn(
                                                                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ml-2 pl-8 relative',
                                                                            isSubActive
                                                                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                                                                            "before:absolute before:left-3 before:w-1.5 before:h-1.5 before:rounded-full before:bg-current before:opacity-40 before:transition-all before:duration-200 group-hover:before:scale-125"
                                                                        )}
                                                                        onClick={onClose}
                                                                    >
                                                                        <motion.div
                                                                            whileHover={{ scale: 1.15, rotate: 5 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                        >
                                                                            <SubIcon className="h-4 w-4 flex-shrink-0" />
                                                                        </motion.div>
                                                                        <span className="truncate">{subitem.title}</span>
                                                                    </NavLink>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                }

                                // Special handling for Admin Console
                                if (item.title === 'Admin Console') {
                                    return (
                                        <motion.div
                                            key={item.title}
                                            variants={menuItemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            custom={index}
                                        >
                                            <motion.button
                                                onClick={handleAdminConsoleClick}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={cn(
                                                    'group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                    'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20',
                                                    'relative overflow-hidden'
                                                )}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/5 dark:to-orange-500/5"
                                                    initial={{ x: -100 }}
                                                    whileHover={{ x: 100 }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                                <motion.div
                                                    className="relative z-10"
                                                    whileHover={{ rotate: 10 }}
                                                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                                >
                                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                                </motion.div>
                                                <span className="truncate relative z-10">{item.title}</span>
                                                <motion.div
                                                    className="ml-auto text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded font-semibold relative z-10"
                                                    animate={{
                                                        scale: [1, 1.08, 1],
                                                        y: [0, -2, 0]
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    🔐
                                                </motion.div>
                                            </motion.button>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={item.path}
                                        variants={menuItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        custom={index}
                                    >
                                        <NavLink
                                            to={item.path!}
                                            className={cn(
                                                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                                                'w-full'
                                            )}
                                            onClick={onClose}
                                        >
                                            <motion.div
                                                initial={{ scale: 1 }}
                                                whileHover={{ scale: 1.15 }}
                                                whileTap={{ scale: 0.9 }}
                                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                            >
                                                <Icon className="h-5 w-5 flex-shrink-0" />
                                            </motion.div>
                                            <span className="truncate">{item.title}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute right-2 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                        </NavLink>
                                    </motion.div>
                                );
                            })}
                    </nav>
                </div>

                {/* User Profile Footer */}
                <motion.div
                    className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50 sticky bottom-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <motion.div
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.div
                            className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold shadow-sm"
                            whileHover={{
                                scale: 1.1,
                                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
                            }}
                        >
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </motion.div>
                        <div className="min-w-0 flex-1">
                            <motion.p
                                className="text-xs font-semibold text-gray-900 dark:text-white truncate"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                            >
                                {user?.name || 'User'}
                            </motion.p>
                            <motion.p
                                className="text-[10px] text-gray-500 dark:text-gray-400 truncate"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.35 }}
                            >
                                {user?.email?.split('@')[0] || 'user'}
                            </motion.p>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.aside>

            {/* Admin PIN Modal */}
            <AdminPINModal
                isOpen={showPINModal}
                onClose={() => setShowPINModal(false)}
                onSuccess={handlePINSuccess}
            />
        </>
    );
};

export default Sidebar;
