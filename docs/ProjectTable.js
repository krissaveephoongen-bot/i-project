function ProjectTable() {
  try {
    const projects = [
      { name: 'Project Alpha', client: 'Tech Corp', pm: 'AS', deadline: '2025-12-31', progress: 58, status: 'behind', manhours: 245 },
      { name: 'Project Beta', client: 'Finance Inc', pm: 'JD', deadline: '2025-11-15', progress: 72, status: 'ontrack', manhours: 180 },
      { name: 'Project Gamma', client: 'Retail Co', pm: 'SK', deadline: '2025-12-20', progress: 45, status: 'atrisk', manhours: 320 }
    ];

    const getStatusBadge = (status) => {
      const styles = {
        ontrack: 'bg-green-50 text-green-700 border-green-200',
        atrisk: 'bg-amber-50 text-amber-700 border-amber-200',
        behind: 'bg-red-50 text-red-700 border-red-200'
      };
      const labels = { ontrack: 'On Track', atrisk: 'At Risk', behind: 'Behind' };
      return { style: styles[status], label: labels[status] };
    };

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--slate-200)]">
        <h3 className="text-lg font-semibold text-[var(--navy-900)] mb-4">Active Projects Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--slate-200)]">
                <th className="text-left py-3 px-4 font-semibold text-sm text-[var(--slate-600)]">Project Name</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-[var(--slate-600)]">Lead PM</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-[var(--slate-600)]">Deadline</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-[var(--slate-600)]">Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-[var(--slate-600)]">Man-hours</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => {
                const badge = getStatusBadge(p.status);
                return (
                  <tr key={i} className="border-b border-[var(--slate-200)] hover:bg-gray-50 cursor-pointer">
                    <td className="py-4 px-4">
                      <div className="font-medium text-[var(--navy-900)]">{p.name}</div>
                      <div className="text-sm text-[var(--slate-600)]">{p.client}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-8 h-8 bg-[var(--navy-900)] rounded-full flex items-center justify-center text-white text-sm font-semibold">{p.pm}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-[var(--slate-600)]">{p.deadline}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-[var(--teal-500)] h-2 rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-[var(--navy-900)] w-12">{p.progress}%</span>
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border mt-1 ${badge.style}`}>{badge.label}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-[var(--navy-900)]">{p.manhours}h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProjectTable error:', error);
    return null;
  }
}