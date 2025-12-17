function ProgressProjectTable({ projects = [] }) {
  try {
    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    };

    return (
      <div className="card">
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 -m-6 mb-4 p-4 rounded-t-2xl">
          <h3 className="text-lg font-bold text-white">Progress Project</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cyan-100">
                <th className="py-3 px-4 text-left font-semibold">ลำดับ</th>
                <th className="py-3 px-4 text-left font-semibold">Project Code</th>
                <th className="py-3 px-4 text-right font-semibold">มูลค่าโครงการ</th>
                <th className="py-3 px-4 text-center font-semibold">วันเริ่มโครงการ</th>
                <th className="py-3 px-4 text-center font-semibold">วันสิ้นสุดโครงการ</th>
                <th className="py-3 px-4 text-center font-semibold">PM</th>
                <th className="py-3 px-4 text-center font-semibold">Pco/Admin</th>
                <th className="py-3 px-4 text-center font-semibold" colSpan="2">ความคืบหน้า</th>
                <th className="py-3 px-4 text-left font-semibold">หมายเหตุ</th>
              </tr>
              <tr className="bg-cyan-50">
                <th colSpan="7"></th>
                <th className="py-2 px-4 text-center text-blue-600 font-semibold">Plan</th>
                <th className="py-2 px-4 text-center text-red-600 font-semibold">Actual</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-gray-500">
                    ไม่มีข้อมูลโครงการ
                  </td>
                </tr>
              ) : (
                projects.map((project, index) => {
                  const budget = parseFloat(project.objectData.Budget) || 0;
                  const planProgress = 100;
                  const actualProgress = project.actualProgress || 0;

                  return (
                    <tr key={project.objectId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 text-center">{index + 1}</td>
                      <td className="py-3 px-4">{project.objectData.Code || '-'}</td>
                      <td className="py-3 px-4 text-right">{budget.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-center">{formatDate(project.objectData.StartDate)}</td>
                      <td className="py-3 px-4 text-center">{formatDate(project.objectData.EndDate)}</td>
                      <td className="py-3 px-4 text-center">{project.objectData.Manager || '-'}</td>
                      <td className="py-3 px-4 text-center">-</td>
                      <td className="py-3 px-4 text-center text-blue-600 font-semibold">{planProgress.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-center text-red-600 font-semibold">{actualProgress.toFixed(2)}%</td>
                      <td className="py-3 px-4">-</td>
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
    console.error('ProgressProjectTable error:', error);
    return null;
  }
}