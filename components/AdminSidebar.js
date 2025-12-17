// Import auth utilities
const { isAuthenticated, logout: authLogout } = window.authUtils || {};

function AdminSidebar({ isOpen }) {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [user, setUser] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  
  // Check authentication and role on component mount
  React.useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        const userRole = localStorage.getItem('userRole');
        
        if (!userData || !isAuthenticated?.() || userRole !== 'admin') {
          // Redirect to login if not authenticated or not admin
          window.location.href = 'login.html';
          return;
        }
        
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setIsAdmin(userObj.role === 'admin');
      } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = 'login.html';
      }
    };
    
    checkAuth();
  }, []);
  
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userRole = user?.role || 'user';

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('dashboard')) setCurrentPage('dashboard');
    else if (path.includes('projects')) setCurrentPage('projects');
    else if (path.includes('users')) setCurrentPage('users');
    else if (path.includes('customers')) setCurrentPage('customers');
    else if (path.includes('approvals')) setCurrentPage('approvals');
    else if (path.includes('reports')) setCurrentPage('reports');
  }, []);

  const handleLogout = () => {
    if (authLogout) {
      authLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      window.location.href = 'login.html';
    }
  };

  // Menu items configuration
  const menuItems = [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard', path: 'dashboard.html', roles: ['admin'] },
    { id: 'users', icon: 'users', label: 'User Management', path: 'users.html', roles: ['admin'] },
    { id: 'cards', icon: 'credit-card', label: 'Card Management', path: 'cards.html', roles: ['admin'] },
    { id: 'transactions', icon: 'receipt', label: 'Transactions', path: 'transactions.html', roles: ['admin'] },
    { id: 'reports', icon: 'chart-bar', label: 'Reports', path: 'reports.html', roles: ['admin', 'manager'] },
    { id: 'approvals', icon: 'check-circle', label: 'Subsidy Approvals', path: 'approvals.html', roles: ['admin', 'approver'] },
    { id: 'settings', icon: 'settings', label: 'System Settings', path: 'settings.html', roles: ['admin'] }
  ].filter(item => item.roles.includes('admin')); // Only show admin-specific items

  return (
    <div className={`fixed left-0 top-0 h-full bg-[#1a365d] text-white transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
      <div className="p-6 border-b border-white/10">
        <div className="text-2xl font-bold animate-[fadeIn_0.5s_ease-out]">Transit Subsidy</div>
        <div className="text-sm text-white/60 mt-1">Administration System</div>
      </div>
      <nav className="p-4 flex-1">
        {menuItems.map((item, i) => (
          <div key={i} className="has-tooltip relative">
            <a href={item.path} className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-300 ${currentPage === item.id ? 'bg-[#00C7BE] shadow-lg' : 'hover:bg-white/10 hover:translate-x-1'}`}>
              <div className={`icon-${item.icon} text-xl mr-3`}></div>
              <span>{item.label}</span>
            </a>
            {!isOpen && <span className="tooltip bg-gray-800 text-white text-xs rounded py-1 px-2 left-16 top-1/2 -translate-y-1/2">{item.label}</span>}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 mt-auto">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-[#00C7BE] rounded-full flex items-center justify-center text-white font-semibold">
            {userInitials}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{userName}</div>
            <div className="text-xs text-white/60">Administrator</div>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Logout">
            <div className="icon-log-out text-white text-lg"></div>
          </button>
        </div>
        <div className="text-xs text-white/60">© 2025 Painai</div>
      </div>
    </div>
  );
}