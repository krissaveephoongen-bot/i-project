function ExpenseForm({ expense, onSave, projectId = null }) {
  try {
    const [formData, setFormData] = React.useState({
      date: expense?.objectData?.Date || new Date().toISOString().split('T')[0],
      projectId: projectId || expense?.objectData?.ProjectId || '',
      category: expense?.objectData?.Category || '',
      amount: expense?.objectData?.Amount || '',
      description: expense?.objectData?.Description || ''
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

    const expenseCategories = [
      'การเดินทาง',
      'อาหาร',
      'ที่พัก',
      'อุปกรณ์',
      'ซอฟต์แวร์',
      'ค่าบริการ',
      'อื่นๆ'
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (typeof trickleCreateObject !== 'function') {
          console.error('Database not available');
          return;
        }
        const expenseData = {
          Date: formData.date,
          ProjectId: formData.projectId,
          Category: formData.category,
          Amount: parseFloat(formData.amount),
          Description: formData.description,
          UserId: 'current-user',
          Status: 'pending',
          SubmittedAt: new Date().toISOString()
        };

        if (expense) {
          await trickleUpdateObject('expense', expense.objectId, expenseData);
        } else {
          await trickleCreateObject('expense', expenseData);
        }
        onSave();
      } catch (error) {
        console.error('Error saving expense:', error);
      }
    };

    return (
      <div className="max-w-2xl mx-auto" data-name="expense-form" data-file="components/ExpenseForm.js">
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">วันที่</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">โครงการ</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">หมวดหมู่</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white"
                required
              >
                <option value="">เลือกหมวดหมู่</option>
                {expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">รายละเอียด</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white"
              placeholder="อธิบายรายละเอียดค่าใช้จ่าย..."
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center">
            <div className="icon-save text-lg mr-2"></div>
            บันทึกและส่งขออนุมัติ
          </button>
        </form>
      </div>
    );
  } catch (error) {
    console.error('ExpenseForm component error:', error);
    return null;
  }
}