// Executive Report Types
export interface ExecutiveReport {
  summary: ExecutiveSummary;
  data: TimesheetReportData[];
  filters: ReportFilters;
}

export interface ExecutiveSummary {
  totalHours: number;
  totalEmployees: number;
  totalProjects: number;
  averageHoursPerPerson: number;
  projectHours: number;
  nonProjectHours: number;
  efficiency: number;
}

export interface TimesheetReportData {
  id: string;
  recorderName: string;
  role: string;
  workDate: Date;
  startTime: string;
  endTime: string;
  workType: 'project' | 'office' | 'other';
  projectName?: string;
  activity: string;
  description: string;
  hours: number;
  userId: string;
  projectId?: string;
}

export interface ReportFilters {
  year: number;
  month?: number; // undefined = ทั้งหมด
  userId?: string;
  projectId?: string;
  workType?: 'project' | 'office' | 'other';
}

export interface ExecutiveReportFilters {
  year: number;
  month?: number;
  userId?: string;
  projectId?: string;
  workType?: 'project' | 'office' | 'other';
  startDate?: string;
  endDate?: string;
}

export interface MonthlyReportData {
  month: number;
  monthName: string;
  totalHours: number;
  totalEmployees: number;
  totalProjects: number;
  averageHoursPerPerson: number;
}

export interface ProjectReportSummary {
  projectId: string;
  projectName: string;
  totalHours: number;
  totalEmployees: number;
  averageHoursPerEmployee: number;
  completionRate: number;
}

export interface EmployeeReportSummary {
  userId: string;
  employeeName: string;
  role: string;
  totalHours: number;
  projectHours: number;
  nonProjectHours: number;
  efficiency: number;
  projectsWorked: number;
}

export interface ExportData {
  fileName: string;
  data: any[];
  headers: string[];
  filters: ReportFilters;
}

export interface BatchDeleteRequest {
  ids: string[];
  reason?: string;
}

export interface BatchDeleteResult {
  success: boolean;
  deletedCount: number;
  failedIds: string[];
  message: string;
}
