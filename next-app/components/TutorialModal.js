function TutorialModal({ show, onClose }) {
  const [step, setStep] = React.useState(0);

  const tutorials = [
    {
      title: "ยินดีต้อนรับสู่ระบบ Painai",
      content:
        "ระบบติดตามความคืบหน้าโครงการที่จะช่วยให้คุณจัดการงานได้อย่างมีประสิทธิภาพ",
      icon: "hand-wave",
      color: "blue",
    },
    {
      title: "1. สร้างโครงการ",
      content: "เริ่มต้นด้วยการสร้างโครงการใหม่ ระบุชื่อ งบประมาณ และทีมงาน",
      icon: "folder-plus",
      color: "green",
    },
    {
      title: "2. เพิ่มงาน (Tasks)",
      content: "แบ่งโครงการออกเป็นงานย่อย กำหนดน้ำหนักและผู้รับผิดชอบแต่ละงาน",
      icon: "check-square",
      color: "purple",
    },
    {
      title: "3. บันทึก Timesheet",
      content:
        "บันทึกเวลาทำงานประจำวัน ระบุโครงการและงานที่ทำ ระบบจะคำนวณ Manday อัตโนมัติ",
      icon: "clock",
      color: "teal",
    },
    {
      title: "4. ติดตามความคืบหน้า",
      content:
        "ดูกราฟ S-Curve เพื่อเปรียบเทียบแผนกับผลงานจริง และติดตามงบประมาณ",
      icon: "chart-bar",
      color: "orange",
    },
    {
      title: "พร้อมเริ่มต้นแล้ว!",
      content: "คุณสามารถกลับมาดูคู่มือได้ทุกเมื่อจากเมนูช่วยเหลือ",
      icon: "sparkles",
      color: "pink",
    },
  ];

  const current = tutorials[step];

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fadeInUp relative">
        <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center`}
            >
              <div className={`icon-${current.icon} text-3xl`}></div>
            </div>
            <span className="text-sm opacity-80">
              ขั้นตอน {step + 1}/{tutorials.length}
            </span>
          </div>
          <h2 className="text-2xl font-bold">{current.title}</h2>
        </div>

        <div className="p-6">
          <p className="text-[var(--text-secondary)] text-lg mb-6">
            {current.content}
          </p>

          <div className="flex gap-2 mb-4">
            {tutorials.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${i <= step ? "bg-[var(--primary-color)]" : "bg-gray-200"}`}
              ></div>
            ))}
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setStep(step - 1);
                }}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                <div className="icon-arrow-left text-sm mr-2"></div>
                ก่อนหน้า
              </button>
            )}
            {step < tutorials.length - 1 ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setStep(step + 1);
                }}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                ถัดไป
                <div className="icon-arrow-right text-sm ml-2"></div>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                <div className="icon-check text-sm mr-2"></div>
                เริ่มใช้งาน
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
