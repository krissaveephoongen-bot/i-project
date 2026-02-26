/**
 * Sales utilities with Thai language support
 */

export enum SalesStatusEnum {
  PROSPECT = "prospect",
  QUALIFIED = "qualified",
  PROPOSAL = "proposal",
  NEGOTIATION = "negotiation",
  CLOSED_WON = "closed_won",
  CLOSED_LOST = "closed_lost",
}

export enum SalesStageEnum {
  LEAD = "lead",
  CONTACT = "contact",
  MEETING = "meeting",
  DEMO = "demo",
  PROPOSAL = "proposal",
  CONTRACT = "contract",
  WON = "won",
  LOST = "lost",
}

/**
 * Get sales status label (with Thai support)
 */
export function getSalesStatusLabel(
  status: string,
  lang: string = "en",
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [SalesStatusEnum.PROSPECT]: "Prospect",
      [SalesStatusEnum.QUALIFIED]: "Qualified",
      [SalesStatusEnum.PROPOSAL]: "Proposal",
      [SalesStatusEnum.NEGOTIATION]: "Negotiation",
      [SalesStatusEnum.CLOSED_WON]: "Closed Won",
      [SalesStatusEnum.CLOSED_LOST]: "Closed Lost",
    },
    th: {
      [SalesStatusEnum.PROSPECT]: "ลูกค้าเป้าหมาย",
      [SalesStatusEnum.QUALIFIED]: "ผ่านการตรวจสอบ",
      [SalesStatusEnum.PROPOSAL]: "เสนอราคา",
      [SalesStatusEnum.NEGOTIATION]: "เจรจาต่อรอง",
      [SalesStatusEnum.CLOSED_WON]: "ปิดการขาย - ชนะ",
      [SalesStatusEnum.CLOSED_LOST]: "ปิดการขาย - แพ้",
    },
  };

  return labels[lang]?.[status] || status;
}

/**
 * Get sales stage label (with Thai support)
 */
export function getSalesStageLabel(stage: string, lang: string = "en"): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [SalesStageEnum.LEAD]: "Lead",
      [SalesStageEnum.CONTACT]: "Contact",
      [SalesStageEnum.MEETING]: "Meeting",
      [SalesStageEnum.DEMO]: "Demo",
      [SalesStageEnum.PROPOSAL]: "Proposal",
      [SalesStageEnum.CONTRACT]: "Contract",
      [SalesStageEnum.WON]: "Won",
      [SalesStageEnum.LOST]: "Lost",
    },
    th: {
      [SalesStageEnum.LEAD]: "แนวโน้ม",
      [SalesStageEnum.CONTACT]: "ติดต่อ",
      [SalesStageEnum.MEETING]: "การประชุม",
      [SalesStageEnum.DEMO]: "สาธิตผลิตภัณฑ์",
      [SalesStageEnum.PROPOSAL]: "เสนอราคา",
      [SalesStageEnum.CONTRACT]: "สัญญา",
      [SalesStageEnum.WON]: "ชนะ",
      [SalesStageEnum.LOST]: "แพ้",
    },
  };

  return labels[lang]?.[stage] || stage;
}

/**
 * Get sales page labels (with Thai support)
 */
export function getSalesPageLabels(
  lang: string = "en",
): Record<string, string> {
  const labels: Record<string, Record<string, string>> = {
    en: {
      title: "Sales",
      addNew: "Add New Deal",
      search: "Search deals...",
      dealName: "Deal Name",
      client: "Client",
      amount: "Amount",
      currency: "Currency",
      status: "Status",
      stage: "Stage",
      probability: "Probability",
      closingDate: "Closing Date",
      owner: "Sales Owner",
      description: "Description",
      notes: "Notes",
      contacts: "Contacts",
      activities: "Activities",
      attachments: "Attachments",
      createdAt: "Created At",
      updatedAt: "Updated At",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      noDeals: "No deals found",
      confirmDelete: "Are you sure you want to delete this deal?",
      deleteSuccess: "Deal deleted successfully",
      updateSuccess: "Deal updated successfully",
      createSuccess: "Deal created successfully",
      error: "An error occurred",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      filters: "Filters",
      filterByStatus: "Filter by Status",
      filterByStage: "Filter by Stage",
      all: "All",
      pipeline: "Sales Pipeline",
      revenue: "Total Revenue",
      myDeals: "My Deals",
      expectedRevenue: "Expected Revenue",
      winRate: "Win Rate",
    },
    th: {
      title: "ยอดขาย",
      addNew: "เพิ่มการขายใหม่",
      search: "ค้นหาการขาย...",
      dealName: "ชื่อการขาย",
      client: "ลูกค้า",
      amount: "จำนวนเงิน",
      currency: "สกุลเงิน",
      status: "สถานะ",
      stage: "ระยะ",
      probability: "ความน่าจะเป็น",
      closingDate: "วันปิดการขาย",
      owner: "เจ้าของการขาย",
      description: "คำอธิบาย",
      notes: "หมายเหตุ",
      contacts: "ข้อมูลติดต่อ",
      activities: "กิจกรรม",
      attachments: "เอกสารแนบ",
      createdAt: "สร้างเมื่อ",
      updatedAt: "อัปเดตเมื่อ",
      edit: "แก้ไข",
      delete: "ลบ",
      view: "ดู",
      noDeals: "ไม่พบการขาย",
      confirmDelete: "คุณแน่ใจหรือว่าต้องการลบการขายนี้",
      deleteSuccess: "ลบการขายสำเร็จ",
      updateSuccess: "อัปเดตการขายสำเร็จ",
      createSuccess: "สร้างการขายสำเร็จ",
      error: "เกิดข้อผิดพลาด",
      loading: "กำลังโหลด...",
      save: "บันทึก",
      cancel: "ยกเลิก",
      close: "ปิด",
      filters: "ตัวกรอง",
      filterByStatus: "กรองตามสถานะ",
      filterByStage: "กรองตามระยะ",
      all: "ทั้งหมด",
      pipeline: "แนวทางการขาย",
      revenue: "รายได้รวม",
      myDeals: "การขายของฉัน",
      expectedRevenue: "รายได้ที่คาดหวัง",
      winRate: "อัตราการชนะ",
    },
  };

  return labels[lang] || labels["en"];
}
