function TaskForm({ onSave, task = null, projectId = null }) {
  try {
    const [formData, setFormData] = React.useState({
      title: task?.title || '',
      description: task?.description || '',
      projectId: projectId || task?.projectId || '',
      weight: task?.weight || 10,
      progress: task?.progress || 0,
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      assignee: task?.assignee || '',
      startDate: task?.startDate || new Date().toISOString().split('T')[0],
      dueDate: task?.dueDate || ''
    });

    const [projects, setProjects] = React.useState([]);

    React.useEffect(() => {
      loadProjects();
    }, []);

    const loadProjects = async () => {
      try {
        if (typeof trickleListObjects !== 'function') {
          setProjects([]);
          return;
        }
        const result = await trickleListObjects('project', 50, true).catch(() => ({ items: [] }));
        setProjects(result?.items || []);
      } catch (error) {
        console.log('Error loading projects:', error.message);
        setProjects([]);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (typeof ValidationHelper !== 'undefined') {
        const errors = ValidationHelper.validateTask(formData);
        if (ValidationHelper.showErrors(errors)) return;
      }

      try {
        if (typeof trickleCreateObject !== 'function' || typeof trickleUpdateObject !== 'function') {
          console.error('Database not available');
          return;
        }
        const taskData = {
          Title: formData.title,
          Description: formData.description,
          ProjectId: formData.projectId,
          Weight: parseFloat(formData.weight),
          Progress: parseFloat(formData.progress),
          Status: formData.status,
          Priority: formData.priority,
          Assignee: formData.assignee,
          StartDate: formData.startDate,
          DueDate: formData.dueDate
        };

        if (task) {
          await trickleUpdateObject('task', task.id, taskData);
        } else {
          await trickleCreateObject('task', taskData);
        }
        onSave();
      } catch (error) {
        console.error('Error saving task:', error);
      }
    };

    return (
      <div className="max-w-2xl mx-auto" data-name="task-form" data-file="components/TaskForm.js">
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">ชื่องาน *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">รายละเอียด</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
            />
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
              <input
                type="number"
                name="EstimatedHours"
                defaultValue={task?.objectData.EstimatedHours || 0}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 40"
              />
              <p className="text-xs text-gray-500 mt-1">For worklog-based progress calculation</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planned Start</label>
                <input
                  type="date"
                  name="PlannedStartDate"
                  defaultValue={task?.objectData.PlannedStartDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planned End</label>
                <input
                  type="date"
                  name="PlannedEndDate"
                  defaultValue={task?.objectData.PlannedEndDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
              value={formData.projectId}
              onChange={(e) => setFormData({...formData, projectId: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
              required
              disabled={projectId !== null}
            >
              <option value="">เลือกโครงการ</option>
              {projects.map(project => (
                <option key={project.objectId} value={project.objectId}>
                  {project.objectData.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%)</label>
                <input
                  type="number"
                  name="Weight"
                  defaultValue={task?.objectData.Weight || 0}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                <input
                  type="number"
                  name="EstimatedHours"
                  defaultValue={task?.objectData.EstimatedHours || 0}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned Start Date</label>
                  <input
                    type="date"
                    name="PlannedStartDate"
                    defaultValue={task?.objectData.PlannedStartDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned End Date</label>
                  <input
                    type="date"
                    name="PlannedEndDate"
                    defaultValue={task?.objectData.PlannedEndDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            <div>
              <label className="block text-sm font-medium mb-2">ความคืบหน้า (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({...formData, progress: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">สถานะ</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
              >
                <option value="todo">ต้องทำ</option>
                <option value="progress">กำลังทำ</option>
                <option value="review">รอตรวจสอบ</option>
                <option value="completed">เสร็จแล้ว</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ลำดับความสำคัญ</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
              >
                <option value="low">ต่ำ</option>
                <option value="medium">ปานกลาง</option>
                <option value="high">สูง</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ผู้รับผิดชอบ</label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({...formData, assignee: e.target.value})}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">วันที่เริ่ม</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">วันที่กำหนดส่ง *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            <div className="icon-save text-sm mr-2"></div>
            {task ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างงาน'}
          </button>
        </form>
      </div>
    );
  } catch (error) {
    console.error('TaskForm component error:', error);
    return null;
  }
}