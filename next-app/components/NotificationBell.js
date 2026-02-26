function NotificationBell() {
  const [notifications, setNotifications] = React.useState([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Memoize loadNotifications to prevent infinite loops
  const loadNotifications = React.useCallback(async () => {
    try {
      const [tasks, worklogs, expenses] = await Promise.all([
        trickleListObjects("task", 50, true).catch(() => ({ items: [] })),
        trickleListObjects("worklog", 50, true).catch(() => ({ items: [] })),
        trickleListObjects("expense", 50, true).catch(() => ({ items: [] })),
      ]);

      const notifs = [];
      const today = new Date();

      if (tasks.items) {
        tasks.items.forEach((task) => {
          if (task.objectData?.dueDate) {
            const due = new Date(task.objectData.dueDate);
            const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            if (
              diff <= 3 &&
              diff >= 0 &&
              task.objectData.status !== "completed"
            ) {
              notifs.push({
                id: task.objectId,
                type: "task",
                message: `งาน "${task.objectData.name}" ใกล้ครบกำหนด (${diff} วัน)`,
                time: task.createdAt,
                read: false,
              });
            }
          }
        });
      }

      if (worklogs.items) {
        worklogs.items.forEach((log) => {
          if (log.objectData?.status === "pending") {
            notifs.push({
              id: log.objectId,
              type: "approval",
              message: `บันทึกงานรออนุมัติ`,
              time: log.createdAt,
              read: false,
            });
          }
        });
      }

      if (expenses.items) {
        expenses.items.forEach((exp) => {
          if (exp.objectData?.status === "pending") {
            notifs.push({
              id: exp.objectId,
              type: "approval",
              message: `ค่าใช้จ่ายรออนุมัติ`,
              time: exp.createdAt,
              read: false,
            });
          }
        });
      }

      setNotifications(notifs.slice(0, 10));
      setUnreadCount(notifs.length);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []); // Memoized with empty deps

  React.useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 120000);
    return () => clearInterval(interval);
  }, [loadNotifications]); // Now safe to include in deps

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="icon-bell text-xl text-gray-600"></div>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">การแจ้งเตือน</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                ไม่มีการแจ้งเตือน
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`icon-${notif.type === "task" ? "alert-circle" : "check-circle"} text-lg ${notif.type === "task" ? "text-orange-500" : "text-blue-500"}`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.time).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
