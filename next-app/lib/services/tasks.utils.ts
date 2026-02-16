/**
 * Task utilities with Thai language support
 */

export enum TaskStatusEnum {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskPriorityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum TaskCategoryEnum {
  DEVELOPMENT = "development",
  DESIGN = "design",
  TESTING = "testing",
  DOCUMENTATION = "documentation",
  MAINTENANCE = "maintenance",
  OTHER = "other",
}

/**
 * Get task status label (with Thai support)
 */
export function getTaskStatusLabel(
  status: string,
  lang: string = "en"
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [TaskStatusEnum.TODO]: "To Do",
      [TaskStatusEnum.IN_PROGRESS]: "In Progress",
      [TaskStatusEnum.REVIEW]: "Review",
      [TaskStatusEnum.COMPLETED]: "Completed",
      [TaskStatusEnum.CANCELLED]: "Cancelled",
    },
    th: {
      [TaskStatusEnum.TODO]: "ต้องทำ",
      [TaskStatusEnum.IN_PROGRESS]: "กำลังทำ",
      [TaskStatusEnum.REVIEW]: "ตรวจสอบ",
      [TaskStatusEnum.COMPLETED]: "เสร็จสิ้น",
      [TaskStatusEnum.CANCELLED]: "ยกเลิก",
    },
  };

  return labels[lang]?.[status] || status;
}

/**
 * Get task priority label (with Thai support)
 */
export function getTaskPriorityLabel(
  priority: string,
  lang: string = "en"
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [TaskPriorityEnum.LOW]: "Low",
      [TaskPriorityEnum.MEDIUM]: "Medium",
      [TaskPriorityEnum.HIGH]: "High",
      [TaskPriorityEnum.URGENT]: "Urgent",
    },
    th: {
      [TaskPriorityEnum.LOW]: "ต่ำ",
      [TaskPriorityEnum.MEDIUM]: "ปานกลาง",
      [TaskPriorityEnum.HIGH]: "สูง",
      [TaskPriorityEnum.URGENT]: "เร่งด่วน",
    },
  };

  return labels[lang]?.[priority] || priority;
}

/**
 * Get task category label (with Thai support)
 */
export function getTaskCategoryLabel(
  category: string,
  lang: string = "en"
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [TaskCategoryEnum.DEVELOPMENT]: "Development",
      [TaskCategoryEnum.DESIGN]: "Design",
      [TaskCategoryEnum.TESTING]: "Testing",
      [TaskCategoryEnum.DOCUMENTATION]: "Documentation",
      [TaskCategoryEnum.MAINTENANCE]: "Maintenance",
      [TaskCategoryEnum.OTHER]: "Other",
    },
    th: {
      [TaskCategoryEnum.DEVELOPMENT]: "พัฒนา",
      [TaskCategoryEnum.DESIGN]: "ออกแบบ",
      [TaskCategoryEnum.TESTING]: "ทดสอบ",
      [TaskCategoryEnum.DOCUMENTATION]: "เอกสาร",
      [TaskCategoryEnum.MAINTENANCE]: "บำรุงรักษา",
      [TaskCategoryEnum.OTHER]: "อื่นๆ",
    },
  };

  return labels[lang]?.[category] || category;
}

/**
 * Get task page labels (with Thai support)
 */
export function getTaskPageLabels(lang: string = "en"): Record<string, string> {
  const labels: Record<string, Record<string, string>> = {
    en: {
      title: "Tasks",
      addNew: "Add New Task",
      search: "Search tasks...",
      taskName: "Task Name",
      description: "Description",
      status: "Status",
      priority: "Priority",
      category: "Category",
      assignee: "Assignee",
      dueDate: "Due Date",
      startDate: "Start Date",
      project: "Project",
      estimatedHours: "Estimated Hours",
      actualHours: "Actual Hours",
      notes: "Notes",
      createdAt: "Created At",
      updatedAt: "Updated At",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      noTasks: "No tasks found",
      confirmDelete: "Are you sure you want to delete this task?",
      deleteSuccess: "Task deleted successfully",
      updateSuccess: "Task updated successfully",
      createSuccess: "Task created successfully",
      error: "An error occurred",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      filters: "Filters",
      filterByStatus: "Filter by Status",
      filterByPriority: "Filter by Priority",
      filterByCategory: "Filter by Category",
      all: "All",
      myTasks: "My Tasks",
      overdue: "Overdue",
      dueToday: "Due Today",
      dueSoon: "Due Soon",
    },
    th: {
      title: "งาน",
      addNew: "เพิ่มงานใหม่",
      search: "ค้นหางาน...",
      taskName: "ชื่องาน",
      description: "คำอธิบาย",
      status: "สถานะ",
      priority: "ความสำคัญ",
      category: "หมวดหมู่",
      assignee: "ผู้รับผิดชอบ",
      dueDate: "วันครบกำหนด",
      startDate: "วันเริ่มต้น",
      project: "โครงการ",
      estimatedHours: "ชั่วโมงที่ประมาณการ",
      actualHours: "ชั่วโมงที่ใช้จริง",
      notes: "หมายเหตุ",
      createdAt: "สร้างเมื่อ",
      updatedAt: "อัปเดตเมื่อ",
      edit: "แก้ไข",
      delete: "ลบ",
      view: "ดู",
      noTasks: "ไม่พบงาน",
      confirmDelete: "คุณแน่ใจหรือว่าต้องการลบงานนี้",
      deleteSuccess: "ลบงานสำเร็จ",
      updateSuccess: "อัปเดตงานสำเร็จ",
      createSuccess: "สร้างงานสำเร็จ",
      error: "เกิดข้อผิดพลาด",
      loading: "กำลังโหลด...",
      save: "บันทึก",
      cancel: "ยกเลิก",
      close: "ปิด",
      filters: "ตัวกรอง",
      filterByStatus: "กรองตามสถานะ",
      filterByPriority: "กรองตามความสำคัญ",
      filterByCategory: "กรองตามหมวดหมู่",
      all: "ทั้งหมด",
      myTasks: "งานของฉัน",
      overdue: "เกินกำหนด",
      dueToday: "ครบกำหนดวันนี้",
      dueSoon: "ครบกำหนดเร็วๆ นี้",
    },
  };

  return labels[lang] || labels["en"];
}
