function InvoiceTable({ projectId }) {
  const [invoices, setInvoices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);

  React.useEffect(() => {
    loadInvoices();
  }, [projectId]);

  const loadInvoices = async () => {
    try {
      if (typeof trickleListObjects !== 'function') {
        setInvoices([]);
        setLoading(false);
        return;
      }

      const result = await trickleListObjects('invoice', 100, true).catch(() => ({ items: [] }));
      const filtered = (result?.items || []).filter(
        inv => inv.objectData?.ProjectId === projectId
      );
      setInvoices(filtered);
    } catch (err) {
      console.error('Load invoices error:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">กำลังโหลด...</div>;

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">ตารางวางบิล</h2>
        <button onClick={() => setShowForm(!showForm)} 
          className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">
          <div className="icon-plus text-sm"></div>
        </button>
      </div>

      {showForm && <InvoiceForm projectId={projectId} onSave={() => {
        setShowForm(false);
        loadInvoices();
      }} />}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">การส่งมอบงาน</th>
              <th className="px-4 py-3 text-center">การเรียกเก็บ</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr key={inv.objectId} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{inv.objectData.Description}</td>
                <td className="px-4 py-3 text-right">
                  {(inv.objectData.Amount || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs space-y-1">
                    <div>Plan: {inv.objectData.PlanDate || '-'}</div>
                    <div>Actual: {inv.objectData.ActualDate || '-'}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs space-y-1">
                    <div>Invoice: {inv.objectData.InvoiceDate || '-'}</div>
                    <div>Plan Received: {inv.objectData.PlanReceivedDate || '-'}</div>
                    <div>Receipt: {inv.objectData.ReceiptDate || '-'}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceForm({ projectId, onSave }) {
  const [form, setForm] = React.useState({
    phase: 1,
    description: '',
    amount: '',
    planDate: '',
    actualDate: '',
    invoiceDate: '',
    planReceivedDate: '',
    receiptDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (typeof trickleCreateObject !== 'function') {
        alert('ระบบไม่พร้อมใช้งาน กรุณารีเฟรชหน้าเว็บ');
        return;
      }

      await trickleCreateObject('invoice', {
        ProjectId: projectId,
        Phase: parseInt(form.phase),
        Description: form.description,
        Amount: parseFloat(form.amount),
        PlanDate: form.planDate,
        ActualDate: form.actualDate,
        InvoiceDate: form.invoiceDate,
        PlanReceivedDate: form.planReceivedDate,
        ReceiptDate: form.receiptDate,
        Status: 'pending'
      });
      onSave();
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-3">
      <input type="number" placeholder="งวดที่" value={form.phase}
        onChange={e => setForm({...form, phase: e.target.value})}
        className="px-3 py-2 border rounded" required />
      <input type="text" placeholder="รายละเอียด" value={form.description}
        onChange={e => setForm({...form, description: e.target.value})}
        className="px-3 py-2 border rounded" required />
      <input type="number" placeholder="จำนวนเงิน" value={form.amount}
        onChange={e => setForm({...form, amount: e.target.value})}
        className="px-3 py-2 border rounded" required />
      <input type="date" placeholder="Plan Date" value={form.planDate}
        onChange={e => setForm({...form, planDate: e.target.value})}
        className="px-3 py-2 border rounded" />
      <button type="submit" className="col-span-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded">
        บันทึก
      </button>
    </form>
  );
}