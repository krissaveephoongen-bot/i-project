function AnalyticsApp() {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

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
        
        setUser({ 
            name: userName, 
            role: userRole,
            email: userEmail 
        });
        setLoading(false);
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
                        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                        <div className="text-sm text-gray-400">{new Date().toLocaleDateString('th-TH')}</div>
                    </div>
                </header>
                <main className="p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                        <p className="text-gray-300 mt-2">Comprehensive project performance analytics</p>
                    </div>
                    <div className="space-y-6">
                        <AnalyticsSummary />
                        <AnalyticsSCurve />
                        <AnalyticsTable />
                    </div>
                </main>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(AnalyticsApp));