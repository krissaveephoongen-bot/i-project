function QuickActionButtons({ onAction }) {
  const actions = [
    {
      id: "project",
      label: "สร้างโครงการ",
      icon: "folder-plus",
      color: "blue",
    },
    { id: "task", label: "เพิ่มงาน", icon: "check-square", color: "green" },
    { id: "timesheet", label: "บันทึกเวลา", icon: "clock", color: "purple" },
    {
      id: "expense",
      label: "บันทึกค่าใช้จ่าย",
      icon: "receipt",
      color: "orange",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="card hover:shadow-xl transition-all cursor-pointer p-6 text-center group"
        >
          <div
            className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-${action.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}
          >
            <div
              className={`icon-${action.icon} text-3xl text-${action.color}-600`}
            ></div>
          </div>
          <h3 className="font-semibold text-sm">{action.label}</h3>
        </button>
      ))}
    </div>
  );
}
