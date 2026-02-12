function SignedProjects({ projects = [] }) {
  try {
    const currentYear = new Date().getFullYear();

    const signedCount = React.useMemo(() => {
      if (!Array.isArray(projects)) return 0;
      return projects.filter(p => {
        if (!p || !p.createdAt) return false;
        const created = new Date(p.createdAt);
        return (p.status === 'approved' || p.objectData?.Status === 'signed') &&
               created.getFullYear() === currentYear;
      }).length;
    }, [projects, currentYear]);

    return (
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
        <h3 className="text-lg font-bold text-[var(--navy-900)] mb-4">Signed Projects</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">{signedCount}</div>
          <div className="text-sm text-gray-500">โครงการที่เซ็นสัญญาแล้ว (ปี {currentYear + 543})</div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('SignedProjects error:', error);
    return null;
  }
}