function WorkLogForm({ worklog, onSave }) {
  try {
    const [formData, setFormData] = React.useState({
      date: worklog?.objectData?.Date || new Date().toISOString().split('T')[0],
      workType: worklog?.objectData?.WorkType || 'project',
      projectId: worklog?.objectData?.ProjectId || '',
      taskId: worklog?.objectData?.TaskId || '',
      description: worklog?.objectData?.Description || '',
      startTime: worklog?.objectData?.StartTime || '09:00',
      endTime: worklog?.objectData?.EndTime || '18:00'
    });
    
    const [projects, setProjects] = React.useState([]);
    const [allTasks, setAllTasks] = React.useState([]);
    const [filteredTasks, setFilteredTasks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      loadData();
    }, []);

    React.useEffect(() => {
      if (formData.workType === 'project' && formData.projectId) {
        const projectTasks = allTasks.filter(t => 
          t.objectData && t.objectData.ProjectId === formData.projectId
        );
        setFilteredTasks(projectTasks);
        if (!projectTasks.find(t => t.objectId === formData.taskId)) {
          setFormData(prev => ({ ...prev, taskId: '' }));
        }
      } else {
        setFilteredTasks([]);
      }
    }, [formData.workType, formData.projectId, allTasks]);

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (typeof trickleListObjects !== 'function') {
          setProjects([]);
          setAllTasks([]);
          setLoading(false);
          return;
        }
        
        const [projectsResult, tasksResult] = await Promise.all([
          trickleListObjects('project', 50, true).catch(() => ({items: []})),
          trickleListObjects('task', 100, true).catch(() => ({items: []}))
        ]);
        
        setProjects(projectsResult?.items || []);
        setAllTasks(tasksResult?.items || []);
      } catch (err) {
        console.error('Load data error:', err);
        setError('ไม่สามารถโหลดข้อมูลได้');
        setProjects([]);
        setAllTasks([]);
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (formData.workType === 'project' && !formData.projectId) {
        alert('กรุณาเลือกโครงการสำหรับงานโครงการ');
        return;
      }

      try {
        const workLogData = {
          Date: formData.date,
          WorkType: formData.workType,
          ProjectId: formData.workType === 'project' ? formData.projectId : '',
          TaskId: formData.workType === 'project' ? formData.taskId : '',
          Description: formData.description,
          StartTime: formData.startTime,
          EndTime: formData.endTime,
          UserId: localStorage.getItem('userId') || 'user-1',
          UserName: localStorage.getItem('userName') || 'User',
          Status: 'pending',
          SubmittedAt: new Date().toISOString()
        };

        if (worklog) {
          await trickleUpdateObject('worklog', worklog.objectId, workLogData);
        } else {
          await trickleCreateObject('worklog', workLogData);
        }
        onSave();
      } catch (error) {
        console.error('Error saving work log:', error);
        alert('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
      }
    };

    if (loading) {
      return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
    }

    return (
      <div className="max-w-2xl mx-auto" data-name="worklog-form" data-file="components/WorkLogForm.js">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">วันที่</label>
              <input type="date" value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ประเภทงาน</label>
              <select value={formData.workType}
                onChange={(e) => setFormData({...formData, workType: e.target.value, projectId: '', taskId: ''})}
                className="w-full px-3 py-2 border rounded-lg" required>
                <option value="project">งานโครงการ</option>
                <option value="office">งานสำนักงาน</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          {formData.workType === 'project' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">โครงการ *</label>
                <select value={formData.projectId}
                  onChange={(e) => setFormData({...formData, projectId: e.target.value, taskId: ''})}
                  className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">เลือกโครงการ</option>
                  {projects.map(p => (
                    <option key={p.objectId} value={p.objectId}>{p.objectData.Name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">งาน</label>
                <select value={formData.taskId}
                  onChange={(e) => setFormData({...formData, taskId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg" disabled={!formData.projectId}>
                  <option value="">ไม่ระบุ</option>
                  {filteredTasks.map(t => (
                    <option key={t.objectId} value={t.objectId}>{t.objectData.Name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">เวลาเริ่ม</label>
              <input type="time" value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">เวลาสิ้นสุด</label>
              <input type="time" value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">รายละเอียด</label>
            <textarea value={formData.description} rows={4}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg" required />
          </div>

          <button type="submit" className="btn-primary w-full">
            <div className="icon-save text-sm mr-2"></div>
            บันทึกงาน
          </button>
        </form>
      </div>
    );
  } catch (error) {
    console.error('WorkLogForm error:', error);
    return <div className="text-center py-8 text-red-600">เกิดข้อผิดพลาด</div>;
  }
}