function UserDashboard() {
  const [projects, setProjects] = React.useState([]);
  const [worklogs, setWorklogs] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const userName = localStorage.getItem('userName') || 'User';

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) window.location.href = '../login.html';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (typeof trickleListObjects !== 'function') {
        return;
      }

      const [projectResult, worklogResult, expenseResult] = await Promise.all([
        trickleListObjects('project', 100, true).catch(() => ({ items: [] })),
        trickleListObjects('worklog', 100, true).catch(() => ({ items: [] })),
        trickleListObjects('expense', 100, true).catch(() => ({ items: [] }))
      ]);
      setProjects(projectResult.items || []);
      setWorklogs((worklogResult.items || []).filter(w => w.objectData.UserName === userName));
      setExpenses((expenseResult.items || []).filter(e => e.objectData.UserName === userName));
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const activeProjects = projects.filter(p => p.objectData.Status === 'active').length;
  const totalHours = worklogs.filter(w => w.objectData.Status === 'approved').reduce((sum, w) => sum + (w.objectData.Hours || 0), 0);
  const pendingCount = worklogs.filter(w => w.objectData.Status === 'pending').length + expenses.filter(e => e.objectData.Status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <UserNav currentPage="dashboard" />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Welcome back, {userName}!</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Active Projects</div>
                <div className="text-3xl font-bold mt-2">{activeProjects}</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <div className="icon-folder text-2xl text-blue-600"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Hours This Month</div>
                <div className="text-3xl font-bold mt-2">{totalHours}h</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <div className="icon-clock text-2xl text-green-600"></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Pending Approvals</div>
                <div className="text-3xl font-bold mt-2">{pendingCount}</div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <div className="icon-clock text-2xl text-yellow-600"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-bold text-lg mb-4">Recent Worklogs</h2>
            <div className="space-y-3">
              {worklogs.slice(0, 5).map(log => (
                <div key={log.objectId} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="text-sm font-medium">{log.objectData.Description}</div>
                    <div className="text-xs text-gray-500">{new Date(log.objectData.Date).toLocaleDateString()}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    log.objectData.Status === 'approved' ? 'bg-green-100 text-green-700' :
                    log.objectData.Status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{log.objectData.Status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-bold text-lg mb-4">Recent Expenses</h2>
            <div className="space-y-3">
              {expenses.slice(0, 5).map(exp => (
                <div key={exp.objectId} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="text-sm font-medium">{exp.objectData.Description}</div>
                    <div className="text-xs text-gray-500">฿{exp.objectData.Amount?.toLocaleString()}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    exp.objectData.Status === 'approved' ? 'bg-green-100 text-green-700' :
                    exp.objectData.Status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{exp.objectData.Status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<UserDashboard />);