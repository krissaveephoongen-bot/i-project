// Project Insights Types
export interface ProjectInsight {
  projectId: string;
  projectName: string;
  totalHours: number;
  projectHours: number;
  officeHours: number;
  otherHours: number;
  averageHoursPerDay: number;
  totalDaysWorked: number;
  workTypeDistribution: WorkTypeDistribution[];
  monthlyTrend: MonthlyTrend[];
  topContributors: Contributor[];
  efficiency: EfficiencyMetrics;
}

export interface WorkTypeDistribution {
  workType: "project" | "office" | "other";
  hours: number;
  percentage: number;
  color?: string;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  totalHours: number;
  projectHours: number;
  officeHours: number;
  otherHours: number;
}

export interface Contributor {
  userId: string;
  userName: string;
  totalHours: number;
  projectHours: number;
  efficiency: number;
  contributionPercentage: number;
}

export interface EfficiencyMetrics {
  overallEfficiency: number;
  projectEfficiency: number;
  timeUtilization: number;
  trendDirection: "improving" | "declining" | "stable";
}

export interface ProjectInsightFilters {
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  workType?: "project" | "office" | "other";
}

export interface ProjectInsightSummary {
  totalProjects: number;
  totalHours: number;
  averageHoursPerProject: number;
  mostActiveProject: {
    projectId: string;
    projectName: string;
    totalHours: number;
  };
  leastActiveProject: {
    projectId: string;
    projectName: string;
    totalHours: number;
  };
  topContributor: {
    userId: string;
    userName: string;
    totalHours: number;
  };
  overallEfficiency: number;
}

export interface SunburstData {
  name: string;
  value?: number;
  children?: SunburstData[];
  color?: string;
}

export interface ProjectStructureAnalysis {
  year: number;
  month?: string;
  data: SunburstData;
  totalHours: number;
  projectCount: number;
  nonProjectHours: number;
  projectHours: number;
}

export interface TimesheetAnalysis {
  workTypeBreakdown: {
    project: number;
    office: number;
    other: number;
  };
  projectBreakdown: Array<{
    projectId: string;
    projectName: string;
    hours: number;
    percentage: number;
  }>;
  staffBreakdown: Array<{
    userId: string;
    userName: string;
    hours: number;
    projectHours: number;
    officeHours: number;
    otherHours: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    count: number;
  }>;
}

export interface InsightComparison {
  period1: {
    startDate: string;
    endDate: string;
    metrics: ProjectInsightSummary;
  };
  period2: {
    startDate: string;
    endDate: string;
    metrics: ProjectInsightSummary;
  };
  changes: {
    totalHoursChange: number;
    efficiencyChange: number;
    projectCountChange: number;
  };
}
