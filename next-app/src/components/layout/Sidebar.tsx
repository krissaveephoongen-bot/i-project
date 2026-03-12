import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Folder, 
  Clock, 
  CreditCard, 
  BarChart3, 
  Building2, 
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  submenu?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: 'Dashboard',
    href: '/dashboard',
    submenu: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'KPIs', href: '/dashboard/kpis' },
    ],
  },
  {
    icon: <Folder className="w-5 h-5" />,
    label: 'Projects',
    href: '/projects',
    submenu: [
      { label: 'All Projects', href: '/projects' },
      { label: 'My Projects', href: '/projects/my' },
      { label: 'WBS View', href: '/projects/wbs' },
      { label: 'Kanban Board', href: '/projects/kanban' },
    ],
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: 'Timesheet',
    href: '/timesheet',
    submenu: [
      { label: 'My Timesheet', href: '/timesheet' },
      { label: 'Team Timesheets', href: '/timesheet/team' },
      { label: 'Approvals', href: '/timesheet/approvals' },
    ],
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    label: 'Billing',
    href: '/billing',
    submenu: [
      { label: 'Invoices', href: '/billing/invoices' },
      { label: 'Payments', href: '/billing/payments' },
      { label: 'Reports', href: '/billing/reports' },
    ],
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: 'Reports',
    href: '/reports',
    submenu: [
      { label: 'Financial', href: '/reports/financial' },
      { label: 'Project Health', href: '/reports/health' },
      { label: 'Resource Usage', href: '/reports/resources' },
    ],
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    label: 'Vendors',
    href: '/vendors',
    submenu: [
      { label: 'All Vendors', href: '/vendors' },
      { label: 'Contracts', href: '/vendors/contracts' },
      { label: 'KPI Ratings', href: '/vendors/kpi' },
    ],
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: 'Settings',
    href: '/settings',
  },
];

export function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard']);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40
          ${isExpanded ? 'w-64' : 'w-20'}
          lg:w-64
        `}
      >
        <nav className="h-full overflow-y-auto">
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <div key={item.label}>
                {/* Main item */}
                <button
                  onClick={() => item.submenu && toggleExpanded(item.label)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group relative"
                  title={!isExpanded ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isExpanded && (
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    )}
                  </div>
                  {isExpanded && item.submenu && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        expandedItems.includes(item.label) ? 'rotate-90' : ''
                      }`}
                    />
                  )}

                  {/* Hover label for mini sidebar */}
                  {!isExpanded && (
                    <div className="absolute left-24 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {isExpanded &&
                  item.submenu &&
                  expandedItems.includes(item.label) && (
                    <div className="ml-4 space-y-1">
                      {item.submenu.map((subitem) => (
                        <a
                          key={subitem.label}
                          href={subitem.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {subitem.label}
                        </a>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {/* Help */}
            <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group relative mt-auto">
              <div className="flex items-center gap-3 flex-1">
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="text-sm font-medium">Help</span>}
              </div>
              {!isExpanded && (
                <div className="absolute left-24 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Help
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* Expand/Collapse toggle (visible only on lg) */}
        <div className="hidden lg:flex items-center justify-center p-4 border-t border-gray-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed left-6 top-20 z-50 lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <Folder className="w-5 h-5" />
      </button>

      {/* Main content offset */}
      <div
        className={`transition-all duration-300 ${
          isExpanded ? 'lg:ml-64' : 'lg:ml-20'
        } ml-0`}
      />
    </>
  );
}
