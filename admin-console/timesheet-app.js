function TimesheetApp() {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [refreshKey, setRefreshKey] = React.useState(0);

    React.useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userRole = localStorage.getItem('userRole');
        
        if (!isLoggedIn || isLoggedIn !== 'true') {
            window.location.href = '../login.html';
            return;
        }
        
        if (userRole !== 'admin') {
            window.location.href = '../user-portal/dashboard.html';
            return;
        }
        
        const userName = localStorage.getItem('userName') || 'Admin';
        const userEmail = localStorage.getItem('userEmail') || '';
        
        setUser({ name: userName, role: userRole, email: userEmail });
        setLoading(false);
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="icon-loader-2 text-4xl text-blue-400 animate-spin"></div>
                    <p className="mt-4 text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <AdminSidebar isOpen={true} />
            <div className="flex-1 ml-64">
                <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Timesheet Dashboard</h1>
                            <p className="text-gray-300 mt-2">Monitor and approve team timesheets</p>
                        </div>
                        <button onClick={handleRefresh} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                            <div className="icon-refresh-cw text-lg"></div>
                            Refresh
                        </button>
                    </div>
                </header>
                <main className="p-8">
                    <div className="space-y-6">
                        <TimesheetStats key={refreshKey} />
                        <TimesheetTable key={refreshKey} onUpdate={handleRefresh} />
                    </div>
                </main>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(TimesheetApp));