export type CostSheetStatus = 'Draft' | 'Submitted' | 'ManagerApproved' | 'FinalApproved';

export interface CostSheet {
  id: string;
  projectId: string;
  version: number;
  status: CostSheetStatus;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type CostItemType = 'labor' | 'expense';

export interface LaborItem {
  id: string;
  costSheetId: string;
  type: 'labor';
  level: string; // เช่น Level 5 : Manager
  position: string; // เช่น Manager
  projectRole: string; // เช่น Project Manager
  dailyRate: number; // อัตรารายวัน
  hourlyRate: number; // อัตรารายชั่วโมง

  // แผนการใช้กำลังคน
  plannedProjectMandays?: number;
  plannedProjectManhours?: number;
  plannedWarrantyMandays?: number;
  plannedWarrantyManhours?: number;

  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseItem {
  id: string;
  costSheetId: string;
  type: 'expense';
  costCode: string; // เช่น G100010
  description: string; // เช่น เงินเดือน (Manday PM)
  amount?: number; // ให้ PM กรอกเอง (ค่าเริ่มต้นไม่ตั้ง)
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CostItem = LaborItem | ExpenseItem;

export interface CostCodeCatalog {
  code: string;
  description: string;
  category?: string; // optional grouping
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

