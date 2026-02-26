import React from "react";

function BacklogProjects({ projects = [] }) {
  try {
    const backlogTotal = React.useMemo(() => {
      if (!Array.isArray(projects)) return 0;
      const currentYear = new Date().getFullYear();

      return projects.reduce((sum, p) => {
        if (!p || !p.createdAt) return sum;
        const created = new Date(p.createdAt);
        if (isNaN(created.getTime())) return sum; // Skip invalid dates
        if (created.getFullYear() < currentYear) {
          return sum + (p.totalExpenses || 0);
        }
        return sum;
      }, 0);
    }, [projects]);

    return (
      <div className="card bg-gradient-to-br from-gray-50 to-slate-50">
        <h3 className="text-lg font-bold text-[var(--navy-900)] mb-4">
          Backlog Projects
        </h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-600 mb-2">
            ฿
            {backlogTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-500">ยอดเงินจากปีก่อนหน้า</div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("BacklogProjects error:", error);
    return null;
  }
}

export default BacklogProjects;
