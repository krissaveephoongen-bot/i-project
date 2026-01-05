function AdminApprovals() {
  const [worklogs, setWorklogs] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState('worklogs');

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    if (!isLoggedIn || role !== 'admin') window.location.href = '../login.html';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [worklogResult, expenseResult] = await Promise.all([
        trickleListObjects('worklog', 100, true),
        trickleListObjects('expense', 100, true)
      ]);
      setWorklogs((worklogResult.items || []).filter(w => w.objectData.Status === 'pending'));
      setExpenses((expenseResult.items || []).filter(e => e.objectData.Status === 'pending'));
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      await trickleUpdateObject(type, id, { Status: 'approved' });
      loadData();
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleReject = async (type, id) => {
    try {
      await trickleUpdateObject(type, id, { Status: 'rejected' });
      loadData();
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <AdminSidebar isOpen={true} />
      <div className="flex-1 ml-64">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Approval Center</h1>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
              {worklogs.length + expenses.length} Pending
            </span>
          </div>
        </header>

        <main className="p-6">
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button onClick={() => setActiveTab('worklogs')} className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'worklogs' ? 'text-[#0056D2] border-b-2 border-[#0056D2]' : 'text-gray-600 hover:text-gray-900'
            }`}>Worklogs ({worklogs.length})</button>
            <button onClick={() => setActiveTab('expenses')} className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'expenses' ? 'text-[#0056D2] border-b-2 border-[#0056D2]' : 'text-gray-600 hover:text-gray-900'
            }`}>Expenses ({expenses.length})</button>
          </div>

          {activeTab === 'worklogs' && (
            <div className="space-y-4">
              {worklogs.map(log => (
                <div key={log.objectId} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="icon-user text-lg text-blue-600"></div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{log.objectData.UserName}</div>
                          <div className="text-xs text-gray-500">{new Date(log.objectData.Date).toLocaleDateString('th-TH')}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">{log.objectData.Description}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <div className="icon-clock text-base"></div>{log.objectData.Hours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="icon-calendar text-base"></div>{log.objectData.Manday} manday
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleApprove('worklog', log.objectId)} 
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                        <div className="icon-check text-sm"></div>Approve
                      </button>
                      <button onClick={() => handleReject('worklog', log.objectId)} 
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                        <div className="icon-x text-sm"></div>Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {worklogs.length === 0 && <p className="text-center text-gray-500 py-12">No pending worklogs</p>}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {expenses.map(exp => (
                <div key={exp.objectId} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="icon-dollar-sign text-lg text-green-600"></div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{exp.objectData.UserName}</div>
                          <div className="text-xs text-gray-500">{new Date(exp.objectData.Date).toLocaleDateString('th-TH')}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">{exp.objectData.Description}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">฿{(exp.objectData.Amount || 0).toLocaleString()}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{exp.objectData.Category}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleApprove('expense', exp.objectId)} 
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                        <div className="icon-check text-sm"></div>Approve
                      </button>
                      <button onClick={() => handleReject('expense', exp.objectId)} 
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                        <div className="icon-x text-sm"></div>Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-center text-gray-500 py-12">No pending expenses</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminApprovals />);