function ProjectManage() {
  const [project, setProject] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState(null);
  const projectId = new URLSearchParams(window.location.search).get('id');
  const userName = localStorage.getItem('userName');

  React.useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      window.location.href = '../login.html';
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [proj, taskList] = await Promise.all([
        trickleGetObject('project', projectId),
        trickleListObjects('task', 100, true)
      ]);
      setProject(proj);
      setTasks(taskList.items.filter(t => t.objectData.ProjectId === projectId));
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      const data = { ...taskData, ProjectId: projectId };
      if (editingTask) {
        await trickleUpdateObject('task', editingTask.objectId, data);
      } else {
        await trickleCreateObject('task', data);
      }
      setShowTaskForm(false);
      setEditingTask(null);
      await loadData();
    } catch (error) {
      console.error('Save task error:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('ลบงานนี้?')) return;
    try {
      await trickleDeleteObject('task', taskId);
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="icon-loader-2 text-4xl animate-spin text-blue-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <UserNav />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{project.objectData.Name}</h1>
          <p className="text-gray-600">{project.objectData.Description}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Tasks</h2>
            <button onClick={() => { setEditingTask(null); setShowTaskForm(true); }} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <div className="icon-plus text-lg"></div>
              <span>Add Task</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.objectId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{task.objectData.Name}</h3>
                    <p className="text-sm text-gray-600">{task.objectData.Description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingTask(task); setShowTaskForm(true); }} 
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded">
                      <div className="icon-edit text-lg"></div>
                    </button>
                    <button onClick={() => handleDeleteTask(task.objectId)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded">
                      <div className="icon-trash-2 text-lg"></div>
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Assignee: {task.objectData.Assignee || 'Unassigned'}</span>
                  <span>Weight: {task.objectData.Weight}%</span>
                  <span>Progress: {task.objectData.Progress}%</span>
                  <span className={`px-2 py-1 rounded ${task.objectData.Status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {task.objectData.Status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {showTaskForm && (
          <TaskFormModal task={editingTask} onSave={handleSaveTask} onClose={() => { setShowTaskForm(false); setEditingTask(null); }} />
        )}
      </main>
    </div>
  );
}

function TaskFormModal({ task, onSave, onClose }) {
  const [formData, setFormData] = React.useState({
    Name: task?.objectData.Name || '',
    Description: task?.objectData.Description || '',
    Assignee: task?.objectData.Assignee || '',
    Status: task?.objectData.Status || 'todo',
    Priority: task?.objectData.Priority || 'medium',
    Weight: task?.objectData.Weight || 0,
    Progress: task?.objectData.Progress || 0,
    DueDate: task?.objectData.DueDate || ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-4">{task ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Task Name</label>
            <input type="text" value={formData.Name} onChange={e => setFormData({...formData, Name: e.target.value})} 
                   className="w-full px-3 py-2 border rounded-lg" required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.Description} onChange={e => setFormData({...formData, Description: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg" rows="2"></textarea></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Assignee</label>
              <input type="text" value={formData.Assignee} onChange={e => setFormData({...formData, Assignee: e.target.value})} 
                     className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" value={formData.DueDate} onChange={e => setFormData({...formData, DueDate: e.target.value})} 
                     className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Weight (%)</label>
              <input type="number" value={formData.Weight} onChange={e => setFormData({...formData, Weight: Number(e.target.value)})} 
                     className="w-full px-3 py-2 border rounded-lg" min="0" max="100" /></div>
            <div><label className="block text-sm font-medium mb-1">Progress (%)</label>
              <input type="number" value={formData.Progress} onChange={e => setFormData({...formData, Progress: Number(e.target.value)})} 
                     className="w-full px-3 py-2 border rounded-lg" min="0" max="100" /></div>
            <div><label className="block text-sm font-medium mb-1">Priority</label>
              <select value={formData.Priority} onChange={e => setFormData({...formData, Priority: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Status</label>
            <select value={formData.Status} onChange={e => setFormData({...formData, Status: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg">
              <option value="todo">To Do</option><option value="progress">In Progress</option>
              <option value="review">Review</option><option value="completed">Completed</option>
            </select></div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ProjectManage />);