function TotalInvoiceAmount({ projects = [] }) {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const stats = React.useMemo(() => {
      if (!Array.isArray(projects)) return { monthlyTotal: 0, yearlyTotal: 0 };
      const monthlyTotal = projects.reduce((sum, p) => {
        if (!p || !p.createdAt) return sum;
        const created = new Date(p.createdAt);
        if (
          created.getMonth() === currentMonth &&
          created.getFullYear() === currentYear
        ) {
          return sum + (p.totalExpenses || 0);
        }
        return sum;
      }, 0);

      const yearlyTotal = projects.reduce((sum, p) => {
        if (!p || !p.createdAt) return sum;
        const created = new Date(p.createdAt);
        if (created.getFullYear() === currentYear) {
          return sum + (p.totalExpenses || 0);
        }
        return sum;
      }, 0);

      return { monthlyTotal, yearlyTotal };
    }, [projects]);

    return (
      <div className="card bg-gradient-to-br from-blue-50 to-cyan-50">
        <h3 className="text-lg font-bold text-[var(--navy-900)] mb-6">
          Total Invoice Amount
        </h3>
        <div className="space-y-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">
              ยอดวางบิลเดือนปัจจุบัน
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ฿
              {stats.monthlyTotal.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-cyan-100">
            <div className="text-sm text-gray-600 mb-1">
              ยอดสะสมภายในปี {currentYear + 543}
            </div>
            <div className="text-2xl font-bold text-cyan-600">
              ฿
              {stats.yearlyTotal.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("TotalInvoiceAmount error:", error);
    return null;
  }
}
