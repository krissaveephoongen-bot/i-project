/**
 * Resource utilities with Thai language support
 */

export enum ResourceTypeEnum {
  HUMAN = "human",
  EQUIPMENT = "equipment",
  MATERIAL = "material",
  SOFTWARE = "software",
  FACILITY = "facility",
  OTHER = "other",
}

export enum ResourceStatusEnum {
  AVAILABLE = "available",
  IN_USE = "in_use",
  MAINTENANCE = "maintenance",
  RETIRED = "retired",
  ARCHIVED = "archived",
}

export enum AllocationStatusEnum {
  REQUESTED = "requested",
  APPROVED = "approved",
  ALLOCATED = "allocated",
  DEALLOCATED = "deallocated",
  REJECTED = "rejected",
}

/**
 * Get resource type label (with Thai support)
 */
export function getResourceTypeLabel(
  type: string,
  lang: string = "en"
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [ResourceTypeEnum.HUMAN]: "Human Resource",
      [ResourceTypeEnum.EQUIPMENT]: "Equipment",
      [ResourceTypeEnum.MATERIAL]: "Material",
      [ResourceTypeEnum.SOFTWARE]: "Software",
      [ResourceTypeEnum.FACILITY]: "Facility",
      [ResourceTypeEnum.OTHER]: "Other",
    },
    th: {
      [ResourceTypeEnum.HUMAN]: "ทรัพยากรมนุษย์",
      [ResourceTypeEnum.EQUIPMENT]: "อุปกรณ์",
      [ResourceTypeEnum.MATERIAL]: "วัสดุ",
      [ResourceTypeEnum.SOFTWARE]: "ซอฟต์แวร์",
      [ResourceTypeEnum.FACILITY]: "สิ่งอำนวยความสะดวก",
      [ResourceTypeEnum.OTHER]: "อื่นๆ",
    },
  };

  return labels[lang]?.[type] || type;
}

/**
 * Get resource status label (with Thai support)
 */
export function getResourceStatusLabel(
  status: string,
  lang: string = "en"
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [ResourceStatusEnum.AVAILABLE]: "Available",
      [ResourceStatusEnum.IN_USE]: "In Use",
      [ResourceStatusEnum.MAINTENANCE]: "Maintenance",
      [ResourceStatusEnum.RETIRED]: "Retired",
      [ResourceStatusEnum.ARCHIVED]: "Archived",
    },
    th: {
      [ResourceStatusEnum.AVAILABLE]: "พร้อมใช้",
      [ResourceStatusEnum.IN_USE]: "ใช้งานอยู่",
      [ResourceStatusEnum.MAINTENANCE]: "บำรุงรักษา",
      [ResourceStatusEnum.RETIRED]: "เลิกใช้",
      [ResourceStatusEnum.ARCHIVED]: "เก็บถาวร",
    },
  };

  return labels[lang]?.[status] || status;
}

/**
 * Get allocation status label (with Thai support)
 */
export function getAllocationStatusLabel(
  status: string,
  lang: string = "en"
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [AllocationStatusEnum.REQUESTED]: "Requested",
      [AllocationStatusEnum.APPROVED]: "Approved",
      [AllocationStatusEnum.ALLOCATED]: "Allocated",
      [AllocationStatusEnum.DEALLOCATED]: "Deallocated",
      [AllocationStatusEnum.REJECTED]: "Rejected",
    },
    th: {
      [AllocationStatusEnum.REQUESTED]: "ขอใช้งาน",
      [AllocationStatusEnum.APPROVED]: "อนุมัติ",
      [AllocationStatusEnum.ALLOCATED]: "มอบหมายแล้ว",
      [AllocationStatusEnum.DEALLOCATED]: "คืนแล้ว",
      [AllocationStatusEnum.REJECTED]: "ปฏิเสธ",
    },
  };

  return labels[lang]?.[status] || status;
}

/**
 * Get resource page labels (with Thai support)
 */
export function getResourcePageLabels(lang: string = "en"): Record<string, string> {
  const labels: Record<string, Record<string, string>> = {
    en: {
      title: "Resources",
      addNew: "Add New Resource",
      search: "Search resources...",
      resourceName: "Resource Name",
      type: "Type",
      status: "Status",
      owner: "Owner",
      description: "Description",
      quantity: "Quantity",
      location: "Location",
      costCenter: "Cost Center",
      project: "Project",
      department: "Department",
      allocatedTo: "Allocated To",
      startDate: "Start Date",
      endDate: "End Date",
      notes: "Notes",
      specifications: "Specifications",
      createdAt: "Created At",
      updatedAt: "Updated At",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      allocate: "Allocate",
      deallocate: "Deallocate",
      noResources: "No resources found",
      confirmDelete: "Are you sure you want to delete this resource?",
      deleteSuccess: "Resource deleted successfully",
      updateSuccess: "Resource updated successfully",
      createSuccess: "Resource created successfully",
      error: "An error occurred",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      filters: "Filters",
      filterByType: "Filter by Type",
      filterByStatus: "Filter by Status",
      filterByDepartment: "Filter by Department",
      all: "All",
      available: "Available Resources",
      inUse: "In Use",
      maintenance: "Under Maintenance",
      allocationHistory: "Allocation History",
      utilization: "Utilization Rate",
    },
    th: {
      title: "ทรัพยากร",
      addNew: "เพิ่มทรัพยากรใหม่",
      search: "ค้นหาทรัพยากร...",
      resourceName: "ชื่อทรัพยากร",
      type: "ประเภท",
      status: "สถานะ",
      owner: "เจ้าของ",
      description: "คำอธิบาย",
      quantity: "จำนวน",
      location: "ตำแหน่ง",
      costCenter: "ศูนย์ต้นทุน",
      project: "โครงการ",
      department: "แผนก",
      allocatedTo: "มอบหมายให้",
      startDate: "วันเริ่มต้น",
      endDate: "วันสิ้นสุด",
      notes: "หมายเหตุ",
      specifications: "ข้อมูลจำเพาะ",
      createdAt: "สร้างเมื่อ",
      updatedAt: "อัปเดตเมื่อ",
      edit: "แก้ไข",
      delete: "ลบ",
      view: "ดู",
      allocate: "มอบหมาย",
      deallocate: "คืน",
      noResources: "ไม่พบทรัพยากร",
      confirmDelete: "คุณแน่ใจหรือว่าต้องการลบทรัพยากรนี้",
      deleteSuccess: "ลบทรัพยากรสำเร็จ",
      updateSuccess: "อัปเดตทรัพยากรสำเร็จ",
      createSuccess: "สร้างทรัพยากรสำเร็จ",
      error: "เกิดข้อผิดพลาด",
      loading: "กำลังโหลด...",
      save: "บันทึก",
      cancel: "ยกเลิก",
      close: "ปิด",
      filters: "ตัวกรอง",
      filterByType: "กรองตามประเภท",
      filterByStatus: "กรองตามสถานะ",
      filterByDepartment: "กรองตามแผนก",
      all: "ทั้งหมด",
      available: "ทรัพยากรที่พร้อมใช้",
      inUse: "ใช้งานอยู่",
      maintenance: "ระหว่างบำรุงรักษา",
      allocationHistory: "ประวัติการมอบหมาย",
      utilization: "อัตราการใช้งาน",
    },
  };

  return labels[lang] || labels["en"];
}
