function TaskList({ tasks, detailed = false }) {
  try {
    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'status-completed';
        case 'progress': return 'status-progress';
        case 'review': return 'status-review';
        case 'todo': return 'status-todo';
        default: return 'status-todo';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'completed': return 'เสร็จแล้ว';
        case 'progress': return 'กำลังทำ';
        case 'review': return 'รอตรวจสอบ';
        case 'todo': return 'ต้องทำ';
        default: return 'ไม่ทราบสถานะ';
      }
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return 'text-error-600';
        case 'medium': return 'text-warning-600';
        case 'low': return 'text-primary-600';
        default: return 'text-neutral-600';
      }
    };

    const getPriorityText = (priority) => {
      switch (priority) {
        case 'high': return 'สูง';
        case 'medium': return 'ปานกลาง';
        case 'low': return 'ต่ำ';
        default: return 'ปานกลาง';
      }
    };

    return (
      <div className="space-y-3" data-name="task-list" data-file="components/TaskList.js">
        {tasks.map(task => (
          <div key={task.id} className={`${detailed ? 'bg-background-base' : 'bg-background-light'} border border-neutral-200 rounded-lg p-4 shadow-xs hover:shadow-sm transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                    {task.title}
                  </h4>
                  {detailed && (
                    <p className="text-sm text-neutral-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`status-badge ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      ลำดับความสำคัญ: {getPriorityText(task.priority)}
                    </span>
                    {detailed && (
                      <>
                        <div className="flex items-center text-xs text-neutral-500">
                          <div className="icon-calendar text-xs mr-1"></div>
                          <span>{new Date(task.dueDate).toLocaleDateString('th-TH')}</span>
                        </div>
                        <div className="flex items-center text-xs text-neutral-500">
                          <div className="icon-user text-xs mr-1"></div>
                          <span>{task.assignee}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {!detailed && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{task.assignee?.charAt(0) || 'A'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('TaskList component error:', error);
    return null;
  }
}
