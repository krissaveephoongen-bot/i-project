function TimesheetList() {
  try {
    const [timesheets, setTimesheets] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      loadTimesheets();
    }, []);

    const loadTimesheets = async () => {
      try {
        const result = await trickleListObjects('timesheet', 20, true);
        setTimesheets(result.items || []);
      } catch (error) {
        console.error('Error loading timesheets:', error);
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
      <div className="space-y-4" data-name="timesheet-list" data-file="components/TimesheetList.js">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left py-3 px-4 font-medium">วันที่</th>
                  <th className="text-left py-3 px-4 font-medium">ประเภทงาน</th>
                  <th className="text-left py-3 px-4 font-medium">เวลา</th>
                  <th className="text-left py-3 px-4 font-medium">ชั่วโมง</th>
                  <th className="text-left py-3 px-4 font-medium">สถานะ</th>
                  <th className="text-left py-3 px-4 font-medium">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map((timesheet) => (
                  <tr key={timesheet.objectId} className="border-b border-[var(--border-color)] hover:bg-[var(--secondary-color)]">
                    <td className="py-3 px-4">
                      {new Date(timesheet.objectData.Date).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          timesheet.objectData.WorkType === 'project' ? 'bg-blue-500' :
                          timesheet.objectData.WorkType === 'office' ? 'bg-green-500' :
                          'bg-orange-500'
                        }`}></div>
                        {timesheet.objectData.WorkType === 'project' ? 'งานโครงการ' :
                         timesheet.objectData.WorkType === 'office' ? 'งานสำนักงาน' : 'ลา'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {timesheet.objectData.StartTime} - {timesheet.objectData.EndTime}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {timesheet.objectData.TotalHours} ชม.
                    </td>
                    <td className="py-3 px-4">
                      <span className={`status-badge ${getStatusColor(timesheet.objectData.Status)}`}>
                        {getStatusText(timesheet.objectData.Status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <div className="icon-eye text-sm text-[var(--text-secondary)]"></div>
                        </button>
                        {timesheet.objectData.Status === 'draft' && (
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

        {timesheets.length === 0 && (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            ไม่มี Timesheet
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('TimesheetList component error:', error);
    return null;
  }
}