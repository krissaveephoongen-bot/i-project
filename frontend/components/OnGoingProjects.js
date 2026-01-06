function OnGoingProjects({ projects = [] }) {
  try {
    const currentYear = new Date().getFullYear();

    const onGoingCount = React.useMemo(() => {
      if (!Array.isArray(projects)) return 0;
      return projects.filter(p => {
        if (!p || !p.createdAt) return false;
        const created = new Date(p.createdAt);
        return (p.status === 'in_progress' || p.objectData?.Status === 'active' || p.objectData?.Status === 'on-going') &&
               created.getFullYear() === currentYear;
      }).length;
    }, [projects, currentYear]);

    return (
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
        <h3 className="text-lg font-bold text-[var(--navy-900)] mb-4">On Going Projects</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{onGoingCount}</div>
          <div className="text-sm text-gray-500">โครงการที่กำลังดำเนินการ (ปี {currentYear + 543})</div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('OnGoingProjects error:', error);
    return null;
  }
}