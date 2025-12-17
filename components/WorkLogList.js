function WorkLogList() {
  try {
    const [workLogs, setWorkLogs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadWorkLogs();
    }, []);

    const loadWorkLogs = async () => {
      try {
        if (typeof trickleListObjects !== 'function') {
          console.log('Database not available');
          setWorkLogs([]);
          setLoading(false);
          return;
        }
        const result = await trickleListObjects('worklog', 30, true).catch(err => {
          console.log('Worklog fetch failed:', err.message);
          return { items: [] };
        });
        setWorkLogs(result?.items || []);
      } catch (error) {
        console.log('Error loading work logs:', error.message);
        setWorkLogs([]);
      } finally {
        setLoading(false);
      }
    };

    const getWorkTypeLabel = (type) => {
      switch(type) {
        case 'project': return 'งานโครงการ';
        case 'office': return 'งานสำนักงาน';
        case 'other': return 'อื่นๆ';
        default: return type;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'approved': return 'status-approved';
        case 'pending': return 'status-pending';
        case 'rejected': return 'status-rejected';
        default: return 'status-pending';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'approved': return 'อนุมัติแล้ว';
        case 'pending': return 'รออนุมัติ';
        case 'rejected': return 'ถูกปฏิเสธ';
        default: return 'รออนุมัติ';
      }
    };

    const calculateManday = (startTime, endTime) => {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      return (hours / 8).toFixed(2);
    };

    if (loading) {
      return <div className="text-center py-8">กำลังโหลด...</div>;
    }

    return (
      <div className="space-y-4" data-name="worklog-list" data-file="components/WorkLogList.js">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left py-3 px-4 font-medium">วันที่</th>
                  <th className="text-left py-3 px-4 font-medium">ประเภท</th>
                  <th className="text-left py-3 px-4 font-medium">โครงการ/งาน</th>
                  <th className="text-left py-3 px-4 font-medium">รายละเอียด</th>
                  <th className="text-left py-3 px-4 font-medium">เวลา</th>
                  <th className="text-left py-3 px-4 font-medium">Manday</th>
                  <th className="text-left py-3 px-4 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {workLogs.map((log) => (
                  <tr key={log.objectId} className="border-b border-[var(--border-color)] hover:bg-[var(--secondary-color)]">
                    <td className="py-3 px-4">
                      {new Date(log.objectData.Date).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.objectData.WorkType === 'project' ? 'bg-blue-100 text-blue-800' :
                        log.objectData.WorkType === 'office' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getWorkTypeLabel(log.objectData.WorkType)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.objectData.ProjectId || '-'}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {log.objectData.Description}
                    </td>
                    <td className="py-3 px-4">
                      {log.objectData.StartTime} - {log.objectData.EndTime}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--primary-color)]">
                      {calculateManday(log.objectData.StartTime, log.objectData.EndTime)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`status-badge ${getStatusColor(log.objectData.Status)}`}>
                        {getStatusText(log.objectData.Status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {workLogs.length === 0 && (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            ยังไม่มีบันทึกงาน
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('WorkLogList component error:', error);
    return null;
  }
}
