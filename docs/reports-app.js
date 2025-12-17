function UserReports() {
  const [loading, setLoading] = React.useState(true);
  const [reportData, setReportData] = React.useState(null);
  const [userName] = React.useState(localStorage.getItem('userName') || 'User');
  const [filters, setFilters] = React.useState({});
  const [filteredData, setFilteredData] = React.useState(null);

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      window.location.href = '../login.html';
      return;
    }
    loadReportData();
  }, []);

  React.useEffect(() => {
    if (reportData) {
      applyFilters();
    }
  }, [reportData, filters]);

  const applyFilters = () => {
    let filtered = { ...reportData };

    if (filters.startDate) {
      filtered.worklogs = filtered.worklogs.filter(w => 
        new Date(w.objectData.Date) >= new Date(filters.startDate)
      );
      filtered.expenses = filtered.expenses.filter(e => 
        new Date(e.objectData.Date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered.worklogs = filtered.worklogs.filter(w => 
        new Date(w.objectData.Date) <= new Date(filters.endDate)
      );
      filtered.expenses = filtered.expenses.filter(e => 
        new Date(e.objectData.Date) <= new Date(filters.endDate)
      );
    }

    if (filters.projectId) {
      filtered.worklogs = filtered.worklogs.filter(w => w.objectData.ProjectId === filters.projectId);
      filtered.expenses = filtered.expenses.filter(e => e.objectData.ProjectId === filters.projectId);
    }

    setFilteredData(filtered);
  };

  const handleExportExcel = () => {
    const data = filteredData || reportData;
    const exportData = data.worklogs.map(w => ({
      'Date': new Date(w.objectData.Date).toLocaleDateString('th-TH'),
      'Type': w.objectData.WorkType,
      'Description': w.objectData.Description,
      'Hours': w.objectData.Hours || 0,
      'Manday': w.objectData.Manday || 0,
      'Status': w.objectData.Status
    }));
    ExportUtils.exportToExcel(exportData, 'My_Work_Report');
  };

  const handleExportPDF = () => {
    ExportUtils.exportToPDF('user-report-content', 'My_Work_Report');
  };

  const loadReportData = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const [projectsRes, worklogsRes, expensesRes] = await Promise.all([
        trickleListObjects('project', 100, true).catch(() => ({ items: [] })),
        trickleListObjects('worklog', 100, true).catch(() => ({ items: [] })),
        trickleListObjects('expense', 100, true).catch(() => ({ items: [] }))
      ]);

      const myWorklogs = (worklogsRes.items || []).filter(w => w.objectData.UserId === userId);
      const myExpenses = (expensesRes.items || []).filter(e => e.objectData.UserId === userId);

      setReportData({
        projects: projectsRes.items || [],
        worklogs: myWorklogs,
        expenses: myExpenses
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
      React.createElement(UserNav, { currentPage: 'reports' }),
      React.createElement('main', { className: 'max-w-7xl mx-auto px-4 py-6' },
        React.createElement('div', { className: 'text-center py-20' }, 'Loading...')
      )
    );
  }

  const displayData = filteredData || reportData;
  const totalHours = displayData.worklogs.reduce((sum, w) => sum + (w.objectData.Hours || 0), 0);
  const totalMandays = (totalHours / 8).toFixed(2);
  const totalExpenses = displayData.expenses.reduce((sum, e) => sum + (e.objectData.Amount || 0), 0);
  const activeProjects = displayData.projects.filter(p => p.objectData.Status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav currentPage="reports" />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Reports & Analytics</h1>
          <div className="flex gap-3">
            <button onClick={handleExportExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <div className="icon-file-spreadsheet text-lg"></div>
              Export Excel
            </button>
            <button onClick={handleExportPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
              <div className="icon-file-text text-lg"></div>
              Export PDF
            </button>
          </div>
        </div>

        <FilterBar 
          onFilterChange={setFilters}
          showStatusFilter={false}
          showProjectFilter={true}
          projects={reportData?.projects || []}
        />

        <div id="user-report-content">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="icon-clock text-2xl text-blue-600"></div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="icon-calendar text-2xl text-green-600"></div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalMandays}</div>
                  <div className="text-sm text-gray-600">Mandays</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="icon-dollar-sign text-2xl text-purple-600"></div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">฿{totalExpenses.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <div className="icon-briefcase text-2xl text-orange-600"></div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeProjects}</div>
                  <div className="text-sm text-gray-600">Active Projects</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Recent Work Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Hours</th>
                    <th className="text-right py-2">Manday</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayData.worklogs.slice(0, 10).map(w => (
                    <tr key={w.objectId}>
                      <td className="py-2">{new Date(w.objectData.Date).toLocaleDateString('th-TH')}</td>
                      <td className="py-2">{w.objectData.Description}</td>
                      <td className="py-2 text-right">{w.objectData.Hours || 0}</td>
                      <td className="py-2 text-right">{w.objectData.Manday || 0}</td>
                      <td className="py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          w.objectData.Status === 'approved' ? 'bg-green-100 text-green-800' :
                          w.objectData.Status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {w.objectData.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(UserReports));