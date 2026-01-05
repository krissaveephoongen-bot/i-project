function QuickLogModal({ isOpen, onClose, onSave }) {
  try {
    const [formData, setFormData] = React.useState({
      project: '',
      description: '',
      hours: 1,
      date: new Date().toISOString().split('T')[0]
    });
    const [projects, setProjects] = React.useState([]);

    React.useEffect(() => {
      if (isOpen) loadProjects();
    }, [isOpen]);

    const loadProjects = async () => {
      try {
        if (typeof trickleListObjects !== 'function') {
          setProjects([]);
          return;
        }
        const result = await trickleListObjects('project', 20, true).catch(() => ({ items: [] }));
        setProjects(result?.items || []);
      } catch (error) {
        console.log('Error loading projects:', error.message);
        setProjects([]);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (typeof trickleCreateObject !== 'function') {
          console.error('Database not available');
          return;
        }
        const startHour = 9;
        const endHour = startHour + parseFloat(formData.hours);
        await trickleCreateObject('worklog', {
          Date: formData.date,
          WorkType: formData.project ? 'project' : 'office',
          ProjectId: formData.project,
          StartTime: `${startHour.toString().padStart(2, '0')}:00`,
          EndTime: `${endHour.toString().padStart(2, '0')}:00`,
          Description: formData.description,
          Status: 'pending',
          UserId: 'current-user'
        });
        onSave();
        onClose();
      } catch (error) {
        console.error('Error saving:', error);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-[fadeIn_0.2s]">
        <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 animate-[slideUp_0.3s]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Quick Log</h3>
            <button onClick={onClose} className="p-2"><div className="icon-x text-xl"></div></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})} className="w-full px-4 py-3 border rounded-xl">
              <option value="">Office Work</option>
              {projects.map(p => <option key={p.objectId} value={p.objectId}>{p.objectData.Name}</option>)}
            </select>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 border rounded-xl" placeholder="What did you work on?" required />
            <div className="flex items-center space-x-4">
              <label className="flex-1">Hours</label>
              <input type="number" step="0.5" min="0.5" max="12" value={formData.hours} onChange={(e) => setFormData({...formData, hours: e.target.value})} className="w-24 px-4 py-3 border rounded-xl text-center font-bold" />
            </div>
            <button type="submit" className="w-full py-3 bg-[var(--primary-color)] text-white rounded-xl font-semibold">Save Log</button>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error('QuickLogModal error:', error);
    return null;
  }
}