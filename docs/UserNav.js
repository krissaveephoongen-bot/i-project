function UserNav() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [showProfile, setShowProfile] = React.useState(false);
  const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail')?.split('@')[0] || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userInitials = userName.substring(0, 2).toUpperCase();

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('dashboard')) setCurrentPage('dashboard');
    else if (path.includes('project')) setCurrentPage('projects');
    else if (path.includes('timesheet')) setCurrentPage('timesheet');
    else if (path.includes('expenses')) setCurrentPage('expenses');
    else if (path.includes('task-board')) setCurrentPage('task-board');
    else if (path.includes('reports')) setCurrentPage('reports');
    
    const handleClickOutside = (e) => {
      if (showProfile && !e.target.closest('.profile-dropdown')) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '../login.html';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
    { id: 'projects', label: 'Projects', href: 'projects.html' },
    { id: 'timesheet', label: 'Timesheet', href: 'timesheet.html' },
    { id: 'expenses', label: 'Expenses', href: 'expenses.html' },
    { id: 'task-board', label: 'Task Board', href: 'task-board.html' },
    { id: 'reports', label: 'Reports', href: 'reports.html' }
  ];

  const isActive = (id) => currentPage === id;

  return (
    <nav className="bg-white backdrop-blur-lg border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Painai</h1>
          <div className="hidden md:flex space-x-2">
            {navItems.map(item => (
              <a key={item.id} href={item.href} className={isActive(item.id) ? 'px-4 py-2 rounded-lg bg-blue-600 text-white font-medium transition-all duration-300' : 'px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300'}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="relative profile-dropdown">
          <button onClick={() => setShowProfile(!showProfile)} className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">{userInitials}</div>
            <div className={showProfile ? 'icon-chevron-down text-sm rotate-180 transition-transform' : 'icon-chevron-down text-sm transition-transform'}></div>
          </button>
          
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border py-2 z-50">
              <div className="px-4 py-3 border-b">
                <div className="font-semibold text-sm">{userName}</div>
                <div className="text-xs text-gray-600 mt-1">{userEmail}</div>
              </div>
              <button className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-gray-50">
                <div className="icon-settings text-base mr-3"></div>
                <span>Settings</span>
              </button>
              <div className="border-t my-2"></div>
              <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-red-50 text-red-600">
                <div className="icon-log-out text-base mr-3"></div>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}