function PendingApprovals() {
  try {
    const [approvals, setApprovals] = React.useState([]);

    React.useEffect(() => {
      loadApprovals();
    }, []);

    const loadApprovals = async () => {
      try {
        if (typeof trickleListObjects !== 'function') {
          setApprovals([]);
          return;
        }
        const [worklogResult, expenseResult] = await Promise.all([
          trickleListObjects('worklog', 10, true).catch((err) => {
            console.log('Worklog fetch failed:', err.message);
            return { items: [] };
          }),
          trickleListObjects('expense', 10, true).catch((err) => {
            console.log('Expense fetch failed:', err.message);
            return { items: [] };
          })
        ]);
        
        const pending = [
          ...(worklogResult.items?.filter(item => item.objectData?.Status === 'pending').map(item => ({
            id: item.objectId,
            type: 'Work Log',
            date: item.objectData.Date,
            icon: 'clock'
          })) || []),
          ...(expenseResult.items?.filter(item => item.objectData?.Status === 'pending').map(item => ({
            id: item.objectId,
            type: 'Expense Report',
            date: item.objectData.Date,
            icon: 'receipt'
          })) || [])
        ].slice(0, 3);

        setApprovals(pending);
      } catch (error) {
        setApprovals([]);
      }
    };

    return (
      <div className="card" data-name="pending-approvals" data-file="components/PendingApprovals.js">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Pending Approvals
        </h3>
        <div className="space-y-3">
          {approvals.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-all cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-color)] bg-opacity-20 flex items-center justify-center">
                  <div className={`icon-${item.icon} text-lg text-[var(--accent-color)]`}></div>
                </div>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{item.type}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {new Date(item.date).toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>
              <div className="icon-chevron-right text-[var(--text-secondary)]"></div>
            </div>
          ))}
          {approvals.length === 0 && (
            <p className="text-center py-4 text-[var(--text-secondary)]">ไม่มีรายการรออนุมัติ</p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('PendingApprovals component error:', error);
    return null;
  }
}