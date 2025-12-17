function TopNav() {
  try {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);

    const handleLogout = () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      window.location.href = 'landing.html';
    };

    const menuItems = [
      { id: 'index.html', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'projects.html', label: 'Projects', icon: 'folder' },
      { id: 'tasks.html', label: 'Tasks', icon: 'check-square' },
      { id: 'worklog.html', label: 'Timesheet', icon: 'clipboard-list' },
      { id: 'expenses.html', label: 'Expenses', icon: 'receipt' },
      { id: 'approvals.html', label: 'Approvals', icon: 'check-circle' },
      { id: 'reports.html', label: 'Reports', icon: 'chart-bar' }
    ];

    const notifications = [
      { id: 1, title: 'New task assigned', time: '5 min ago', icon: 'check-square' },
      { id: 2, title: 'Expense approved', time: '1 hour ago', icon: 'receipt' }
    ];

    return (
      <nav className="bg-white/90 backdrop-blur-2xl border-b border-white/40 shadow-lg sticky top-0 z-50" data-name="top-nav" data-file="components/TopNav.js">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-md">
                  <div className="icon-briefcase text-lg text-white"></div>
                </div>
                <img src="https://app.trickle.so/storage/public/images/usr_1433d77be8000001/ef136bc4-a29c-4c88-88ec-12a2bef41e70.png?w=131&h=40" alt="Appworks" className="h-6" />
              </div>
              
              <div className="hidden lg:flex items-center space-x-1">
                {menuItems.map(item => (
                  <a key={item.id} href={item.id} className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${currentPage === item.id ? 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--secondary-color)] hover:text-[var(--primary-color)]'}`}>
                    <div className={`icon-${item.icon} text-base mr-2`}></div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-[var(--secondary-color)] rounded-lg transition-all relative">
                  <div className="icon-bell text-xl text-[var(--text-secondary)]"></div>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 py-2 z-50">
                    {notifications.map(notif => (
                      <div key={notif.id} className="px-4 py-3 hover:bg-[var(--secondary-color)] cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <div className={`icon-${notif.icon} text-sm text-blue-600`}></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <div onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 px-3 py-2 hover:bg-[var(--secondary-color)] rounded-xl cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">SC</span>
                  </div>
                  <div className="icon-chevron-down text-sm text-[var(--text-secondary)]"></div>
                </div>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/30">
                      <div className="font-semibold text-sm">สมชาย ใจดี</div>
                      <div className="text-xs text-[var(--text-secondary)]">somchai@company.com</div>
                    </div>
                    <button className="w-full px-4 py-2 text-left hover:bg-[var(--secondary-color)] text-sm flex items-center">
                      <div className="icon-user text-base mr-2"></div>
                      โปรไฟล์
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-[var(--secondary-color)] text-sm flex items-center">
                      <div className="icon-settings text-base mr-2"></div>
                      ตั้งค่า
                    </button>
                    <div className="border-t border-white/30 my-1"></div>
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left hover:bg-red-50 text-sm text-red-600 flex items-center">
                      <div className="icon-log-out text-base mr-2"></div>
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  } catch (error) {
    console.error('TopNav component error:', error);
    return null;
  }
}