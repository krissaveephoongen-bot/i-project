// ============================================================
// lib/data — Single Source of Truth Data Layer
// ============================================================
// All server-side data access should go through these repositories.
// Import from this barrel file rather than the individual modules.
//
// Usage (in a Next.js API route):
//
//   import { projectRepository, dashboardRepository } from "@/lib/data";
//
// ============================================================

export {
  ProjectRepository,
  projectRepository,
} from "./repositories/ProjectRepository";

export {
  DashboardRepository,
  dashboardRepository,
} from "./repositories/DashboardRepository";

// Re-export all types so consumers have a single import path

export type {
  ProjectRow,
  ProjectWithRelations,
  ProjectFilters,
  PaginationOptions,
  PaginatedResult,
  CreateProjectData,
  UpdateProjectData,
  ProjectStats,
} from "./repositories/ProjectRepository";

export type {
  KpiData,
  TeamLoadRow,
  ProjectOverviewStats,
  FinancialSummaryData,
} from "./repositories/DashboardRepository";
