function UserTimesheet() {
  const [worklogs, setWorklogs] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editingLog, setEditingLog] = React.useState(null);
  const [stats, setStats] = React.useState({ current: {}, previous: {} });

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

      const userName = localStorage.getItem('userName') || 'User';
      const [logResult, projectResult, taskResult] = await Promise.all([
        trickleListObjects('worklog', 100, true).catch(() => ({ items: [] })),
        trickleListObjects('project', 100, true).catch(() => ({ items: [] })),
        trickleListObjects('task', 100, true).catch(() => ({ items: [] }))
      ]);
      const userLogs = (logResult.items || []).filter(w => w.objectData.UserName === userName);
      setWorklogs(userLogs);
      setProjects(projectResult.items || []);
      setTasks(taskResult.items || []);
      calculateStats(userLogs);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getWorkingDays = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    return workingDays;
  };

  const calculateStats = (logs) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const currentMonthLogs = logs.filter(log => {
      const logDate = new Date(log.objectData.Date);
      return logDate.getFullYear() === currentYear && logDate.getMonth() === currentMonth;
    });
    
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthLogs = logs.filter(log => {
      const logDate = new Date(log.objectData.Date);
      return logDate.getFullYear() === previousYear && logDate.getMonth() === previousMonth;
    });
    
    const currentWorkingDays = getWorkingDays(currentYear, currentMonth);
    const previousWorkingDays = getWorkingDays(previousYear, previousMonth);
    
    const currentLoggedDays = new Set(currentMonthLogs.map(log => log.objectData.Date)).size;
    const previousLoggedDays = new Set(previousMonthLogs.map(log => log.objectData.Date)).size;
    
    setStats({
      current: {
        month: now.toLocaleString('th-TH', { month: 'long', year: 'numeric' }),
        workingDays: currentWorkingDays,
        loggedDays: currentLoggedDays,
        missingDays: Math.max(0, currentWorkingDays - currentLoggedDays),
        totalHours: currentMonthLogs.reduce((sum, log) => sum + (log.objectData.Hours || 0), 0),
        totalMandays: currentMonthLogs.reduce((sum, log) => sum + (log.objectData.Manday || 0), 0)
      },
      previous: {
        month: new Date(previousYear, previousMonth).toLocaleString('th-TH', { month: 'long', year: 'numeric' }),
        workingDays: previousWorkingDays,
        loggedDays: previousLoggedDays,
        missingDays: Math.max(0, previousWorkingDays - previousLoggedDays),
        totalHours: previousMonthLogs.reduce((sum, log) => sum + (log.objectData.Hours || 0), 0),
        totalMandays: previousMonthLogs.reduce((sum, log) => sum + (log.objectData.Manday || 0), 0)
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const workType = formData.get('workType');
    const hours = parseFloat(formData.get('hours'));
    const manday = hours / 8;
    
    if (workType === 'project' && !formData.get('projectId')) {
      alert('Please select a project for project work');
      return;
    }
    
    try {
      const logData = {
        Date: formData.get('date'),
        UserId: localStorage.getItem('userId') || '1',
        UserName: localStorage.getItem('userName') || 'User',
        WorkType: workType,
        ProjectId: workType === 'project' ? formData.get('projectId') : '',
        TaskId: workType === 'project' ? formData.get('taskId') : '',
        Description: formData.get('description'),
        StartTime: formData.get('startTime'),
        EndTime: formData.get('endTime'),
        Hours: hours,
        Manday: manday,
        Status: 'pending'
      };
      
      if (editingLog) {
        await trickleUpdateObject('worklog', editingLog.objectId, logData);
      } else {
        await trickleCreateObject('worklog', logData);
      }
      setShowForm(false);
      setEditingLog(null);
      loadData();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (logId) => {
    if (!confirm('Delete this worklog?')) return;
    try {
      await trickleDeleteObject('worklog', logId);
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <UserNav currentPage="timesheet" />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Timesheet</h1>
          <button onClick={() => setShowForm(true)} 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Log Time
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <div className="icon-calendar text-xl text-blue-600"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{stats.current.month}</h3>
                <p className="text-sm text-gray-500">Current Month</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Working Days</span>
                <span className="font-semibold">{stats.current.workingDays} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Logged Days</span>
                <span className="font-semibold text-green-600">{stats.current.loggedDays} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Missing Days</span>
                <span className="font-semibold text-red-600">{stats.current.missingDays} days</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Hours</span>
                  <span className="font-semibold">{stats.current.totalHours?.toFixed(1) || 0} hrs</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Total Mandays</span>
                  <span className="font-semibold">{stats.current.totalMandays?.toFixed(2) || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <div className="icon-calendar-clock text-xl text-gray-600"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{stats.previous.month}</h3>
                <p className="text-sm text-gray-500">Previous Month</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Working Days</span>
                <span className="font-semibold">{stats.previous.workingDays} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Logged Days</span>
                <span className="font-semibold text-green-600">{stats.previous.loggedDays} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Missing Days</span>
                <span className="font-semibold text-red-600">{stats.previous.missingDays} days</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Hours</span>
                  <span className="font-semibold">{stats.previous.totalHours?.toFixed(1) || 0} hrs</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Total Mandays</span>
                  <span className="font-semibold">{stats.previous.totalMandays?.toFixed(2) || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {worklogs.map(log => (
            <div key={log.objectId} className="bg-white rounded-xl p-5 shadow-md">
              <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-semibold">{log.objectData.Hours}h</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    log.objectData.WorkType === 'project' ? 'bg-blue-100 text-blue-700' :
                    log.objectData.WorkType === 'office' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {log.objectData.WorkType === 'project' ? 'Project' :
                     log.objectData.WorkType === 'office' ? 'Office' : 'Other'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    log.objectData.Status === 'approved' ? 'bg-green-100 text-green-700' :
                    log.objectData.Status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{log.objectData.Status}</span>
                </div>
                  <div className="text-sm text-gray-600">{log.objectData.Description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(log.objectData.Date).toLocaleDateString()} • {log.objectData.StartTime}-{log.objectData.EndTime}
                  </div>
                </div>
                {log.objectData.Status === 'pending' && (
                  <div className="flex space-x-2">
                    <button onClick={() => { setEditingLog(log); setShowForm(true); }} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <div className="icon-edit text-lg"></div>
                    </button>
                    <button onClick={() => handleDelete(log.objectId)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <div className="icon-trash-2 text-lg"></div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
               onClick={() => { setShowForm(false); setEditingLog(null); }}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" 
                 onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">{editingLog ? 'Edit Worklog' : 'Log Time'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4" id="timesheet-form">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input type="date" name="date" defaultValue={editingLog?.objectData.Date || getTodayDate()} 
                         required className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Work Type</label>
                  <select name="workType" defaultValue={editingLog?.objectData.WorkType || 'project'} 
                          onChange={(e) => {
                            const form = document.getElementById('timesheet-form');
                            const projectDiv = form.querySelector('#project-fields');
                            projectDiv.style.display = e.target.value === 'project' ? 'block' : 'none';
                          }}
                          required className="w-full px-4 py-2 border rounded-lg">
                    <option value="project">Project Work</option>
                    <option value="office">Office Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div id="project-fields" style={{display: (!editingLog || editingLog.objectData.WorkType === 'project') ? 'block' : 'none'}}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Project *</label>
                    <select name="projectId" defaultValue={editingLog?.objectData.ProjectId}
                            onChange={(e) => {
                              const selectedProjectId = e.target.value;
                              const taskSelect = document.querySelector('select[name="taskId"]');
                              const filteredTasks = tasks.filter(t => t.objectData.ProjectId === selectedProjectId);
                              taskSelect.innerHTML = '<option value="">Select Task</option>' + 
                                filteredTasks.map(t => `<option value="${t.objectId}">${t.objectData.Name}</option>`).join('');
                            }}
                            className="w-full px-4 py-2 border rounded-lg">
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p.objectId} value={p.objectId}>{p.objectData.Name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Task</label>
                    <select name="taskId" defaultValue={editingLog?.objectData.TaskId} 
                            className="w-full px-4 py-2 border rounded-lg">
                      <option value="">Select Task</option>
                      {tasks.filter(t => !editingLog || t.objectData.ProjectId === editingLog.objectData.ProjectId)
                           .map(t => <option key={t.objectId} value={t.objectId}>{t.objectData.Name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <input type="time" name="startTime" defaultValue={editingLog?.objectData.StartTime} 
                           required className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <input type="time" name="endTime" defaultValue={editingLog?.objectData.EndTime} 
                           required className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hours</label>
                  <input type="number" step="0.5" name="hours" defaultValue={editingLog?.objectData.Hours} 
                         required className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea name="description" rows="2" defaultValue={editingLog?.objectData.Description} 
                            required className="w-full px-4 py-2 border rounded-lg"></textarea>
                </div>
                <div className="flex space-x-3">
                  <button type="button" onClick={() => { setShowForm(false); setEditingLog(null); }} 
                          className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">
                    {editingLog ? 'Update' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<UserTimesheet />);