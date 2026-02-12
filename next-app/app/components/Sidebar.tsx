'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Users,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  BarChart3,
  CheckSquare,
  FileText,
  Briefcase,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from './AuthProvider';

// --- Helper Components ---

interface NavItemProps {
  item: any;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const NavItem = ({ item, isActive, isExpanded, onToggleExpand }: NavItemProps) => {
  const isParent = !!item.children;
  const currentPathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (isParent) {
      e.preventDefault();
      onToggleExpand();
    }
  };

  return (
    <li>
      <Link
        href={item.href || '#'}
        onClick={handleClick}
        className={clsx(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out',
          isActive 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
          isParent && 'justify-between'
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span>{item.name}</span>
        </div>
        {isParent && (
          <ChevronDown 
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )} 
          />
        )}
      </Link>
      {isParent && isExpanded && (
        <ul className="pl-7 pt-2 space-y-1">
          {item.children.map((child: any) => (
            <li key={child.name}>
                <Link
                  href={child.href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out',
                    currentPathname === child.href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300'
                  )}
                >
                  <child.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{child.name}</span>
                </Link>
              </li>
          ))}
        </ul>
      )}
    </li>
  );
};


// --- Main Sidebar Component ---

export default function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname() ?? '';
  const { user, signOut } = useAuth() || {};
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // --- Role-based Navigation Structure ---
  const navStructure = [
    {
      title: t('navigation.analytics', 'ANALYTICS'),
      items: [
        { name: t('navigation.dashboard'), href: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
        {
          name: t('navigation.reports'),
          icon: BarChart3,
          roles: ['admin', 'manager'],
          children: [
            { name: t('reports.financial'), href: '/reports/financial', icon: FileText },
            { name: t('reports.resource'), href: '/reports/resources', icon: Users },
            { name: t('reports.project'), href: '/reports/projects', icon: FolderKanban },
            { name: t('reports.insights'), href: '/reports/insights', icon: BarChart3 },
            { name: t('reports.utilization'), href: '/reports/utilization', icon: BarChart3 },
            { name: t('reports.hours'), href: '/reports/hours', icon: BarChart3 },
          ]
        },
      ]
    },
    {
      title: t('navigation.workspace', 'WORKSPACE'),
      items: [
        { name: t('navigation.projects'), href: '/projects', icon: FolderKanban, roles: ['admin', 'manager', 'employee'] },
        { name: t('navigation.clients'), href: '/clients', icon: Users, roles: ['admin', 'manager'] },
        { name: t('navigation.tasks'), href: '/tasks', icon: CheckSquare, roles: ['admin', 'manager', 'employee'] },
        { name: t('navigation.timesheet'), href: '/timesheet', icon: Calendar, roles: ['admin', 'manager', 'employee'] },
        { name: t('navigation.expenses'), href: '/expenses', icon: CreditCard, roles: ['admin', 'manager', 'employee'] },
        { name: t('navigation.sales'), href: '/sales', icon: FolderKanban, roles: ['admin', 'manager'] },
        {
          name: t('navigation.approvals'),
          icon: UserCheck,
          roles: ['admin', 'manager'],
          children: [
            { name: t('approvals.timesheets'), href: '/approvals/timesheets', icon: Calendar },
            { name: t('approvals.expenses'), href: '/approvals/expenses', icon: Briefcase },
          ]
        },
        { name: t('navigation.stakeholders'), href: '/stakeholders', icon: Users, roles: ['admin', 'manager'] },
      ]
    },
    {
      title: t('navigation.admin_section', 'ADMIN'),
      items: [
        {
          name: t('navigation.admin'),
          href: '/admin',
          icon: Settings,
          roles: ['admin'],
          children: [
            { name: t('navigation.users'), href: '/users', icon: Users }
          ]
        }
      ]
    },
  ];

  const handleToggleExpand = (name: string) => {
    setExpandedItems((prev: Record<string, boolean>) => ({ ...prev, [name]: !prev[name] }));
  };
  
  const userRole = user?.role || 'employee';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-background border-r border-border flex flex-col z-50 shadow-sm transition-colors duration-300">
      {/* Logo Area */}
      <div className="h-[64px] flex items-center px-6 border-b border-border">
         <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">I-PROJECT</span>
         </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-4 overflow-y-auto">
        {navStructure.map(section => (
          <div key={section.title} className="mb-4">
            <h3 className="px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{section.title}</h3>
            <ul className="space-y-1">
              {section.items
                .filter((item: any) => item.roles.includes(userRole))
                .map((item: any) => (
                  <NavItem 
                    key={item.name}
                    item={item}
                    isActive={
                      pathname === (item.href || '') ||
                      ((item.href || '') !== '/' && pathname.startsWith(item.href || ''))
                    }
                    isExpanded={expandedItems[item.name]}
                    onToggleExpand={() => handleToggleExpand(item.name)}
                  />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Area */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/help" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5" />
          {t('navigation.help')}
        </Link>

        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0284c7&color=fff`}
                alt="User Avatar"
                className="w-10 h-10 rounded-full ring-2 ring-background"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || t('common.guest', 'Guest User')}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{user?.role || t('common.noRole', 'No Role')}</p>
            </div>
              <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          {t('navigation.logout')}
        </button>
      </div>
    </aside>
  );
}
