/**
 * Stakeholder utilities with Thai language support
 */

export enum StakeholderRoleEnum {
  EXECUTIVE = "executive",
  MANAGER = "manager",
  TEAM_MEMBER = "team_member",
  CLIENT = "client",
  VENDOR = "vendor",
  CONSULTANT = "consultant",
  OTHER = "other",
}

export enum StakeholderTypeEnum {
  INTERNAL = "internal",
  EXTERNAL = "external",
  PARTNER = "partner",
}

export enum InvolvementLevelEnum {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  MINIMAL = "minimal",
}

/**
 * Get stakeholder role label (with Thai support)
 */
export function getStakeholderRoleLabel(
  role: string,
  lang: string = "en",
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [StakeholderRoleEnum.EXECUTIVE]: "Executive",
      [StakeholderRoleEnum.MANAGER]: "Manager",
      [StakeholderRoleEnum.TEAM_MEMBER]: "Team Member",
      [StakeholderRoleEnum.CLIENT]: "Client",
      [StakeholderRoleEnum.VENDOR]: "Vendor",
      [StakeholderRoleEnum.CONSULTANT]: "Consultant",
      [StakeholderRoleEnum.OTHER]: "Other",
    },
    th: {
      [StakeholderRoleEnum.EXECUTIVE]: "ผู้บริหาร",
      [StakeholderRoleEnum.MANAGER]: "ผู้จัดการ",
      [StakeholderRoleEnum.TEAM_MEMBER]: "สมาชิกทีม",
      [StakeholderRoleEnum.CLIENT]: "ลูกค้า",
      [StakeholderRoleEnum.VENDOR]: "ผู้จัดหาสินค้า",
      [StakeholderRoleEnum.CONSULTANT]: "ที่ปรึกษา",
      [StakeholderRoleEnum.OTHER]: "อื่นๆ",
    },
  };

  return labels[lang]?.[role] || role;
}

/**
 * Get stakeholder type label (with Thai support)
 */
export function getStakeholderTypeLabel(
  type: string,
  lang: string = "en",
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [StakeholderTypeEnum.INTERNAL]: "Internal",
      [StakeholderTypeEnum.EXTERNAL]: "External",
      [StakeholderTypeEnum.PARTNER]: "Partner",
    },
    th: {
      [StakeholderTypeEnum.INTERNAL]: "ภายใน",
      [StakeholderTypeEnum.EXTERNAL]: "ภายนอก",
      [StakeholderTypeEnum.PARTNER]: "พันธมิตร",
    },
  };

  return labels[lang]?.[type] || type;
}

/**
 * Get involvement level label (with Thai support)
 */
export function getInvolvementLevelLabel(
  level: string,
  lang: string = "en",
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [InvolvementLevelEnum.HIGH]: "High",
      [InvolvementLevelEnum.MEDIUM]: "Medium",
      [InvolvementLevelEnum.LOW]: "Low",
      [InvolvementLevelEnum.MINIMAL]: "Minimal",
    },
    th: {
      [InvolvementLevelEnum.HIGH]: "สูง",
      [InvolvementLevelEnum.MEDIUM]: "ปานกลาง",
      [InvolvementLevelEnum.LOW]: "ต่ำ",
      [InvolvementLevelEnum.MINIMAL]: "น้อยที่สุด",
    },
  };

  return labels[lang]?.[level] || level;
}

/**
 * Get stakeholder page labels (with Thai support)
 */
export function getStakeholderPageLabels(
  lang: string = "en",
): Record<string, string> {
  const labels: Record<string, Record<string, string>> = {
    en: {
      title: "Stakeholders",
      addNew: "Add New Stakeholder",
      search: "Search stakeholders...",
      name: "Name",
      email: "Email",
      phone: "Phone",
      organization: "Organization",
      role: "Role",
      type: "Type",
      involvement: "Involvement Level",
      project: "Project",
      department: "Department",
      manager: "Manager",
      address: "Address",
      notes: "Notes",
      interests: "Interests",
      concerns: "Concerns",
      createdAt: "Created At",
      updatedAt: "Updated At",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      noStakeholders: "No stakeholders found",
      confirmDelete: "Are you sure you want to delete this stakeholder?",
      deleteSuccess: "Stakeholder deleted successfully",
      updateSuccess: "Stakeholder updated successfully",
      createSuccess: "Stakeholder created successfully",
      error: "An error occurred",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      filters: "Filters",
      filterByRole: "Filter by Role",
      filterByType: "Filter by Type",
      filterByInvolvement: "Filter by Involvement",
      all: "All",
      communicationPlan: "Communication Plan",
      riskAssessment: "Risk Assessment",
      highPriority: "High Priority",
      contacted: "Recently Contacted",
    },
    th: {
      title: "ผู้มีส่วนได้ส่วนเสีย",
      addNew: "เพิ่มผู้มีส่วนได้ส่วนเสียใหม่",
      search: "ค้นหาผู้มีส่วนได้ส่วนเสีย...",
      name: "ชื่อ",
      email: "อีเมล",
      phone: "โทรศัพท์",
      organization: "องค์กร",
      role: "บทบาท",
      type: "ประเภท",
      involvement: "ระดับการมีส่วนร่วม",
      project: "โครงการ",
      department: "แผนก",
      manager: "ผู้จัดการ",
      address: "ที่อยู่",
      notes: "หมายเหตุ",
      interests: "ความสนใจ",
      concerns: "ข้อกังวล",
      createdAt: "สร้างเมื่อ",
      updatedAt: "อัปเดตเมื่อ",
      edit: "แก้ไข",
      delete: "ลบ",
      view: "ดู",
      noStakeholders: "ไม่พบผู้มีส่วนได้ส่วนเสีย",
      confirmDelete: "คุณแน่ใจหรือว่าต้องการลบผู้มีส่วนได้ส่วนเสียนี้",
      deleteSuccess: "ลบผู้มีส่วนได้ส่วนเสียสำเร็จ",
      updateSuccess: "อัปเดตผู้มีส่วนได้ส่วนเสียสำเร็จ",
      createSuccess: "สร้างผู้มีส่วนได้ส่วนเสียสำเร็จ",
      error: "เกิดข้อผิดพลาด",
      loading: "กำลังโหลด...",
      save: "บันทึก",
      cancel: "ยกเลิก",
      close: "ปิด",
      filters: "ตัวกรอง",
      filterByRole: "กรองตามบทบาท",
      filterByType: "กรองตามประเภท",
      filterByInvolvement: "กรองตามระดับการมีส่วนร่วม",
      all: "ทั้งหมด",
      communicationPlan: "แผนการสื่อสาร",
      riskAssessment: "การประเมินความเสี่ยง",
      highPriority: "ความสำคัญสูง",
      contacted: "ติดต่ออื่นๆ เมื่อเร็ว ๆ นี้",
    },
  };

  return labels[lang] || labels["en"];
}
