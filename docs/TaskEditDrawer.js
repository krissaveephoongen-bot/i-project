function TaskEditDrawer({ task, onClose, onSave }) {
  const [users, setUsers] = React.useState([]);
  const [showTimesheet, setShowTimesheet] = React.useState(false);

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await trickleListObjects('user', 100, true).catch(() => ({ items: [] }));
      setUsers(result.items || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await trickleUpdateObject('task', task.objectId, {
        Name: formData.get('name'),
        Description: formData.get('description'),
        Assignee: formData.get('assignee'),
        Status: formData.get('status'),
        Priority: formData.get('priority'),
        Weight: parseFloat(formData.get('weight')),
        Progress: parseFloat(formData.get('progress')),
        DueDate: formData.get('dueDate'),
        EstimatedHours: parseFloat(formData.get('estimatedHours'))
      });
      onSave();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleLogTime = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const hours = parseFloat(formData.get('hours'));
    try {
      const currentUser = localStorage.getItem('userName') || 'Unknown User';
      await trickleCreateObject('worklog', {
        Date: formData.get('date'),
        UserId: localStorage.getItem('userId') || 'unknown',
        UserName: currentUser,
        WorkType: 'project',
        ProjectId: task.objectData.ProjectId,
        TaskId: task.objectId,
        Description: formData.get('description'),
        StartTime: formData.get('startTime'),
        EndTime: formData.get('endTime'),
        Hours: hours,
        Manday: hours / 8,
        Status: 'pending'
      });
      setShowTimesheet(false);
      alert('Time logged successfully!');
    } catch (error) {
      console.error('Error logging time:', error);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Edit Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        {!showTimesheet ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
              <input name="name" defaultValue={task.objectData.Name} required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" defaultValue={task.objectData.Description} rows="3" className="w-full px-4 py-2 border border-slate-300 rounded-lg"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
              <select name="assignee" defaultValue={task.objectData.Assignee} required className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                {users.map(user => (
                  <option key={user.objectId} value={user.objectData.Name}>{user.objectData.Name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" defaultValue={task.objectData.Status} required className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select name="priority" defaultValue={task.objectData.Priority} required className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (%)</label>
              <input name="weight" type="number" defaultValue={task.objectData.Weight} min="0" max="100" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Progress (%)</label>
              <input name="progress" type="number" defaultValue={task.objectData.Progress || 0} min="0" max="100" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input name="dueDate" type="date" defaultValue={task.objectData.DueDate} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Hours</label>
              <input name="estimatedHours" type="number" defaultValue={task.objectData.EstimatedHours} min="0" step="0.5" className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Task</button>
              <button type="button" onClick={() => setShowTimesheet(true)} className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                <div className="icon-clock text-lg"></div>
                Log Time
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogTime} className="space-y-4">
            <div className="mb-4">
              <button type="button" onClick={() => setShowTimesheet(false)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <div className="icon-arrow-left text-lg"></div>
                Back to Task
              </button>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Log Time for: {task.objectData.Name}</h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" rows="3" required className="w-full px-4 py-2 border border-slate-300 rounded-lg"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input name="startTime" type="time" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                <input name="endTime" type="time" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
              <input name="hours" type="number" min="0" step="0.5" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <button type="submit" className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Submit Time Log</button>
          </form>
        )}
      </div>
    </div>
  );
}
