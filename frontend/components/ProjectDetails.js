function ProjectDetails({ project, onClose }) {
  try {
    const [tasks, setTasks] = React.useState([]);
    const [expenses, setExpenses] = React.useState([]);
    const [workLogs, setWorkLogs] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('overview');

    React.useEffect(() => {
      if (project) {
        loadProjectData();
      }
    }, [project]);

    const loadProjectData = async () => {
      try {
        if (typeof trickleListObjects !== 'function') {
          console.log('Database not available');
          setTasks([]);
          setExpenses([]);
          setWorkLogs([]);
          return;
        }

        const [taskResult, expenseResult, workLogResult] = await Promise.all([
          trickleListObjects('task', 100, true).catch((err) => {
            console.log('Task fetch failed:', err.message);
            return { items: [] };
          }),
          trickleListObjects('expense', 100, true).catch((err) => {
            console.log('Expense fetch failed:', err.message);
            return { items: [] };
          }),
          trickleListObjects('worklog', 100, true).catch((err) => {
            console.log('Worklog fetch failed:', err.message);
            return { items: [] };
          })
        ]);

        setTasks(taskResult.items?.filter(t => t.objectData.ProjectId === project.id) || []);
        setExpenses(expenseResult.items?.filter(e => e.objectData.ProjectId === project.id) || []);
        setWorkLogs(workLogResult.items?.filter(w => w.objectData.ProjectId === project.id) || []);
      } catch (error) {
        console.log('Error loading project data:', error.message);
        setTasks([]);
        setExpenses([]);
        setWorkLogs([]);
      }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.objectData?.Amount || 0), 0);
    const totalMandays = workLogs.reduce((sum, w) => {
      const start = new Date(`2000-01-01T${w.objectData.StartTime}`);
      const end = new Date(`2000-01-01T${w.objectData.EndTime}`);
      return sum + ((end - start) / (1000 * 60 * 60 * 8));
    }, 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-[var(--border-color)] p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <div className="icon-x text-xl"></div>
            </button>
          </div>

          <div className="p-6">
            <div className="flex space-x-2 mb-6 border-b border-[var(--border-color)]">
              {['overview', 'tasks', 'expenses', 'worklogs'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium capitalize ${
                    activeTab === tab 
                      ? 'text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]' 
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="card">
                    <div className="text-sm text-[var(--text-secondary)]">งบประมาณ</div>
                    <div className="text-2xl font-bold text-[var(--primary-color)]">
                      ฿{(project.budget || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-[var(--text-secondary)]">ค่าใช้จ่ายรวม</div>
                    <div className="text-2xl font-bold text-red-600">
                      ฿{totalExpenses.toLocaleString()}
                    </div>
                  </div>
                  <div className="card">
                    <div className="text-sm text-[var(--text-secondary)]">คงเหลือ</div>
                    <div className="text-2xl font-bold text-green-600">
                      ฿{((project.budget || 0) - totalExpenses).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-2">รายละเอียดโครงการ</h3>
                  <p className="text-[var(--text-secondary)]">{project.description}</p>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-3">สถิติ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-[var(--text-secondary)]">งานทั้งหมด</div>
                      <div className="text-xl font-bold">{tasks.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[var(--text-secondary)]">Manday รวม</div>
                      <div className="text-xl font-bold">{totalMandays.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Task Weight:</span>
                    <span className={`text-sm font-semibold ${
                      Math.abs(tasks.reduce((sum, t) => sum + (t.objectData.Weight || 0), 0) - 100) < 0.01
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {tasks.reduce((sum, t) => sum + (t.objectData.Weight || 0), 0).toFixed(1)}%
                      {Math.abs(tasks.reduce((sum, t) => sum + (t.objectData.Weight || 0), 0) - 100) >= 0.01 && 
                        ` (Should be 100%)`
                      }
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.objectId} className="card">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{task.objectData.Title}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{task.objectData.Description}</p>
                      </div>
                      <span className={`status-badge status-${task.objectData.Status}`}>
                        {task.objectData.Status}
                      </span>
                    </div>
                  </div>
                  ))}
                  {tasks.length === 0 && <p className="text-center text-[var(--text-secondary)]">ไม่มีงาน</p>}
                </div>
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="space-y-3">
                {expenses.map(expense => (
                  <div key={expense.objectId} className="card flex items-center justify-between">
                    <div>
                      <div className="font-medium">{expense.objectData.Category}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{expense.objectData.Description}</div>
                    </div>
                    <div className="text-lg font-bold text-[var(--primary-color)]">
                      ฿{expense.objectData.Amount.toLocaleString()}
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && <p className="text-center text-[var(--text-secondary)]">ไม่มีค่าใช้จ่าย</p>}
              </div>
            )}

            {activeTab === 'worklogs' && (
              <div className="space-y-3">
                {workLogs.map(log => (
                  <div key={log.objectId} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-[var(--text-secondary)]">
                        {new Date(log.objectData.Date).toLocaleDateString('th-TH')}
                      </div>
                      <div className="text-sm">{log.objectData.StartTime} - {log.objectData.EndTime}</div>
                    </div>
                    <p className="text-sm">{log.objectData.Description}</p>
                  </div>
                ))}
                {workLogs.length === 0 && <p className="text-center text-[var(--text-secondary)]">ไม่มีบันทึกงาน</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProjectDetails error:', error);
    return null;
  }
}