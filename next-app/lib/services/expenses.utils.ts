/**
 * Expense utilities with Thai language support
 */

export enum ExpenseStatusEnum {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  PAID = "paid",
  CANCELLED = "cancelled",
}

export enum ExpenseCategoryEnum {
  TRAVEL = "travel",
  ACCOMMODATION = "accommodation",
  MEALS = "meals",
  TRANSPORTATION = "transportation",
  EQUIPMENT = "equipment",
  SUPPLIES = "supplies",
  UTILITIES = "utilities",
  MAINTENANCE = "maintenance",
  OTHER = "other",
}

export enum PaymentMethodEnum {
  CASH = "cash",
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  CHECK = "check",
  OTHER = "other",
}

/**
 * Get expense status label (with Thai support)
 */
export function getExpenseStatusLabel(
  status: string,
  lang: string = "en"
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [ExpenseStatusEnum.DRAFT]: "Draft",
      [ExpenseStatusEnum.SUBMITTED]: "Submitted",
      [ExpenseStatusEnum.APPROVED]: "Approved",
      [ExpenseStatusEnum.REJECTED]: "Rejected",
      [ExpenseStatusEnum.PAID]: "Paid",
      [ExpenseStatusEnum.CANCELLED]: "Cancelled",
    },
    th: {
      [ExpenseStatusEnum.DRAFT]: "ร่าง",
      [ExpenseStatusEnum.SUBMITTED]: "ส่งแล้ว",
      [ExpenseStatusEnum.APPROVED]: "อนุมัติ",
      [ExpenseStatusEnum.REJECTED]: "ปฏิเสธ",
      [ExpenseStatusEnum.PAID]: "ชำระแล้ว",
      [ExpenseStatusEnum.CANCELLED]: "ยกเลิก",
    },
  };

  return labels[lang]?.[status] || status;
}

/**
 * Get expense category label (with Thai support)
 */
export function getExpenseCategoryLabel(
  category: string,
  lang: string = "en"
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [ExpenseCategoryEnum.TRAVEL]: "Travel",
      [ExpenseCategoryEnum.ACCOMMODATION]: "Accommodation",
      [ExpenseCategoryEnum.MEALS]: "Meals",
      [ExpenseCategoryEnum.TRANSPORTATION]: "Transportation",
      [ExpenseCategoryEnum.EQUIPMENT]: "Equipment",
      [ExpenseCategoryEnum.SUPPLIES]: "Supplies",
      [ExpenseCategoryEnum.UTILITIES]: "Utilities",
      [ExpenseCategoryEnum.MAINTENANCE]: "Maintenance",
      [ExpenseCategoryEnum.OTHER]: "Other",
    },
    th: {
      [ExpenseCategoryEnum.TRAVEL]: "การเดินทาง",
      [ExpenseCategoryEnum.ACCOMMODATION]: "ที่พัก",
      [ExpenseCategoryEnum.MEALS]: "อาหาร",
      [ExpenseCategoryEnum.TRANSPORTATION]: "การขนส่ง",
      [ExpenseCategoryEnum.EQUIPMENT]: "อุปกรณ์",
      [ExpenseCategoryEnum.SUPPLIES]: "วัสดุสิ้นเปลือง",
      [ExpenseCategoryEnum.UTILITIES]: "สาธารณูปโภค",
      [ExpenseCategoryEnum.MAINTENANCE]: "บำรุงรักษา",
      [ExpenseCategoryEnum.OTHER]: "อื่นๆ",
    },
  };

  return labels[lang]?.[category] || category;
}

/**
 * Get payment method label (with Thai support)
 */
export function getPaymentMethodLabel(
  method: string,
  lang: string = "en"
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [PaymentMethodEnum.CASH]: "Cash",
      [PaymentMethodEnum.CREDIT_CARD]: "Credit Card",
      [PaymentMethodEnum.BANK_TRANSFER]: "Bank Transfer",
      [PaymentMethodEnum.CHECK]: "Check",
      [PaymentMethodEnum.OTHER]: "Other",
    },
    th: {
      [PaymentMethodEnum.CASH]: "เงินสด",
      [PaymentMethodEnum.CREDIT_CARD]: "บัตรเครดิต",
      [PaymentMethodEnum.BANK_TRANSFER]: "โอนเงินท้ายธนาคาร",
      [PaymentMethodEnum.CHECK]: "เช็ค",
      [PaymentMethodEnum.OTHER]: "อื่นๆ",
    },
  };

  return labels[lang]?.[method] || method;
}

/**
 * Get expense page labels (with Thai support)
 */
export function getExpensePageLabels(
  lang: string = "en"
): Record<string, string> {
  const labels: Record<string, Record<string, string>> = {
    en: {
      title: "Expenses",
      addNew: "Add New Expense",
      search: "Search expenses...",
      date: "Date",
      category: "Category",
      description: "Description",
      amount: "Amount",
      currency: "Currency",
      paymentMethod: "Payment Method",
      status: "Status",
      receipt: "Receipt",
      vendor: "Vendor",
      project: "Project",
      notes: "Notes",
      approver: "Approver",
      createdAt: "Created At",
      updatedAt: "Updated At",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      noExpenses: "No expenses found",
      confirmDelete: "Are you sure you want to delete this expense?",
      deleteSuccess: "Expense deleted successfully",
      updateSuccess: "Expense updated successfully",
      createSuccess: "Expense created successfully",
      error: "An error occurred",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      filters: "Filters",
      filterByStatus: "Filter by Status",
      filterByCategory: "Filter by Category",
      all: "All",
      totalAmount: "Total Amount",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      viewMemo: "View Memo",
      viewTravel: "View Travel",
      memoExpenses: "Memo Expenses",
      travelExpenses: "Travel Expenses",
    },
    th: {
      title: "ค่าใช้จ่าย",
      addNew: "เพิ่มค่าใช้จ่ายใหม่",
      search: "ค้นหาค่าใช้จ่าย...",
      date: "วันที่",
      category: "หมวดหมู่",
      description: "คำอธิบาย",
      amount: "จำนวนเงิน",
      currency: "สกุลเงิน",
      paymentMethod: "วิธีการชำระเงิน",
      status: "สถานะ",
      receipt: "ใบเสร็จ",
      vendor: "ผู้ขาย",
      project: "โครงการ",
      notes: "หมายเหตุ",
      approver: "ผู้อนุมัติ",
      createdAt: "สร้างเมื่อ",
      updatedAt: "อัปเดตเมื่อ",
      edit: "แก้ไข",
      delete: "ลบ",
      view: "ดู",
      noExpenses: "ไม่พบค่าใช้จ่าย",
      confirmDelete: "คุณแน่ใจหรือว่าต้องการลบค่าใช้จ่ายนี้",
      deleteSuccess: "ลบค่าใช้จ่ายสำเร็จ",
      updateSuccess: "อัปเดตค่าใช้จ่ายสำเร็จ",
      createSuccess: "สร้างค่าใช้จ่ายสำเร็จ",
      error: "เกิดข้อผิดพลาด",
      loading: "กำลังโหลด...",
      save: "บันทึก",
      cancel: "ยกเลิก",
      close: "ปิด",
      filters: "ตัวกรอง",
      filterByStatus: "กรองตามสถานะ",
      filterByCategory: "กรองตามหมวดหมู่",
      all: "ทั้งหมด",
      totalAmount: "จำนวนเงินรวม",
      pending: "รอการอนุมัติ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธแล้ว",
      viewMemo: "ดูบันทึกรายการ",
      viewTravel: "ดูค่าเดินทาง",
      memoExpenses: "ค่าใช้จ่ายบันทึกรายการ",
      travelExpenses: "ค่าใช้จ่ายเดินทาง",
    },
  };

  return labels[lang] || labels["en"];
}
