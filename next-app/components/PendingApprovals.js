function PendingApprovals() {
  try {
    const { approvals, loading, error, approveItem, rejectItem } =
      useApprovals();

    if (loading) {
      return (
        <div
          className="card"
          data-name="pending-approvals"
          data-file="components/PendingApprovals.js"
        >
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Pending Approvals
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="card"
          data-name="pending-approvals"
          data-file="components/PendingApprovals.js"
        >
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Pending Approvals
          </h3>
          <div className="text-center py-4 text-red-600">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
        </div>
      );
    }

    return (
      <div
        className="card"
        data-name="pending-approvals"
        data-file="components/PendingApprovals.js"
      >
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Pending Approvals
        </h3>
        <div className="space-y-3">
          {approvals.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-color)] bg-opacity-20 flex items-center justify-center">
                  <div
                    className={`icon-${item.icon} text-lg text-[var(--accent-color)]`}
                  ></div>
                </div>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">
                    {item.type}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {item.title}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {new Date(item.date).toLocaleDateString("th-TH")}
                    {item.amount &&
                      ` • ${item.amount} ${item.type === "Expense" ? "THB" : "ชม."}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => approveItem(item.id, item.type)}
                  className="p-1 hover:bg-green-100 rounded text-green-600"
                  title="อนุมัติ"
                >
                  <div className="icon-check text-sm"></div>
                </button>
                <button
                  onClick={() => rejectItem(item.id, item.type)}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                  title="ปฏิเสธ"
                >
                  <div className="icon-x text-sm"></div>
                </button>
                <div className="icon-chevron-right text-[var(--text-secondary)]"></div>
              </div>
            </div>
          ))}
          {approvals.length === 0 && (
            <p className="text-center py-4 text-[var(--text-secondary)]">
              ไม่มีรายการรออนุมัติ
            </p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("PendingApprovals component error:", error);
    return null;
  }
}
