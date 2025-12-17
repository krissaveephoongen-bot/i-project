function OnboardingModal({ onClose }) {
    const [step, setStep] = React.useState(1);
    
    const steps = [
        {
            title: 'ยินดีต้อนรับสู่ Painai',
            content: 'ระบบบริหารจัดการโครงการที่ช่วยให้คุณติดตามความคืบหน้า จัดการทีม และควบคุมงบประมาณได้อย่างมีประสิทธิภาพ',
            icon: 'sparkles'
        },
        {
            title: 'บันทึกเวลาทำงาน',
            content: 'บันทึกชั่วโมงการทำงานของคุณในแต่ละโครงการ ระบบจะคำนวณ Manday อัตโนมัติและช่วยติดตาม Utilization',
            icon: 'clock'
        },
        {
            title: 'ติดตามโครงการด้วย S-Curve',
            content: 'วิเคราะห์ความคืบหน้าโครงการเทียบกับแผนงาน ด้วยกราฟ S-Curve ที่ชัดเจนและเข้าใจง่าย',
            icon: 'chart-line'
        },
        {
            title: 'จัดการค่าใช้จ่าย',
            content: 'บันทึกและติดตามค่าใช้จ่ายโครงการ พร้อมระบบอนุมัติและควบคุมงบประมาณ',
            icon: 'wallet'
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center`}>
                        <div className={`icon-${currentStep.icon} text-2xl text-white`}></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
                    <p className="text-gray-600">{currentStep.content}</p>
                </div>

                <div className="flex gap-2 justify-center mb-6">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-2 w-12 rounded-full ${i + 1 === step ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    ))}
                </div>

                <div className="flex gap-3">
                    {step < steps.length ? (
                        <>
                            <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                ข้าม
                            </button>
                            <button onClick={() => setStep(step + 1)} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                ถัดไป
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            เริ่มใช้งาน
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}