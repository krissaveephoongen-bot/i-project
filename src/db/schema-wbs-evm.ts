/**
 * Drizzle ORM Schema for WBS & EVM Analytics
 * 
 * Strategy: Use Drizzle for complex aggregation queries and EVM calculations
 * - Prisma: CRUD operations, relationship navigation
 * - Drizzle: Sum/aggregate queries, rollup calculations, S-curve data
 */

import {
  pgTable,
  text,
  numeric,
  timestamp,
  integer,
  boolean,
  json,
  uniqueIndex,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core'

// ============================================================================
// WBS HIERARCHY TABLES
// ============================================================================

export const wbsRoot = pgTable(
  'wbs_root',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull().unique(),
    baselineDate: timestamp('baseline_date').defaultNow(),
    isBaseline: boolean('is_baseline').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    projectIdIdx: index('idx_wbs_root_project').on(table.projectId),
  })
)

export const wbsPhase = pgTable(
  'wbs_phase',
  {
    id: text('id').primaryKey(),
    wbsRootId: text('wbs_root_id').notNull(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    sequenceNumber: integer('sequence_number').notNull(),
    plannedStartDate: timestamp('planned_start_date').notNull(),
    plannedEndDate: timestamp('planned_end_date').notNull(),
    actualStartDate: timestamp('actual_start_date'),
    actualEndDate: timestamp('actual_end_date'),
    allocatedBudget: numeric('allocated_budget', { precision: 15, scale: 2 }).notNull(),
    budgetPercent: numeric('budget_percent', { precision: 5, scale: 2 }).notNull(),
    plannedProgress: numeric('planned_progress', { precision: 5, scale: 2 }).default('0'),
    actualProgress: numeric('actual_progress', { precision: 5, scale: 2 }).default('0'),
    status: text('status').default('planned'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    wbsRootIdIdx: index('idx_wbs_phase_root').on(table.wbsRootId),
    codeUniqueIdx: uniqueIndex('idx_wbs_phase_code_unique').on(table.wbsRootId, table.code),
    statusIdx: index('idx_wbs_phase_status').on(table.status),
  })
)

export const wbsWorkpackage = pgTable(
  'wbs_workpackage',
  {
    id: text('id').primaryKey(),
    phaseId: text('phase_id').notNull(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    sequenceNumber: integer('sequence_number').notNull(),
    plannedStartDate: timestamp('planned_start_date').notNull(),
    plannedEndDate: timestamp('planned_end_date').notNull(),
    actualStartDate: timestamp('actual_start_date'),
    actualEndDate: timestamp('actual_end_date'),
    allocatedBudget: numeric('allocated_budget', { precision: 15, scale: 2 }).notNull(),
    budgetPercent: numeric('budget_percent', { precision: 5, scale: 2 }).notNull(),
    plannedProgress: numeric('planned_progress', { precision: 5, scale: 2 }).default('0'),
    actualProgress: numeric('actual_progress', { precision: 5, scale: 2 }).default('0'),
    progressMethod: text('progress_method').default('duration_based'),
    status: text('status').default('planned'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    phaseIdIdx: index('idx_wbs_workpackage_phase').on(table.phaseId),
    codeUniqueIdx: uniqueIndex('idx_wbs_workpackage_code_unique').on(table.phaseId, table.code),
    statusIdx: index('idx_wbs_workpackage_status').on(table.status),
  })
)

export const wbsTask = pgTable(
  'wbs_task',
  {
    id: text('id').primaryKey(),
    workpackageId: text('workpackage_id').notNull(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    sequenceNumber: integer('sequence_number').notNull(),
    plannedDuration: integer('planned_duration').notNull(), // days
    plannedStartDate: timestamp('planned_start_date').notNull(),
    plannedEndDate: timestamp('planned_end_date').notNull(),
    actualStartDate: timestamp('actual_start_date'),
    actualEndDate: timestamp('actual_end_date'),
    plannedProgress: numeric('planned_progress', { precision: 5, scale: 2 }).default('0'),
    actualProgress: numeric('actual_progress', { precision: 5, scale: 2 }).default('0'),
    progressMethod: text('progress_method').default('resource_based'),
    allocatedBudget: numeric('allocated_budget', { precision: 15, scale: 2 }).notNull(),
    assignedUserId: text('assigned_user_id'),
    estimatedHours: numeric('estimated_hours', { precision: 10, scale: 2 }).notNull(),
    actualHours: numeric('actual_hours', { precision: 10, scale: 2 }).default('0'),
    status: text('status').default('planned'),
    riskLevel: text('risk_level').default('low'), // low, medium, high, critical
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    workpackageIdIdx: index('idx_wbs_task_workpackage').on(table.workpackageId),
    assignedUserIdx: index('idx_wbs_task_assigned_user').on(table.assignedUserId),
    statusRiskIdx: index('idx_wbs_task_status_risk').on(table.status, table.riskLevel),
    codeUniqueIdx: uniqueIndex('idx_wbs_task_code_unique').on(table.workpackageId, table.code),
  })
)

// ============================================================================
// COST ALLOCATION TABLES
// ============================================================================

export const taskCostAllocation = pgTable(
  'task_cost_allocation',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id').notNull(),
    category: text('category').notNull(), // labor, material, equipment, overhead, contingency, expense
    plannedCost: numeric('planned_cost', { precision: 12, scale: 2 }).notNull(),
    actualCost: numeric('actual_cost', { precision: 12, scale: 2 }).default('0'),
    committedCost: numeric('committed_cost', { precision: 12, scale: 2 }).default('0'),
    quantity: numeric('quantity', { precision: 10, scale: 2 }),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    taskCategoryIdx: index('idx_task_cost_task_category').on(table.taskId, table.category),
  })
)

export const taskResourceAssignment = pgTable(
  'task_resource_assignment',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id').notNull(),
    userId: text('user_id').notNull(),
    role: text('role').notNull(),
    allocatedHours: numeric('allocated_hours', { precision: 10, scale: 2 }).notNull(),
    actualHours: numeric('actual_hours', { precision: 10, scale: 2 }).default('0'),
    hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }).notNull(),
    plannedLaborCost: numeric('planned_labor_cost', { precision: 12, scale: 2 }).notNull(),
    actualLaborCost: numeric('actual_labor_cost', { precision: 12, scale: 2 }).default('0'),
    status: text('status').default('active'),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    taskUserUniqueIdx: uniqueIndex('idx_task_resource_task_user_unique').on(
      table.taskId,
      table.userId
    ),
    userIdIdx: index('idx_task_resource_user').on(table.userId),
  })
)

// ============================================================================
// EVM SNAPSHOTS & CALCULATIONS
// ============================================================================

/**
 * Period Snapshot: Stores calculated EVM metrics per period
 * This is the core data structure for performance analysis
 */
export const evmPeriodSnapshot = pgTable(
  'evm_period_snapshot',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    wbsLevel: text('wbs_level').notNull(), // project, phase, workpackage, task
    entityId: text('entity_id').notNull(), // Phase/WP/Task/Project ID
    periodType: text('period_type').notNull(), // daily, weekly, monthly, quarterly
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),

    // ===== EARNED VALUE METRICS =====
    bcws: numeric('bcws', { precision: 15, scale: 2 }).notNull(), // Budget Cost of Work Scheduled
    bcwp: numeric('bcwp', { precision: 15, scale: 2 }).notNull(), // Budget Cost of Work Performed
    acwp: numeric('acwp', { precision: 15, scale: 2 }).notNull(), // Actual Cost of Work Performed

    // ===== PERFORMANCE INDICES =====
    spi: numeric('spi', { precision: 5, scale: 3 }), // Schedule Performance Index = BCWP / BCWS
    cpi: numeric('cpi', { precision: 5, scale: 3 }), // Cost Performance Index = BCWP / ACWP

    // ===== VARIANCES =====
    scheduleVariance: numeric('schedule_variance', { precision: 15, scale: 2 }), // SV = BCWP - BCWS
    costVariance: numeric('cost_variance', { precision: 15, scale: 2 }), // CV = BCWP - ACWP

    // ===== FORECAST =====
    eac: numeric('eac', { precision: 15, scale: 2 }), // Estimate at Completion
    etcCost: numeric('etc_cost', { precision: 15, scale: 2 }), // Estimate to Complete
    vac: numeric('vac', { precision: 15, scale: 2 }), // Variance at Completion

    // ===== TREND INDICATORS =====
    trendStatus: text('trend_status'), // on-track, at-risk, critical

    calculatedAt: timestamp('calculated_at').defaultNow(),
  },
  (table) => ({
    projectPeriodUniqueIdx: uniqueIndex('idx_evm_project_period_unique').on(
      table.projectId,
      table.wbsLevel,
      table.entityId,
      table.periodStart
    ),
    projectPeriodIdx: index('idx_evm_project_period').on(table.projectId, table.periodStart),
    spiCpiIdx: index('idx_evm_spi_cpi').on(table.spi, table.cpi), // For risk filtering
  })
)

// ============================================================================
// S-CURVE DATA
// ============================================================================

/**
 * S-Curve Data: Cumulative values by period
 * Used for visualization: Planned vs Earned vs Actual
 */
export const scurveData = pgTable(
  'scurve_data',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    periodDate: timestamp('period_date').notNull(), // Start of period
    cumulativeBcws: numeric('cumulative_bcws', { precision: 15, scale: 2 }).notNull(),
    cumulativeBcwp: numeric('cumulative_bcwp', { precision: 15, scale: 2 }).notNull(),
    cumulativeAcwp: numeric('cumulative_acwp', { precision: 15, scale: 2 }).notNull(),
    plannedPercent: numeric('planned_percent', { precision: 5, scale: 2 }).notNull(),
    earnedPercent: numeric('earned_percent', { precision: 5, scale: 2 }).notNull(),
    actualPercent: numeric('actual_percent', { precision: 5, scale: 2 }).notNull(),
    spi: numeric('spi', { precision: 5, scale: 3 }).notNull(),
    cpi: numeric('cpi', { precision: 5, scale: 3 }).notNull(),
    calculatedAt: timestamp('calculated_at').defaultNow(),
  },
  (table) => ({
    projectPeriodUniqueIdx: uniqueIndex('idx_scurve_project_period_unique').on(
      table.projectId,
      table.periodDate
    ),
    projectIdx: index('idx_scurve_project').on(table.projectId),
  })
)

// ============================================================================
// BASELINE & CHANGE CONTROL
// ============================================================================

export const projectBaseline = pgTable(
  'project_baseline',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    baselineNumber: integer('baseline_number').notNull(),
    baselineType: text('baseline_type').default('performance'), // performance, budget, schedule
    totalBudget: numeric('total_budget', { precision: 15, scale: 2 }).notNull(),
    totalDuration: integer('total_duration').notNull(), // days
    baselineDate: timestamp('baseline_date').notNull(),
    baselineSnapshot: json('baseline_snapshot').$type<Record<string, unknown>>().notNull(),
    isActive: boolean('is_active').default(false),
    approvedBy: text('approved_by'),
    approvedDate: timestamp('approved_date'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    projectBaselineUniqueIdx: uniqueIndex('idx_project_baseline_number_unique').on(
      table.projectId,
      table.baselineNumber
    ),
    projectActiveIdx: index('idx_project_baseline_active').on(table.projectId, table.isActive),
  })
)

// ============================================================================
// COMMITMENT TRACKING (POs)
// ============================================================================

export const projectCommitment = pgTable(
  'project_commitment',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    taskId: text('task_id'),
    poNumber: text('po_number').notNull().unique(),
    vendor: text('vendor').notNull(),
    description: text('description').notNull(),
    poAmount: numeric('po_amount', { precision: 15, scale: 2 }).notNull(),
    category: text('category').notNull(), // labor, material, equipment, overhead, contingency
    status: text('status').default('issued'), // issued, received, invoiced, paid
    issuedDate: timestamp('issued_date').notNull(),
    expectedDelivery: timestamp('expected_delivery'),
    actualDelivery: timestamp('actual_delivery'),
    invoiceDate: timestamp('invoice_date'),
    paidDate: timestamp('paid_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    projectStatusIdx: index('idx_commitment_project_status').on(table.projectId, table.status),
    taskIdx: index('idx_commitment_task').on(table.taskId),
  })
)

// ============================================================================
// RISK REGISTER
// ============================================================================

export const projectRisk = pgTable(
  'project_risk',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    wbsTaskId: text('wbs_task_id'),
    code: text('code').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(), // Technical, Resource, External, Financial
    probability: numeric('probability', { precision: 3, scale: 2 }).notNull(), // 0.0 - 1.0
    impactCost: numeric('impact_cost', { precision: 12, scale: 2 }),
    impactSchedule: integer('impact_schedule'), // days
    riskScore: numeric('risk_score', { precision: 5, scale: 2 }), // probability * impact
    mitigationPlan: text('mitigation_plan'),
    owner: text('owner'),
    status: text('status').default('identified'), // identified, monitoring, mitigated, closed
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    projectScoreIdx: index('idx_risk_project_score').on(table.projectId, table.riskScore),
  })
)

// ============================================================================
// REPORTING PERIOD CONFIGURATION
// ============================================================================

export const reportingPeriod = pgTable(
  'reporting_period',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull().unique(),
    periodType: text('period_type').notNull().default('monthly'), // daily, weekly, monthly, quarterly
    periodStartDay: integer('period_start_day').default(1),
    fiscalYearStart: text('fiscal_year_start'), // e.g., "01-01"
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  }
)

// ============================================================================
// EXTEND: Projects Table Fields (to add)
// ============================================================================
// Add to existing projects table:
//   bac: numeric('bac', { precision: 15, scale: 2 }),              // Budget at Completion
//   currentBcws: numeric('current_bcws', { precision: 15, scale: 2 }).default('0'),
//   currentBcwp: numeric('current_bcwp', { precision: 15, scale: 2 }).default('0'),
//   currentAcwp: numeric('current_acwp', { precision: 15, scale: 2 }).default('0'),
//   currentSpi: numeric('current_spi', { precision: 5, scale: 3 }).default('1.00'),
//   currentCpi: numeric('current_cpi', { precision: 5, scale: 3 }).default('1.00'),
//   lastEVMCalculation: timestamp('last_evm_calculation'),
