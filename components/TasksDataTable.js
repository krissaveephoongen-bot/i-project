function TasksDataTable({ projectId, onTaskClick, onAddTask }) {
  const [tasks, setTasks] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState('tasks');

  React.useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      const tasksRes = await trickleListObjects('task', 500, true);
      const taskList = tasksRes.items || [];
      setTasks(taskList.filter(t => t.objectData && t.objectData.ProjectId === projectId));
    } catch (error) {
      console.error('Error loading data:', error);
      setTasks([]);
    }
  };

  const handleDelete = async (taskId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await trickleDeleteObject('task', taskId);
        loadData();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-700',
      progress: 'bg-blue-100 text-blue-700',
      review: 'bg-amber-100 text-amber-700',
      completed: 'bg-green-100 text-green-700'
    };
    return colors[status] || colors.todo;
  };

  if (!projectId) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <div className="icon-folder-open text-4xl text-slate-300 mb-4"></div>
        <p className="text-slate-500">Select a project to view tasks</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Task Management</h2>
        <button
          onClick={onAddTask}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <div className="icon-plus text-lg"></div>
          Add Task
        </button>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Task Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Assignee</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Progress</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Weight</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr 
                  key={task.objectId} 
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="py-3 px-4 text-sm text-slate-900">{task.objectData.Name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{task.objectData.Assignee}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${task.objectData.Progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-600">{task.objectData.Progress || 0}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.objectData.Status)}`}>
                      {task.objectData.Status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{task.objectData.Weight}%</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={(e) => handleDelete(task.objectId, e)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <div className="icon-trash-2 text-lg"></div>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <div className="icon-inbox text-4xl mb-2"></div>
              <p>No tasks yet. Click "Add Task" to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}