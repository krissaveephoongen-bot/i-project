// Weekly Summary Types
export interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  year: number;
  weekNumber: number;
  employees: WeeklyEmployeeData[];
  summary: WeeklySummaryStats;
}

export interface WeeklyEmployeeData {
  userId: string;
  employeeName: string;
  role: string;
  dailyHours: DailyHours[];
  totalWeeklyHours: number;
  averageDailyHours: number;
  workingDays: number;
  hasData: boolean;
}

export interface DailyHours {
  date: Date;
  dayName: string;
  dayNumber: number;
  hours: number;
  hasData: boolean;
  entries: TimesheetEntry[];
}

export interface TimesheetEntry {
  id: string;
  workType: 'project' | 'office' | 'other';
  projectName?: string;
  activity: string;
  description: string;
  startTime: string;
  endTime: string;
  hours: number;
}

export interface WeeklySummaryStats {
  totalEmployees: number;
  totalHours: number;
  averageHoursPerEmployee: number;
  averageHoursPerDay: number;
  employeesWithData: number;
  employeesWithoutData: number;
  mostProductiveDay: {
    dayName: string;
    totalHours: number;
  };
  leastProductiveDay: {
    dayName: string;
    totalHours: number;
  };
}

export interface WeeklySummaryFilters {
  weekStart?: string;
  weekEnd?: string;
  year?: number;
  weekNumber?: number;
  userId?: string;
  department?: string;
  role?: string;
}

export interface WeekRange {
  weekStart: Date;
  weekEnd: Date;
  weekNumber: number;
  year: number;
  displayText: string;
}

export interface WeeklyComparison {
  currentWeek: WeeklySummary;
  previousWeek: WeeklySummary;
  changes: {
    totalHoursChange: number;
    totalHoursChangePercentage: number;
    employeesWithDataChange: number;
    averageHoursPerEmployeeChange: number;
  };
}

export interface WeeklyTrend {
  weekNumber: number;
  year: number;
  weekStart: Date;
  totalHours: number;
  employeesWithData: number;
  averageHoursPerEmployee: number;
}

export interface DailySummary {
  date: Date;
  dayName: string;
  totalHours: number;
  employeesWorking: number;
  averageHoursPerEmployee: number;
  projectHours: number;
  nonProjectHours: number;
}

export interface WeeklyReportData {
  weekInfo: {
    weekStart: Date;
    weekEnd: Date;
    weekNumber: number;
    year: number;
  };
  dailyData: DailySummary[];
  employeeData: WeeklyEmployeeData[];
  summary: WeeklySummaryStats;
}

export interface WeeklyExportData {
  fileName: string;
  headers: string[];
  data: any[][];
  weekInfo: {
    weekStart: string;
    weekEnd: string;
    weekNumber: number;
    year: number;
  };
}
