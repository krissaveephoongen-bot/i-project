export interface ProjectRow {
  id: string;
  name: string;
  status: string;
  progress: number;
  spi: number;
  cpi: number;
  budget: number;
  committed: number;
  actual: number;
  remaining: number;
  managerName?: string;
  clientName?: string;
  risks: { high: number; medium: number; low: number };
  overdueMilestones: number;
  weeklyDelta?: number;
}

export interface CashflowEntry {
  month: string;
  committed: number;
  paid: number;
}

export interface SpiTrendEntry {
  date: string;
  spi: number;
}

export interface SpiSnapEntry {
  projectId: string;
  date: string;
  spi: number;
}

export interface ActivityEntry {
  id: string;
  title: string;
  description: string;
  type: string;
  user: string;
  date: string;
}

export interface ExecReport {
  summary: {
    totalProjects: number;
    avgSpi: number;
    overdueMilestones: number;
    highRiskProjects: { name: string }[];
  };
}

export interface DashboardTotals {
  budget: number;
  committed: number;
  actual: number;
  remaining: number;
  completedCount: number;
  avgSpi: number;
}

export interface DashboardSummary {
  completedProjects: number;
  inProgressProjects: number;
  highRisks: number;
  overdueMilestones: number;
}
