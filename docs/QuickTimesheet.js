function QuickTimesheet() {
  try {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [formData, setFormData] = React.useState({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '18:00',
      description: ''
    });
    const [projects, setProjects] = React.useState([]);
    const [selectedProject, setSelectedProject] = React.useState('');

    React.useEffect(() => {
      loadProjects();
    }, []);

    const loadProjects = async () => {
      try {
        if (typeof trickleListObjects !== 'function') {
          console.log('Database API not available');
          setProjects([]);
          return;
        }
        const result = await trickleListObjects('project', 20, true).catch(err => {
          console.log('Project fetch failed in QuickTimesheet:', err.message);
          return { items: [] };
        });
        setProjects(result?.items || []);
      } catch (error) {
        console.log('Error in loadProjects:', error.message);
        setProjects([]);
      }
    };

    const calculateHours = () => {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      return ((end - start) / (1000 * 60 * 60)).toFixed(1);
    };

    const handleQuickLog = async () => {
      try {
        if (typeof trickleCreateObject !== 'function') {
          console.log('Database not available');
          alert('ไม่สามารถบันทึกข้อมูลได้ในขณะนี้');
          return;
        }
        await trickleCreateObject('worklog', {
          Date: formData.date,
          WorkType: selectedProject ? 'project' : 'office',
          ProjectId: selectedProject,
          StartTime: formData.startTime,
          EndTime: formData.endTime,
          Description: formData.description,
          Status: 'pending',
          UserId: 'current-user'
        }).catch(err => {
          console.log('Failed to create worklog:', err.message);
          throw err;
        });
        setFormData({ ...formData, description: '' });
        setIsExpanded(false);
        alert('บันทึกสำเร็จ');
      } catch (error) {
        console.log('Error in handleQuickLog:', error.message);
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + (error.message || 'Unknown error'));
      }
    };

    return (
      <div className="card" data-name="quick-timesheet" data-file="components/QuickTimesheet.js">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-color)] to-blue-400 flex items-center justify-center">
              <div className="icon-zap text-lg text-white"></div>
            </div>
            <h3 className="text-lg font-semibold">Quick Timesheet</h3>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="btn-secondary text-sm">
            <div className={`icon-${isExpanded ? 'chevron-up' : 'chevron-down'} text-sm mr-2`}></div>
            {isExpanded ? 'ยุบ' : 'ขยาย'}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">วันที่</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">เริ่ม</label>
                <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">สิ้นสุด</label>
                <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">ชั่วโมง</label>
                <div className="px-3 py-2 bg-[var(--secondary-color)] rounded-lg text-center font-semibold text-sm text-[var(--primary-color)]">{calculateHours()} ชม.</div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">โครงการ (ถ้ามี)</label>
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg">
                <option value="">งานสำนักงาน</option>
                {projects.map(p => (<option key={p.objectId} value={p.objectId}>{p.objectData.Name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">รายละเอียด</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg" placeholder="สิ่งที่ทำวันนี้..." />
            </div>
            <button onClick={handleQuickLog} className="btn-primary w-full">
              <div className="icon-check text-sm mr-2"></div>
              บันทึกเร็ว
            </button>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('QuickTimesheet error:', error);
    return null;
  }
}