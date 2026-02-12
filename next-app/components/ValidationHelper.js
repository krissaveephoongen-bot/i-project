const ValidationHelper = {
  validateProject: (data) => {
    const errors = [];
    if (!data.name || data.name.trim().length < 3) {
      errors.push('ชื่อโครงการต้องมีอย่างน้อย 3 ตัวอักษร');
    }
    if (!data.code || data.code.trim().length < 2) {
      errors.push('รหัสโครงการต้องมีอย่างน้อย 2 ตัวอักษร');
    }
    if (!data.budget || parseFloat(data.budget) <= 0) {
      errors.push('งบประมาณต้องมากกว่า 0');
    }
    if (!data.startDate || !data.endDate) {
      errors.push('กรุณาระบุวันที่เริ่มต้นและสิ้นสุด');
    }
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      errors.push('วันที่สิ้นสุดต้องหลังวันที่เริ่มต้น');
    }
    return errors;
  },

  validateTask: (data) => {
    const errors = [];
    if (!data.title || data.title.trim().length < 3) {
      errors.push('ชื่องานต้องมีอย่างน้อย 3 ตัวอักษร');
    }
    if (!data.projectId) {
      errors.push('กรุณาเลือกโครงการ');
    }
    if (!data.weight || parseFloat(data.weight) <= 0 || parseFloat(data.weight) > 100) {
      errors.push('น้ำหนักต้องอยู่ระหว่าง 1-100');
    }
    return errors;
  },

  validateTimesheet: (data) => {
    const errors = [];
    if (!data.date) {
      errors.push('กรุณาระบุวันที่');
    }
    if (!data.description || data.description.trim().length < 5) {
      errors.push('รายละเอียดต้องมีอย่างน้อย 5 ตัวอักษร');
    }
    if (!data.startTime || !data.endTime) {
      errors.push('กรุณาระบุเวลาเริ่มต้นและสิ้นสุด');
    }
    const start = new Date(`2000-01-01T${data.startTime}`);
    const end = new Date(`2000-01-01T${data.endTime}`);
    if (start >= end) {
      errors.push('เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น');
    }
    return errors;
  },

  showErrors: (errors) => {
    if (errors.length > 0) {
      alert('กรุณาแก้ไขข้อผิดพลาด:\n\n' + errors.join('\n'));
      return true;
    }
    return false;
  }
};