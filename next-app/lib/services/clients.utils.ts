/**
 * Client utilities with Thai language support
 */

export enum ClientStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

export enum ClientTypeEnum {
  INDIVIDUAL = "individual",
  COMPANY = "company",
  GOVERNMENT = "government",
}

/**
 * Get client status label (with Thai support)
 */
export function getClientStatusLabel(
  status: string,
  lang: string = "en",
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [ClientStatusEnum.ACTIVE]: "Active",
      [ClientStatusEnum.INACTIVE]: "Inactive",
      [ClientStatusEnum.ARCHIVED]: "Archived",
    },
    th: {
      [ClientStatusEnum.ACTIVE]: "ใช้งาน",
      [ClientStatusEnum.INACTIVE]: "ไม่ใช้งาน",
      [ClientStatusEnum.ARCHIVED]: "เก็บถาวร",
    },
  };

  return labels[lang]?.[status] || status;
}

/**
 * Get client type label (with Thai support)
 */
export function getClientTypeLabel(type: string, lang: string = "en"): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [ClientTypeEnum.INDIVIDUAL]: "Individual",
      [ClientTypeEnum.COMPANY]: "Company",
      [ClientTypeEnum.GOVERNMENT]: "Government",
    },
    th: {
      [ClientTypeEnum.INDIVIDUAL]: "บุคคลธรรมชาติ",
      [ClientTypeEnum.COMPANY]: "บริษัท",
      [ClientTypeEnum.GOVERNMENT]: "รัฐวิสาหกิจ",
    },
  };

  return labels[lang]?.[type] || type;
}

/**
 * Get client page labels (with Thai support)
 */
export function getClientPageLabels(
  lang: string = "en",
): Record<string, string> {
  const labels: Record<string, Record<string, string>> = {
    en: {
      title: "Clients",
      addNew: "Add New Client",
      search: "Search clients...",
      name: "Name",
      email: "Email",
      phone: "Phone",
      status: "Status",
      type: "Type",
      address: "Address",
      city: "City",
      state: "State",
      country: "Country",
      postalCode: "Postal Code",
      taxId: "Tax ID",
      contactPerson: "Contact Person",
      notes: "Notes",
      createdAt: "Created At",
      updatedAt: "Updated At",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      noClients: "No clients found",
      confirmDelete: "Are you sure you want to delete this client?",
      deleteSuccess: "Client deleted successfully",
      updateSuccess: "Client updated successfully",
      createSuccess: "Client created successfully",
      error: "An error occurred",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      filters: "Filters",
      filterByStatus: "Filter by Status",
      filterByType: "Filter by Type",
      all: "All",
    },
    th: {
      title: "ลูกค้า",
      addNew: "เพิ่มลูกค้าใหม่",
      search: "ค้นหาลูกค้า...",
      name: "ชื่อ",
      email: "อีเมล",
      phone: "โทรศัพท์",
      status: "สถานะ",
      type: "ประเภท",
      address: "ที่อยู่",
      city: "เมือง",
      state: "จังหวัด",
      country: "ประเทศ",
      postalCode: "รหัสไปรษณีย์",
      taxId: "หมายเลขประจำตัวผู้เสียภาษี",
      contactPerson: "บุคคลติดต่อ",
      notes: "หมายเหตุ",
      createdAt: "สร้างเมื่อ",
      updatedAt: "อัปเดตเมื่อ",
      edit: "แก้ไข",
      delete: "ลบ",
      view: "ดู",
      noClients: "ไม่พบลูกค้า",
      confirmDelete: "คุณแน่ใจหรือว่าต้องการลบลูกค้านี้",
      deleteSuccess: "ลบลูกค้าสำเร็จ",
      updateSuccess: "อัปเดตลูกค้าสำเร็จ",
      createSuccess: "สร้างลูกค้าสำเร็จ",
      error: "เกิดข้อผิดพลาด",
      loading: "กำลังโหลด...",
      save: "บันทึก",
      cancel: "ยกเลิก",
      close: "ปิด",
      filters: "ตัวกรอง",
      filterByStatus: "กรองตามสถานะ",
      filterByType: "กรองตามประเภท",
      all: "ทั้งหมด",
    },
  };

  return labels[lang] || labels["en"];
}
