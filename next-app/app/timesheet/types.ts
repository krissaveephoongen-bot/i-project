/**
 * Timesheet & Leave Types
 * Comprehensive type definitions for timesheet and leave management
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum WorkType {
  PROJECT = "project",
  OFFICE = "office",
  TRAINING = "training",
  LEAVE = "leave",
  OVERTIME = "overtime",
  OTHER = "other",
}

export enum LeaveType {
  ANNUAL = "annual",
  SICK = "sick",
  PERSONAL = "personal",
  MATERNITY = "maternity",
  UNPAID = "unpaid",
}

export enum EntryStatus {
  PENDING = "pending",
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  TODO = "todo",
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Project {
  id: string;
  name: string;
  code?: string;
  status: string;
  client?: string;
  manager?: string;
  finalApprover?: string; // Added for 2-step approval
  color?: string;
  tasks?: Array<{
    id: string;
    name: string;
  }>;
}

export interface ActivityData {
  rows: Array<{
    date: string;
    action: string;
    details: string;
    user: string;
    project: string;
    task: string;
    hours: number;
    start: string;
    end: string;
    timestamp: string;
  }>;
}

// ============================================================================
// TIME ENTRY TYPES
// ============================================================================

export interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string | null; // HH:mm
  breakDuration: number; // minutes
  workType: WorkType;
  projectId: string | null;
  taskId: string | null;
  userId: string;
  hours: number; // decimal (7.5 = 7h 30m)
  billableHours: number | null;
  description: string | null;
  status: EntryStatus;
  approvedBy: string | null;
  approvedAt: string | null; // ISO datetime
  rejectedReason: string | null;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface TimeEntryWithRelations extends TimeEntry {
  project?: {
    id: string;
    name: string;
  } | null;
  task?: {
    id: string;
    name: string;
  } | null;
  user?: {
    id: string;
    name: string;
  } | null;
  approver?: {
    id: string;
    name: string;
  } | null;
  comments?: TimeEntryComment[];
}

export interface TimeEntryComment {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string; // ISO datetime
}

// ============================================================================
// LEAVE TYPES
// ============================================================================

export interface LeaveAllocation {
  id: string;
  userId: string;
  year: number;
  annualLeaveHours: number;
  usedLeaveHours: number;
  remainingHours: number;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveAllocationId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  leaveType: LeaveType;
  reason: string;
  status: EntryStatus;
  approvedBy: string | null;
  approvedAt: string | null; // ISO datetime
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface LeaveRequestWithRelations extends LeaveRequest {
  user?: {
    id: string;
    name: string;
  } | null;
  allocation?: LeaveAllocation | null;
  approver?: {
    id: string;
    name: string;
  } | null;
}

export interface LeaveBalance {
  allocation: LeaveAllocation;
  pendingRequests: LeaveRequest[];
  summary: {
    annualLeaveHours: number;
    usedLeaveHours: number;
    remainingHours: number;
    pendingHours: number;
  };
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface TimeEntryFilters {
  month?: number; // 1-12
  year?: number;
  userId?: string;
  status?: EntryStatus;
  workType?: WorkType;
  projectId?: string;
  limit?: number;
  offset?: number;
}

export interface LeaveRequestFilters {
  status?: EntryStatus;
  userId?: string;
  leaveType?: LeaveType;
  limit?: number;
  offset?: number;
}

// ============================================================================
// MONTHLY SUMMARY
// ============================================================================

export interface MonthlySummary {
  userId: string;
  month: number;
  year: number;
  totalHours: number;
  billableHours: number;
  entries: TimeEntry[];
  breakdown: {
    byWorkType: Record<WorkType, number>;
    byStatus: Record<EntryStatus, number>;
    byProject: Record<string, number>;
  };
}

export interface ProjectHoursSummary {
  projectId: string;
  month?: number;
  year?: number;
  billableHours: number;
  entries: TimeEntry[];
  byUser: Record<string, number>;
}

// ============================================================================
// APPROVAL/STATS
// ============================================================================

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface UserTimesheetStats {
  userId: string;
  currentMonth: number;
  currentYear: number;
  totalHours: number;
  billableHours: number;
  pendingApproval: number;
  approvalStats: ApprovalStats;
  leaveBalance: Partial<LeaveAllocation>;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, string>;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: Record<string, string>;
  error?: string;
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrors extends Record<string, string> {}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday-Saturday

export interface TimeRange {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface HoursBreakdown {
  total: number;
  billable: number;
  nonBillable: number;
  byWorkType: Record<WorkType, number>;
}

// ============================================================================
// FILTER CONFIGURATION
// ============================================================================

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  [WorkType.PROJECT]: "โครงการ",
  [WorkType.OFFICE]: "สำนักงาน",
  [WorkType.TRAINING]: "การฝึกอบรม",
  [WorkType.LEAVE]: "วันลา",
  [WorkType.OVERTIME]: "พิเศษ",
  [WorkType.OTHER]: "อื่น ๆ",
};

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: "ลาประจำปี",
  [LeaveType.SICK]: "ลาป่วย",
  [LeaveType.PERSONAL]: "ลากิจ",
  [LeaveType.MATERNITY]: "ลาคลอด",
  [LeaveType.UNPAID]: "ลาไม่ได้ค่าจ้าง",
};

export const STATUS_LABELS: Record<EntryStatus, string> = {
  [EntryStatus.PENDING]: "รอการอนุมัติ",
  [EntryStatus.IN_REVIEW]: "กำลังตรวจสอบ",
  [EntryStatus.APPROVED]: "อนุมัติแล้ว",
  [EntryStatus.REJECTED]: "ปฏิเสธ",
  [EntryStatus.IN_PROGRESS]: "กำลังดำเนิน",
  [EntryStatus.DONE]: "เสร็จสิ้น",
  [EntryStatus.TODO]: "ต้องทำ",
};

export const WORK_TYPE_COLORS: Record<WorkType, string> = {
  [WorkType.PROJECT]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  [WorkType.OFFICE]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  [WorkType.TRAINING]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  [WorkType.LEAVE]:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  [WorkType.OVERTIME]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  [WorkType.OTHER]:
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export const STATUS_COLORS: Record<EntryStatus, string> = {
  [EntryStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  [EntryStatus.IN_REVIEW]:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  [EntryStatus.APPROVED]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  [EntryStatus.REJECTED]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  [EntryStatus.IN_PROGRESS]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  [EntryStatus.DONE]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  [EntryStatus.TODO]:
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isTimeEntry(obj: any): obj is TimeEntry {
  return (
    obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "date" in obj &&
    "startTime" in obj &&
    "endTime" in obj &&
    "hours" in obj
  );
}

export function isLeaveRequest(obj: any): obj is LeaveRequest {
  return (
    obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "startDate" in obj &&
    "endDate" in obj &&
    "leaveType" in obj
  );
}

export function isLeaveAllocation(obj: any): obj is LeaveAllocation {
  return (
    obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "userId" in obj &&
    "year" in obj &&
    "annualLeaveHours" in obj
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getWorkTypeLabel(type: WorkType): string {
  return WORK_TYPE_LABELS[type] || type;
}

export function getLeaveTypeLabel(type: LeaveType): string {
  return LEAVE_TYPE_LABELS[type] || type;
}

export function getStatusLabel(status: EntryStatus): string {
  return STATUS_LABELS[status] || status;
}

export function getWorkTypeColor(type: WorkType): string {
  return WORK_TYPE_COLORS[type];
}

export function getStatusColor(status: EntryStatus): string {
  return STATUS_COLORS[status];
}

export function formatHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
}

export function calculateDateRange(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

// Additional exports for timesheet page
export interface TimesheetEntry extends TimeEntry {
  projectName?: string;
  taskName?: string;
}

export interface WeeklyData {
  week: string;
  totalHours: number;
  days: string[];
  data: Array<{
    userId: string;
    name: string;
    dailyHours: Record<string, number>;
    totalHours: number;
  }>;
  entries: TimesheetEntry[];
}

export interface ModalRow {
  id: string;
  date: string;
  project: string;
  task: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
  status: string;
  deleted?: boolean;
}

export interface SubmissionStatus {
  status: "Draft" | "Submitted" | "ManagerApproved" | "Approved" | "Rejected";
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}
