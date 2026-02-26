function TimesheetList() {
  try {
    const { timesheets, loading, error, approveTimesheet } = useTimesheets();

    const getStatusColor = (status) => {
      switch (status) {
        case "approved":
          return "status-completed";
        case "pending":
          return "status-review";
        case "rejected":
          return "bg-red-100 text-red-800";
        case "draft":
          return "status-todo";
        default:
          return "status-todo";
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case "approved":
          return "อนุมัติแล้ว";
        case "pending":
          return "รออนุมัติ";
        case "rejected":
          return "ถูกปฏิเสธ";
        case "draft":
          return "ร่าง";
        default:
          return "ไม่ทราบสถานะ";
      }
    };

    const handleApprove = async (timesheetId) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await approveTimesheet(timesheetId, user.id);
        }
      } catch (error) {
        console.error("Error approving timesheet:", error);
      }
    };

    if (loading) {
      return (
        <div
          className="space-y-4"
          data-name="timesheet-list"
          data-file="components/TimesheetList.js"
        >
          <div className="card">
            <div className="text-center py-8">กำลังโหลด...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="space-y-4"
          data-name="timesheet-list"
          data-file="components/TimesheetList.js"
        >
          <div className="card">
            <div className="text-center py-8 text-red-600">
              เกิดข้อผิดพลาดในการโหลดข้อมูล
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="space-y-4"
        data-name="timesheet-list"
        data-file="components/TimesheetList.js"
      >
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left py-3 px-4 font-medium">วันที่</th>
                  <th className="text-left py-3 px-4 font-medium">ประเภทงาน</th>
                  <th className="text-left py-3 px-4 font-medium">โปรเจกต์</th>
                  <th className="text-left py-3 px-4 font-medium">ชั่วโมง</th>
                  <th className="text-left py-3 px-4 font-medium">สถานะ</th>
                  <th className="text-left py-3 px-4 font-medium">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map((timesheet) => (
                  <tr
                    key={timesheet.id}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--secondary-color)]"
                  >
                    <td className="py-3 px-4">
                      {new Date(timesheet.date).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                        {timesheet.task ? "งานโครงการ" : "ทั่วไป"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {timesheet.project?.name || "ไม่ระบุ"}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {timesheet.hours} ชม.
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`status-badge ${getStatusColor(timesheet.status)}`}
                      >
                        {getStatusText(timesheet.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <div className="icon-eye text-sm text-[var(--text-secondary)]"></div>
                        </button>
                        {timesheet.status === "draft" && (
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <div className="icon-edit text-sm text-[var(--text-secondary)]"></div>
                          </button>
                        )}
                        {timesheet.status === "pending" && (
                          <button
                            onClick={() => handleApprove(timesheet.id)}
                            className="p-1 hover:bg-green-100 rounded"
                            title="อนุมัติ"
                          >
                            <div className="icon-check text-sm text-green-600"></div>
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
    console.error("TimesheetList component error:", error);
    return null;
  }
}
