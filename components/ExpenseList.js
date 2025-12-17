function ExpenseList() {
  try {
    const [expenses, setExpenses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadExpenses();
    }, []);

    const loadExpenses = async () => {
      try {
        if (typeof trickleListObjects !== 'function') {
          console.log('Database not available');
          setExpenses([]);
          setLoading(false);
          return;
        }
        const result = await trickleListObjects('expense', 20, true).catch(err => {
          console.log('Expense fetch failed:', err.message);
          return { items: [] };
        });
        setExpenses(result?.items || []);
      } catch (error) {
        console.log('Error loading expenses:', error.message);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'approved': return 'status-completed';
        case 'pending': return 'status-review';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'draft': return 'status-todo';
        default: return 'status-todo';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'approved': return 'อนุมัติแล้ว';
        case 'pending': return 'รออนุมัติ';
        case 'rejected': return 'ถูกปฏิเสธ';
        case 'draft': return 'ร่าง';
        default: return 'ไม่ทราบสถานะ';
      }
    };

    if (loading) {
      return <div className="text-center py-8">กำลังโหลด...</div>;
    }

    return (
      <div className="space-y-4" data-name="expense-list" data-file="components/ExpenseList.js">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left py-3 px-4 font-medium">วันที่</th>
                  <th className="text-left py-3 px-4 font-medium">หมวดหมู่</th>
                  <th className="text-left py-3 px-4 font-medium">รายละเอียด</th>
                  <th className="text-left py-3 px-4 font-medium">จำนวนเงิน</th>
                  <th className="text-left py-3 px-4 font-medium">สถานะ</th>
                  <th className="text-left py-3 px-4 font-medium">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.objectId} className="border-b border-[var(--border-color)] hover:bg-[var(--secondary-color)]">
                    <td className="py-3 px-4">
                      {new Date(expense.objectData.Date).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {expense.objectData.Category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs truncate">{expense.objectData.Description}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      ฿{expense.objectData.Amount?.toLocaleString() || '0'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`status-badge ${getStatusColor(expense.objectData.Status)}`}>
                        {getStatusText(expense.objectData.Status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <div className="icon-eye text-sm text-[var(--text-secondary)]"></div>
                        </button>
                        {expense.objectData.Status === 'draft' && (
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <div className="icon-edit text-sm text-[var(--text-secondary)]"></div>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            ไม่มีค่าใช้จ่าย
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ExpenseList component error:', error);
    return null;
  }
}