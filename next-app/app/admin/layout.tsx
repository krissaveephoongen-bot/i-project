'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Activity, 
  Settings, 
  Database, 
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';
import Header from '@/app/components/Header';

const MENU_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'System Logs', href: '/admin/logs', icon: Activity },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Maintenance', href: '/admin/maintenance', icon: Database },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Admin Console"
        breadcrumbs={[
          { label: 'Workspace', href: '/' },
          { label: 'Admin' }
        ]}
      />
      
      <div className="pt-16 flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-16 bottom-0 z-30">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 px-2 py-1 text-slate-900 font-semibold">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <span>Admin Console</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-100">
            <div className="text-xs text-slate-400 px-2">
                System Version v1.0.0
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 overflow-y-auto p-8">
            {children}
        </main>
      </div>
    </div>
  );
}
