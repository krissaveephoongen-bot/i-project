function DeliveryScheduleTable({ project }) {
  const [schedules, setSchedules] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editingId, setEditingId] = React.useState(null);
  const [editForm, setEditForm] = React.useState({});

  React.useEffect(() => {
    if (project) loadSchedules();
  }, [project]);

  const loadSchedules = async () => {
    try {
      const result = await trickleListObjects(`delivery:${project.objectId}`, 100, true);
      setSchedules(result.items || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.objectId);
    setEditForm(schedule.objectData);
  };

  const handleSave = async (scheduleId) => {
    try {
      await trickleUpdateObject(`delivery:${project.objectId}`, scheduleId, editForm);
      await loadSchedules();
      setEditingId(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleAdd = async () => {
    try {
      await trickleCreateObject(`delivery:${project.objectId}`, {
        Description: 'งวดที่ใหม่',
        Amount: 0,
        PlanDate: new Date().toISOString().split('T')[0],
        ActualDate: '',
        InvoiceDate: '',
        PlanReceived: '',
        ReceiptDate: ''
      });
      await loadSchedules();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateTotals = () => {
    const totalAmount = schedules.reduce((sum, s) => sum + (parseFloat(s.objectData.Amount) || 0), 0);
    const receivedAmount = schedules.reduce((sum, s) => {
      return s.objectData.ReceiptDate ? sum + (parseFloat(s.objectData.Amount) || 0) : sum;
    }, 0);
    return { totalAmount, receivedAmount, remaining: totalAmount - receivedAmount, percentage: totalAmount > 0 ? (receivedAmount / totalAmount * 100).toFixed(1) : 0 };
  };

  if (loading) return <div className="text-center py-4">กำลังโหลด...</div>;

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--slate-200)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[var(--navy-900)]">การส่งมอบงาน</h3>
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          + เพิ่มงวด
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-purple-300">
              <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center">Description</th>
              <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-center">Amount</th>
              <th colSpan="5" className="border border-gray-300 px-3 py-2 text-center bg-purple-200">การชำระเงิน</th>
            </tr>
            <tr className="bg-purple-200">
              <th className="border border-gray-300 px-3 py-2 text-center">Plan Date</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Actual Date</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Invoice Date</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Plan Received</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Receipt Date</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, idx) => {
              const isEditing = editingId === schedule.objectId;
              const data = isEditing ? editForm : schedule.objectData;

              return (
                <tr key={schedule.objectId} className={idx % 2 === 0 ? 'bg-orange-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-3 py-2">
                    {isEditing ? (
                      <input type="text" value={data.Description || ''} onChange={(e) => setEditForm({...editForm, Description: e.target.value})} className="w-full px-2 py-1 border rounded" />
                    ) : data.Description}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {isEditing ? (
                      <input type="number" value={data.Amount || ''} onChange={(e) => setEditForm({...editForm, Amount: e.target.value})} className="w-full px-2 py-1 border rounded text-right" />
                    ) : (data.Amount || 0).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {isEditing ? (
                      <input type="date" value={data.PlanDate || ''} onChange={(e) => setEditForm({...editForm, PlanDate: e.target.value})} className="w-full px-2 py-1 border rounded" />
                    ) : formatDate(data.PlanDate)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {isEditing ? (
                      <input type="date" value={data.ActualDate || ''} onChange={(e) => setEditForm({...editForm, ActualDate: e.target.value})} className="w-full px-2 py-1 border rounded" />
                    ) : formatDate(data.ActualDate)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {isEditing ? (
                      <input type="date" value={data.InvoiceDate || ''} onChange={(e) => setEditForm({...editForm, InvoiceDate: e.target.value})} className="w-full px-2 py-1 border rounded" />
                    ) : formatDate(data.InvoiceDate)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {isEditing ? (
                      <input type="date" value={data.PlanReceived || ''} onChange={(e) => setEditForm({...editForm, PlanReceived: e.target.value})} className="w-full px-2 py-1 border rounded" />
                    ) : formatDate(data.PlanReceived)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {isEditing ? (
                      <input type="date" value={data.ReceiptDate || ''} onChange={(e) => setEditForm({...editForm, ReceiptDate: e.target.value})} className="w-full px-2 py-1 border rounded" />
                    ) : formatDate(data.ReceiptDate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-blue-50 font-semibold">
            <tr>
              <td className="border border-gray-300 px-3 py-3">รวม</td>
              <td className="border border-gray-300 px-3 py-3 text-right">฿{totals.totalAmount.toLocaleString()}</td>
              <td colSpan="5" className="border border-gray-300 px-3 py-3">
                <div className="flex items-center gap-4 text-sm">
                  <span>รับชำระแล้ว: ฿{totals.receivedAmount.toLocaleString()} ({totals.percentage}%)</span>
                  <span>คงเหลือ: ฿{totals.remaining.toLocaleString()}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}