function Sidebar({ isOpen }) {
  try {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const menuGroups = [
      {
        title: 'Main',
        items: [
          { id: 'index.html', label: 'Dashboard', icon: 'layout-dashboard' }
        ]
      },
      {
        title: 'Work',
        items: [
          { id: 'projects.html', label: 'Projects', icon: 'folder' },
          { id: 'tasks.html', label: 'Tasks', icon: 'check-square' },
          { id: 'worklog.html', label: 'Timesheet', icon: 'clipboard-list' }
        ]
      },
      {
        title: 'Finance',
        items: [
          { id: 'expenses.html', label: 'Expenses', icon: 'receipt' },
          { id: 'approvals.html', label: 'Approvals', icon: 'check-circle' }
        ]
      },
      {
        title: 'Analytics',
        items: [
          { id: 'reports.html', label: 'Reports', icon: 'chart-bar' }
        ]
      }
    ];

    return (
      <div 
        className={`fixed left-0 top-0 h-full bg-white/90 backdrop-blur-2xl border-r border-white/40 transition-all duration-300 ${
          isOpen ? 'w-72' : 'w-20'
        } z-30 shadow-2xl`}
        data-name="sidebar" 
        data-file="components/Sidebar.js"
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/20">
            {isOpen ? (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] via-blue-500 to-[var(--accent-color)] rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="icon-briefcase text-xl text-white"></div>
                </div>
                <div>
                  <img 
                    src="https://app.trickle.so/storage/public/images/usr_1433d77be8000001/ef136bc4-a29c-4c88-88ec-12a2bef41e70.png?w=131&h=40" 
                    alt="Appworks" 
                    className="h-7"
                  />
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Project Management</p>
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <div className="icon-briefcase text-xl text-white"></div>
              </div>
            )}
          </div>
          
          <nav className="flex-1 overflow-y-auto p-3 space-y-6">
            {menuGroups.map((group, idx) => (
              <div key={idx}>
                {isOpen && (
                  <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider px-3 mb-2">
                    {group.title}
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group ${
                        currentPage === item.id 
                          ? 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-lg scale-105' 
                          : 'text-[var(--text-secondary)] hover:bg-[var(--secondary-color)] hover:text-[var(--primary-color)] hover:scale-102'
                      }`}
                      onClick={() => item.id !== currentPage && (window.location.href = item.id)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className={`icon-${item.icon} text-lg flex-shrink-0`}></div>
                        {isOpen && (
                          <span className="ml-3 font-medium truncate">{item.label}</span>
                        )}
                      </div>
                      {isOpen && item.badge && (
                        <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Sidebar component error:', error);
    return null;
  }
}
