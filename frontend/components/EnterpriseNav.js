function EnterpriseNav({ onShowHelp }) {
  try {
    const [showProfile, setShowProfile] = React.useState(false);
    const [showSettings, setShowSettings] = React.useState(false);
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const userName = localStorage.getItem('userEmail') || 'Alex Smith';
    const userInitials = userName.split('@')[0].substring(0, 2).toUpperCase();

    const handleLogout = () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      window.location.href = 'login.html';
    };

    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (showProfile && !e.target.closest('.profile-dropdown')) {
          setShowProfile(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfile]);

    const navItems = [
      { id: 'dashboard.html', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'project-overview.html', label: 'Project Overview', icon: 'chart-bar' },
      { id: 'projects.html', label: 'All Projects', icon: 'folder' },
      { id: 'tasks.html', label: 'Tasks', icon: 'check-square' },
      { id: 'worklog.html', label: 'My Timesheet', icon: 'clock' },
      { id: 'expenses.html', label: 'Expenses', icon: 'receipt' },
      { id: 'approvals.html', label: 'Approvals', icon: 'check-circle' },
      { id: 'team.html', label: 'Team', icon: 'users' },
      { id: 'customers.html', label: 'Customers', icon: 'building-2' },
      { id: 'reports.html', label: 'Reports', icon: 'chart-bar' }
    ];

    return (
      <>
        <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--navy-900)] text-white z-40">
          <div className="p-6 border-b border-white/10">
            <img src="https://app.trickle.so/storage/public/images/usr_1433d77be8000001/ef136bc4-a29c-4c88-88ec-12a2bef41e70.png?w=131&h=40" alt="Logo" className="h-8" />
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map(item => (
              <a key={item.id} href={item.id} className={`flex items-center px-4 py-3 rounded-lg transition-all ${currentPage === item.id ? 'bg-[var(--teal-500)] text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                <div className={`icon-${item.icon} text-lg mr-3`}></div>
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="absolute bottom-6 left-4 right-4 space-y-2">
            {onShowHelp && (
              <button onClick={onShowHelp} className="w-full flex items-center px-4 py-3 text-slate-300 hover:bg-white/5 rounded-lg transition-all">
                <div className="icon-help-circle text-lg mr-3"></div>
                <span className="font-medium text-sm">ช่วยเหลือ</span>
              </button>
            )}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-[var(--teal-500)] rounded-full flex items-center justify-center font-semibold">AS</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">Alex Smith</div>
                <div className="text-xs text-slate-400">Senior PM</div>
              </div>
            </div>
          </div>
        </aside>
        <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-[var(--slate-200)] z-30 px-6 flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="icon-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-400)]"></div>
              <input type="text" placeholder="Search projects or tasks..." className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--slate-200)] rounded-lg focus:ring-2 focus:ring-[var(--teal-500)] outline-none" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <div className="relative profile-dropdown">
              <button onClick={() => setShowProfile(!showProfile)} className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <div className="w-8 h-8 bg-[var(--navy-900)] rounded-full flex items-center justify-center text-white text-sm font-semibold">{userInitials}</div>
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-semibold">{userName.split('@')[0]}</div>
                  <div className="text-xs text-[var(--slate-600)]">Team Member</div>
                </div>
                <div className={`icon-chevron-down text-sm text-[var(--slate-400)] transition-transform ${showProfile ? 'rotate-180' : ''}`}></div>
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[var(--slate-200)] py-2 z-50">
                  <div className="px-4 py-3 border-b border-[var(--slate-200)]">
                    <div className="font-semibold text-sm">{userName.split('@')[0]}</div>
                    <div className="text-xs text-[var(--slate-600)] mt-1">{userName}</div>
                  </div>
                  
                  <button onClick={() => { setShowProfile(false); setShowSettings(true); }} className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="icon-user text-base mr-3 text-[var(--slate-600)]"></div>
                    <span>My Profile</span>
                  </button>
                  
                  <button onClick={() => { setShowProfile(false); setShowSettings(true); }} className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <div className="icon-settings text-base mr-3 text-[var(--slate-600)]"></div>
                    <span>Settings</span>
                  </button>
                  
                  <div className="border-t border-[var(--slate-200)] my-2"></div>
                  
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition-colors">
                    <div className="icon-log-out text-base mr-3"></div>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-[var(--slate-200)] flex items-center justify-between">
                <h2 className="text-2xl font-bold">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="icon-x text-lg"></div>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input type="email" value={userName} disabled className="w-full px-4 py-2 bg-gray-50 border border-[var(--slate-200)] rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Display Name</label>
                      <input type="text" placeholder="Enter your name" className="w-full px-4 py-2 border border-[var(--slate-200)] rounded-lg focus:ring-2 focus:ring-[var(--teal-500)] outline-none" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-[var(--slate-600)]">Receive updates via email</div>
                      </div>
                      <label className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-full h-full bg-gray-200 peer-checked:bg-[var(--teal-500)] rounded-full peer transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Dark Mode</div>
                        <div className="text-sm text-[var(--slate-600)]">Use dark theme</div>
                      </div>
                      <label className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-full h-full bg-gray-200 peer-checked:bg-[var(--teal-500)] rounded-full peer transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--slate-200)]">
                  <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 border border-[var(--slate-200)] rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Cancel
                  </button>
                  <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 bg-[var(--teal-500)] text-white rounded-lg hover:bg-[var(--teal-500)]/90 transition-colors font-medium">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('EnterpriseNav error:', error);
    return null;
  }
}
