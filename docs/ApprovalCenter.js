function ApprovalCenter() {
  try {
    const [workLogApprovals, setWorkLogApprovals] = React.useState([]);
    const [expenseApprovals, setExpenseApprovals] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('worklogs');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadApprovals();
    }, []);

  const loadApprovals = async () => {
    try {
      if (typeof trickleListObjects !== 'function') {
        console.log('Database API not available');
        setWorkLogApprovals([]);
        setExpenseApprovals([]);
        setLoading(false);
        return;
      }
      
      const workLogResult = await trickleListObjects('worklog', 50, true).catch(err => {
        console.log('Worklog fetch failed, using empty data:', err.message);
        return { items: [] };
      });
      
      const expenseResult = await trickleListObjects('expense', 50, true).catch(err => {
        console.log('Expense fetch failed, using empty data:', err.message);
        return { items: [] };
      });
      
      const pendingWorkLogs = workLogResult.items?.filter(
        item => item.objectData?.Status === 'pending'
      ) || [];
      
      const pendingExpenses = expenseResult.items?.filter(
        item => item.objectData?.Status === 'pending'
      ) || [];

      setWorkLogApprovals(pendingWorkLogs);
      setExpenseApprovals(pendingExpenses);
    } catch (error) {
      console.error('Error loading approvals:', error);
      setWorkLogApprovals([]);
      setExpenseApprovals([]);
    } finally {
      setLoading(false);
    }
  };

    const calculateManday = (startTime, endTime) => {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      return (hours / 8).toFixed(2);
    };

    const handleApprove = async (type, itemId) => {
      try {
        if (typeof trickleUpdateObject !== 'function') {
          console.log('Database not available');
          return;
        }
        const updateData = {
          Status: 'approved',
          ApprovedBy: 'current-user',
          ApprovedAt: new Date().toISOString()
        };

        await trickleUpdateObject(type, itemId, updateData).catch(err => {
          console.log('Update failed:', err.message);
        });
        loadApprovals();
      } catch (error) {
        console.log('Error approving item:', error.message);
      }
    };

    const handleReject = async (type, itemId) => {
      try {
        if (typeof trickleUpdateObject !== 'function') {
          console.log('Database not available');
          return;
        }
        const updateData = {
          Status: 'rejected',
          RejectedBy: 'current-user',
          RejectedAt: new Date().toISOString()
        };

        await trickleUpdateObject(type, itemId, updateData).catch(err => {
          console.log('Update failed:', err.message);
        });
        loadApprovals();
      } catch (error) {
        console.log('Error rejecting item:', error.message);
      }
    };

    if (loading) {
      return <div className="text-center py-8">กำลังโหลด...</div>;
    }

    return (
      <div className="space-y-6" data-name="approval-center" data-file="components/ApprovalCenter.js">
        <div className="flex space-x-2 bg-[var(--secondary-color)] p-1.5 rounded-xl w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
              activeTab === 'expenses'
                ? 'bg-white text-[var(--primary-color)] shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white hover:bg-opacity-50'
            }`}
          >
            <div className="icon-clipboard-list text-base mr-2"></div>
            บันทึกงาน ({workLogApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
              activeTab === 'expenses'
                ? 'bg-white text-[var(--primary-color)] shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white hover:bg-opacity-50'
            }`}
          >
            <div className="icon-receipt text-base mr-2"></div>
            ค่าใช้จ่าย ({expenseApprovals.length})
          </button>
        </div>

        {activeTab === 'worklogs' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">รอการอนุมัติบันทึกงาน</h3>
            <div className="space-y-4">
              {workLogApprovals.map(item => {
                const manday = calculateManday(item.objectData.StartTime, item.objectData.EndTime);
                return (
                  <div key={item.objectId} className="border border-[var(--border-color)] rounded-xl p-5 hover:shadow-md transition-all duration-300 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-[var(--text-secondary)]">วันที่:</span>
                            <div className="font-medium">{new Date(item.objectData.Date).toLocaleDateString('th-TH')}</div>
                          </div>
                          <div>
                            <span className="text-[var(--text-secondary)]">เวลา:</span>
                            <div className="font-medium">{item.objectData.StartTime} - {item.objectData.EndTime}</div>
                          </div>
                          <div>
                            <span className="text-[var(--text-secondary)]">Manday:</span>
                            <div className="font-medium text-[var(--primary-color)]">{manday}</div>
                          </div>
                          <div>
                            <span className="text-[var(--text-secondary)]">ประเภท:</span>
                            <div className="font-medium">
                              {item.objectData.WorkType === 'project' ? 'โครงการ' : 
                               item.objectData.WorkType === 'office' ? 'สำนักงาน' : 'อื่นๆ'}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-[var(--text-secondary)]">รายละเอียด: </span>
                          <span>{item.objectData.Description}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleReject('worklog', item.objectId)}
                          className="px-5 py-2.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 hover:shadow-md transition-all duration-300 border border-red-200"
                        >
                          ปฏิเสธ
                        </button>
                        <button
                          onClick={() => handleApprove('worklog', item.objectId)}
                          className="px-5 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 hover:shadow-md transition-all duration-300 border border-green-200"
                        >
                          อนุมัติ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {workLogApprovals.length === 0 && (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  ไม่มีบันทึกงานรอการอนุมัติ
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">รอการอนุมัติค่าใช้จ่าย</h3>
            <div className="space-y-4">
              {expenseApprovals.map(item => (
                <div key={item.objectId} className="border border-[var(--border-color)] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-[var(--text-secondary)]">วันที่:</span>
                          <div className="font-medium">{new Date(item.objectData.Date).toLocaleDateString('th-TH')}</div>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">หมวดหมู่:</span>
                          <div className="font-medium">{item.objectData.Category}</div>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">จำนวนเงิน:</span>
                          <div className="font-medium text-[var(--primary-color)]">฿{item.objectData.Amount?.toLocaleString() || '0'}</div>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">รายละเอียด:</span>
                          <div className="font-medium truncate">{item.objectData.Description}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleReject('expense', item.objectId)}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                      >
                        ปฏิเสธ
                      </button>
                      <button
                        onClick={() => handleApprove('expense', item.objectId)}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-200"
                      >
                        อนุมัติ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {expenseApprovals.length === 0 && (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  ไม่มีค่าใช้จ่ายรอการอนุมัติ
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ApprovalCenter component error:', error);
    return null;
  }
}