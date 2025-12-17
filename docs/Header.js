function Header({ setSidebarOpen, sidebarOpen }) {
  try {
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [notifications] = React.useState([
      { id: 1, title: 'New task assigned', time: '5 min ago', type: 'task', icon: 'check-square' },
      { id: 2, title: 'Expense approved', time: '1 hour ago', type: 'expense', icon: 'receipt' },
      { id: 3, title: 'Project update', time: '2 hours ago', type: 'project', icon: 'folder' }
    ]);

    const handleLogout = () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      window.location.href = 'landing.html';
    };

    return (
      <header 
        className="bg-white/90 backdrop-blur-2xl border-b border-white/40 px-4 py-2 shadow-lg sticky top-0 z-20"
        data-name="header" 
        data-file="components/Header.js"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[var(--secondary-color)] rounded-lg transition-all duration-300 mr-2"
            >
              <div className="icon-menu text-lg text-[var(--text-secondary)]"></div>
            </button>
            
            <button
              onClick={() => window.location.href = 'index.html'}
              className="p-2 hover:bg-[var(--secondary-color)] rounded-lg transition-all duration-300 mr-4"
              title="Home"
            >
              <div className="icon-home text-lg text-[var(--text-secondary)]"></div>
            </button>
            
            <div className="relative flex-1 max-w-xl">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className="icon-search text-base text-[var(--text-secondary)]"></div>
              </div>
              <input
                type="text"
                placeholder="ค้นหาโปรเจกต์, งาน หรือสมาชิก..."
                className="w-full pl-10 pr-3 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 hover:bg-[var(--secondary-color)] rounded-xl transition-all duration-300 relative group"
              >
                <div className="icon-bell text-xl text-[var(--text-secondary)] group-hover:text-[var(--primary-color)] transition-colors"></div>
                <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--danger-color)] rounded-full animate-pulse"></div>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 py-3 z-50">
                  <div className="px-4 py-2 border-b border-white/30">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className="px-4 py-3 hover:bg-[var(--secondary-color)] transition-colors cursor-pointer border-b border-white/20">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <div className={`icon-${notif.icon} text-sm text-blue-600`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{notif.title}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-white/30">
                    <button className="text-xs text-[var(--primary-color)] hover:underline font-medium">View all notifications</button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 hover:bg-[var(--secondary-color)] rounded-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] via-blue-500 to-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-sm font-bold text-white">SC</span>
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">สมชาย ใจดี</div>
                  <div className="text-xs text-[var(--text-secondary)]">Project Manager</div>
                </div>
                <div className="icon-chevron-down text-sm text-[var(--text-secondary)]"></div>
              </div>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/30">
                    <div className="font-semibold text-sm text-[var(--text-primary)]">สมชาย ใจดี</div>
                    <div className="text-xs text-[var(--text-secondary)]">somchai@company.com</div>
                  </div>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-[var(--secondary-color)] transition-colors flex items-center text-sm">
                    <div className="icon-user text-base mr-3 text-[var(--text-secondary)]"></div>
                    <span>โปรไฟล์</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-[var(--secondary-color)] transition-colors flex items-center text-sm">
                    <div className="icon-settings text-base mr-3 text-[var(--text-secondary)]"></div>
                    <span>ตั้งค่า</span>
                  </button>
                  <div className="border-t border-white/30 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center text-sm text-red-600"
                  >
                    <div className="icon-log-out text-base mr-3"></div>
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}
