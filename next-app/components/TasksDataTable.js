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
    // Traffic light status system
    const colors = {
      todo: 'bg-neutral-100 text-neutral-700 border border-neutral-300',
      progress: 'bg-accent-50 text-accent-700 border border-accent-200',
      review: 'bg-warning-50 text-warning-700 border border-warning-200',
      completed: 'bg-success-50 text-success-700 border border-success-200'
    };
    return colors[status] || colors.todo;
  };

  if (!projectId) {
    return (
      <div className="bg-background-base border border-neutral-200 rounded-lg p-12 text-center shadow-sm">
        <div className="icon-folder-open text-4xl text-neutral-300 mb-4"></div>
        <p className="text-neutral-500">Select a project to view tasks</p>
      </div>
    );
  }

  return (
    <div className="bg-background-base border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
      <div className="border-b border-neutral-200 px-6 py-4 flex justify-between items-center bg-background-light">
        <h2 className="text-xl font-semibold text-neutral-900">Task Management</h2>
        <button
          onClick={onAddTask}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 font-medium"
        >
          <div className="icon-plus text-lg"></div>
          Add Task
        </button>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Task Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Assignee</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Progress</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">Weight</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr 
                  key={task.objectId} 
                  className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="py-3 px-4 text-sm text-neutral-900 font-medium">{task.objectData.Name}</td>
                  <td className="py-3 px-4 text-sm text-neutral-600">{task.objectData.Assignee}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-neutral-200 rounded-full h-2 shadow-xs">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                          style={{ width: `${task.objectData.Progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-neutral-600 font-medium">{task.objectData.Progress || 0}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.objectData.Status)}`}>
                      {task.objectData.Status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600">{task.objectData.Weight}%</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={(e) => handleDelete(task.objectId, e)}
                      className="text-error-600 hover:text-error-700 transition-colors"
                    >
                      <div className="icon-trash-2 text-lg"></div>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <div className="icon-inbox text-4xl mb-2"></div>
              <p>No tasks yet. Click "Add Task" to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}