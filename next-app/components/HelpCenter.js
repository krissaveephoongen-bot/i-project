function HelpCenter({ show, onClose }) {
  const [activeTab, setActiveTab] = React.useState("faq");

  const faqs = [
    {
      q: "วิธีสร้างโครงการใหม่?",
      a: 'ไปที่หน้า All Projects คลิก "เพิ่มโครงการ" กรอกข้อมูล Project Charter และกดบันทึก',
    },
    {
      q: "Manday คำนวณอย่างไร?",
      a: "Manday = ชั่วโมงทำงาน / 8 ชั่วโมง ระบบจะคำนวณอัตโนมัติจากเวลาเริ่มต้นและสิ้นสุด",
    },
    {
      q: "S-Curve คืออะไร?",
      a: "กราฟแสดงการเปรียบเทียบความคืบหน้าตามแผน (Plan) กับความคืบหน้าจริง (Actual)",
    },
    {
      q: "วิธีอนุมัติ Timesheet?",
      a: "ผู้จัดการไปที่หน้า Approvals เลือกรายการที่ต้องการอนุมัติหรือปฏิเสธ",
    },
  ];

  const guides = [
    {
      title: "การจัดการโครงการ",
      icon: "folder",
      steps: ["สร้างโครงการ", "เพิ่มทีมงาน", "กำหนดงบประมาณ"],
    },
    {
      title: "การติดตามงาน",
      icon: "check-square",
      steps: ["สร้าง Task", "กำหนด Weight", "อัปเดต Progress"],
    },
    {
      title: "การบันทึกเวลา",
      icon: "clock",
      steps: ["เลือกโครงการ", "ระบุเวลา", "บันทึกรายละเอียด"],
    },
  ];

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="icon-help-circle text-3xl"></div>
            <h2 className="text-2xl font-bold">ศูนย์ช่วยเหลือ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <div className="icon-x text-xl"></div>
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-3 font-medium ${activeTab === "faq" ? "border-b-2 border-[var(--primary-color)] text-[var(--primary-color)]" : "text-gray-500"}`}
          >
            คำถามที่พบบ่อย
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex-1 py-3 font-medium ${activeTab === "guide" ? "border-b-2 border-[var(--primary-color)] text-[var(--primary-color)]" : "text-gray-500"}`}
          >
            คู่มือการใช้งาน
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "faq" && (
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="card">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <div className="icon-help-circle text-[var(--primary-color)]"></div>
                    {faq.q}
                  </h3>
                  <p className="text-[var(--text-secondary)] ml-6">{faq.a}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === "guide" && (
            <div className="space-y-4">
              {guides.map((guide, i) => (
                <div key={i} className="card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <div
                      className={`icon-${guide.icon} text-[var(--primary-color)]`}
                    ></div>
                    {guide.title}
                  </h3>
                  <ol className="ml-6 space-y-2">
                    {guide.steps.map((step, j) => (
                      <li
                        key={j}
                        className="text-[var(--text-secondary)] flex items-center gap-2"
                      >
                        <span className="w-6 h-6 rounded-full bg-[var(--primary-color)] text-white text-xs flex items-center justify-center">
                          {j + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
