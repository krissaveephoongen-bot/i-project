const { useState, useEffect } = React;

function ProjectOverviewApp() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn || isLoggedIn !== 'true') {
            window.location.href = '../login.html';
            return;
        }
        
        const userName = localStorage.getItem('userName') || 'User';
        const userRole = localStorage.getItem('userRole') || 'employee';
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
                <div className="icon-loader-2 text-4xl text-blue-600 animate-spin"></div>
            </div>
        );
    }

    if (!projectId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
                <UserNav />
                <div className="p-8 text-center">
                    <p className="text-gray-600">No project selected</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            <UserNav />
            <div className="p-8">
                <ProjectOverviewStats projectId={projectId} />
                <div className="mt-6">
                    <ProjectSCurveSimple projectId={projectId} />
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ProjectOverviewApp />);