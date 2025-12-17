function TimesheetForm({ onSave }) {
  try {
    const [formData, setFormData] = React.useState({
      date: new Date().toISOString().split('T')[0],
      workType: 'project',
      projectId: '',
      startTime: '09:00',
      endTime: '18:00',
      description: ''
    });
    
    const [projects] = React.useState([
      { id: '1', name: 'เว็บไซต์ E-commerce' },
      { id: '2', name: 'แอปพลิเคชั่นมือถือ' },
      { id: '3', name: 'ระบบจัดการลูกค้า CRM' }
    ]);

    const calculateHours = () => {
      if (formData.startTime && formData.endTime) {
        const start = new Date(`2000-01-01T${formData.startTime}:00`);
        const end = new Date(`2000-01-01T${formData.endTime}:00`);
        const diff = (end - start) / (1000 * 60 * 60);
        return diff > 0 ? diff : 0;
      }
      return 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const totalHours = calculateHours();
        const timesheetData = {
          ...formData,
          TotalHours: totalHours,
          UserId: 'current-user',
          Status: 'draft'
        };

        await trickleCreateObject('timesheet', timesheetData);
        onSave();
      } catch (error) {
        console.error('Error saving timesheet:', error);
      }
    };

    const handleSubmitForApproval = async (e) => {
      e.preventDefault();
      try {
        const totalHours = calculateHours();
        const timesheetData = {
          ...formData,
          TotalHours: totalHours,
          UserId: 'current-user',
          Status: 'pending',
          SubmittedAt: new Date().toISOString()
        };

        await trickleCreateObject('timesheet', timesheetData);
        onSave();
      } catch (error) {
        console.error('Error submitting timesheet:', error);
      }
    };

    return (
      <div className="max-w-2xl mx-auto" data-name="timesheet-form" data-file="components/TimesheetForm.js">
        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">วันที่</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ประเภทงาน</label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData({...formData, workType: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                required
              >
                <option value="project">งานโครงการ</option>
                <option value="office">งานสำนักงาน</option>
                <option value="leave">ลา</option>
              </select>
            </div>
          </div>

          {formData.workType === 'project' && (
            <div>
              <label className="block text-sm font-medium mb-2">โครงการ</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                required
              >
                <option value="">เลือกโครงการ</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">เวลาเริ่ม</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">เวลาสิ้นสุด</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">รวมชั่วโมง</label>
              <div className="px-3 py-2 bg-[var(--secondary-color)] rounded-lg text-center font-medium">
                {calculateHours().toFixed(1)} ชม.
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">รายละเอียดงาน</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
              placeholder="อธิบายรายละเอียดงานที่ทำ..."
            />
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="btn-secondary flex-1">
              <div className="icon-save text-sm mr-2"></div>
              บันทึกร่าง
            </button>
            <button 
              type="button" 
              onClick={handleSubmitForApproval}
              className="btn-primary flex-1"
            >
              <div className="icon-send text-sm mr-2"></div>
              ส่งขออนุมัติ
            </button>
          </div>
        </form>
      </div>
    );
  } catch (error) {
    console.error('TimesheetForm component error:', error);
    return null;
  }
}