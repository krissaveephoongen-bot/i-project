import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Folder, 
  CheckSquare, 
  ClipboardList, 
  Receipt, 
  CheckCircle, 
  BarChart, 
  Briefcase,
  Users,
  Building2,
  Settings,
  HelpCircle,
  User,
  FileText,
  BriefcaseIcon,
  PieChart
} from 'lucide-react';

function Sidebar({ isOpen }) {
  try {
    const pathname = usePathname();
    
    const menuGroups = [
      {
        title: 'Main',
        items: [
          { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
        ]
      },
      {
        title: 'Work',
        items: [
          { id: '/projects', label: 'Projects', icon: Folder },
          { id: '/tasks', label: 'Tasks', icon: CheckSquare },
          { id: '/timesheet', label: 'Timesheet', icon: ClipboardList }
        ]
      },
      {
        title: 'Management',
        items: [
          { id: '/clients', label: 'Clients', icon: Building2 },
          { id: '/stakeholders', label: 'Stakeholders', icon: Users },
          { id: '/staff', label: 'Staff', icon: BriefcaseIcon },
          { id: '/users', label: 'Users', icon: User }
        ]
      },
      {
        title: 'Finance',
        items: [
          { id: '/expenses', label: 'Expenses', icon: Receipt },
          { id: '/approvals', label: 'Approvals', icon: CheckCircle }
        ]
      },
      {
        title: 'Analytics',
        items: [
          { id: '/reports', label: 'Reports', icon: BarChart },
          { id: '/resources', label: 'Resources', icon: PieChart }
        ]
      },
      {
        title: 'System',
        items: [
          { id: '/admin', label: 'Admin', icon: Briefcase },
          { id: '/settings', label: 'Settings', icon: Settings },
          { id: '/help', label: 'Help', icon: HelpCircle }
        ]
      }
    ];

    return (
      <div 
        className={`fixed left-0 top-0 h-full bg-[#0F172A] text-white transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-20'
        } z-30 shadow-xl`}
        data-name="sidebar" 
        data-file="components/Sidebar.js"
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-center border-b border-white/10 px-4">
            {isOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <span className="font-bold text-lg text-white">IP</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">I-PROJECT</span>
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="font-bold text-lg text-white">IP</span>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
            {menuGroups.map((group, idx) => (
              <div key={idx}>
                {isOpen && (
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">
                    {group.title}
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map(item => {
                    const isActive = pathname === item.id || pathname?.startsWith(item.id + '/');
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.id}
                        href={item.id}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className={`flex items-center justify-center ${isOpen ? '' : 'mx-auto'}`}>
                          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'group-hover:text-white'} />
                        </div>
                        
                        <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${
                          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-14 pointer-events-none'
                        }`}>
                          {item.label}
                        </span>

                        {!isOpen && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none border border-slate-700 shadow-xl">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Summary (Optional Footer) */}
          <div className="p-4 border-t border-white/10">
            <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-inner">
                U
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">User Profile</p>
                  <p className="text-xs text-slate-400 truncate">View Settings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Sidebar component error:', error);
    return null;
  }
}
