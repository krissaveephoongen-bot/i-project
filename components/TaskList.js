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
        case 'high': return 'text-red-600';
        case 'medium': return 'text-yellow-600';
        case 'low': return 'text-green-600';
        default: return 'text-gray-600';
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
          <div key={task.id} className={`${detailed ? 'card' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4'} hover:shadow-sm transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                />
                <div className="flex-1">
                  <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                    {task.title}
                  </h4>
                  {detailed && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{task.description}</p>
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
                        <div className="flex items-center text-xs text-[var(--text-secondary)]">
                          <div className="icon-calendar text-xs mr-1"></div>
                          <span>{new Date(task.dueDate).toLocaleDateString('th-TH')}</span>
                        </div>
                        <div className="flex items-center text-xs text-[var(--text-secondary)]">
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
                  <div className="w-6 h-6 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
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
