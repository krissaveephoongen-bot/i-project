function ProjectDetailTable({ project, projectData }) {
  try {
    const tasks = projectData?.tasks || [];

    const getStatusText = (status) => {
      const statusMap = {
        todo: "รอดำเนินการ",
        progress: "กำลังดำเนินการ",
        review: "รอตรวจสอบ",
        completed: "เสร็จสิ้น",
      };
      return statusMap[status] || status;
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--slate-200)]">
        <h3 className="font-bold text-[var(--navy-900)] mb-4">
          รายการงานในโครงการ
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">ชื่องาน</th>
                <th className="text-center py-3 px-4 font-semibold">น้ำหนัก</th>
                <th className="text-left py-3 px-4 font-semibold">
                  ความคืบหน้า
                </th>
                <th className="text-center py-3 px-4 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    ไม่มีงานในโครงการนี้
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const weight = parseFloat(task.objectData.Weight) || 0;
                  const progress = parseFloat(task.objectData.Progress) || 0;
                  const status = task.objectData.Status || "todo";

                  return (
                    <tr
                      key={task.objectId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{task.objectData.Title}</td>
                      <td className="py-3 px-4 text-center">{weight}%</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`status-badge status-${status}`}>
                          {getStatusText(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    console.error("ProjectDetailTable error:", error);
    return null;
  }
}
