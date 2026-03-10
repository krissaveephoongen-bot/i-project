import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { eq, and, or, desc, asc, sql, count, sum, avg, isNull } from 'drizzle-orm';
import * as schema from '@/lib/optimized-schema';

// ============================================================
// OPTIMIZED DATABASE CONNECTION POOLING
// ============================================================

class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool;
  private pool: Pool;
  private db: ReturnType<typeof drizzle>;

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'project_management',
      
      // Connection pool settings
      max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum connections
      min: parseInt(process.env.DB_POOL_MIN || '5'),  // Minimum connections
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE || '10000'), // Idle timeout (10s)
      acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE || '30000'), // Acquire timeout (30s)
      evictionRunIntervalMillis: parseInt(process.env.DB_POOL_EVICT || '1000'), // Eviction check (1s)
      
      // Connection settings
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'), // 2s
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30s
      reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000'), // 1s
      
      // SSL configuration
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      
      // Query optimization
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'), // 30s
      query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '25000'), // 25s
    });

    this.db = drizzle(this.pool, { schema, logger: process.env.NODE_ENV === 'development' });
  }

  public static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool.instance;
  }

  public getDb() {
    return this.db;
  }

  public getPool() {
    return this.pool;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  public async getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}

// Export singleton instance
export const db = DatabaseConnectionPool.getInstance().getDb();
export const pool = DatabaseConnectionPool.getInstance().getPool();

// ============================================================
// OPTIMIZED API ENDPOINTS WITH AGGREGATION
// ============================================================

export class OptimizedProjectAPI {
  // Project Portfolio Dashboard - Optimized with database aggregations
  static async getProjectPortfolioDashboard(userId?: string, filters?: {
    status?: string;
    priority?: string;
    health?: string;
    clientId?: string;
    managerId?: string;
  }) {
    try {
      // Build base query conditions
      const conditions = [
        eq(schema.projects.deletedAt, null),
        eq(schema.projects.isActive, true)
      ];

      if (filters?.status && filters.status !== 'all') {
        conditions.push(eq(schema.projects.status, filters.status));
      }
      if (filters?.priority && filters.priority !== 'all') {
        conditions.push(eq(schema.projects.priority, filters.priority));
      }
      if (filters?.health && filters.health !== 'all') {
        conditions.push(eq(schema.projects.health, filters.health));
      }
      if (filters?.clientId) {
        conditions.push(eq(schema.projects.clientId, filters.clientId));
      }
      if (filters?.managerId) {
        conditions.push(eq(schema.projects.managerId, filters.managerId));
      }

      // Use materialized view for optimal performance
      const projects = await db
        .select()
        .from(schema.projectPortfolioSummary)
        .where(and(...conditions))
        .orderBy(desc(schema.projectPortfolioSummary.budgetUtilizationPercentage));

      // Get user-specific filters if userId provided
      let userFilteredProjects = projects;
      if (userId) {
        userFilteredProjects = projects.filter(project => 
          project.managerId === userId || project.clientId === userId
        );
      }

      // Calculate portfolio metrics using database aggregations
      const portfolioMetrics = await db
        .select({
          totalProjects: count(schema.projects.id),
          activeProjects: count(schema.projects.id).where(eq(schema.projects.status, 'active')),
          completedProjects: count(schema.projects.id).where(eq(schema.projects.status, 'completed')),
          totalBudget: sum(schema.projects.budget),
          totalActualCost: sum(schema.projects.actualCost),
          averageBudgetUtilization: avg(schema.projects.actualCost / schema.projects.budget * 100),
          highRiskProjects: count(schema.projects.id).where(eq(schema.projects.health, 'critical')),
          overdueMilestones: count(schema.milestoneTracking.id).where(eq(schema.milestoneTracking.timelinessStatus, 'overdue')),
          expiredContracts: count(schema.vendorContractAnalysis.id).where(eq(schema.vendorContractAnalysis.contractStatus, 'expired'))
        })
        .from(schema.projects)
        .leftJoin(schema.milestoneTracking, eq(schema.projects.id, schema.milestoneTracking.projectId))
        .leftJoin(schema.vendorContractAnalysis, eq(schema.projects.id, schema.vendorContractAnalysis.projectId))
        .where(and(...conditions));

      return {
        projects: userFilteredProjects,
        metrics: portfolioMetrics[0] || {},
        performance: {
          totalProjects: projects.length,
          averageBudgetUtilization: projects.reduce((sum, p) => sum + (p.budgetUtilizationPercentage || 0), 0) / projects.length,
          highRiskCount: projects.filter(p => p.health === 'critical').length,
          onTrackCount: projects.filter(p => p.health === 'excellent' || p.health === 'good').length
        }
      };
    } catch (error) {
      console.error('Error fetching project portfolio dashboard:', error);
      throw error;
    }
  }

  // Financial S-Curve - Optimized with pre-aggregated data
  static async getFinancialSCurve(projectId: string, timeRange?: {
    startDate: string;
    endDate: string;
  }) {
    try {
      // Use materialized view for optimal performance
      let query = db
        .select()
        .from(schema.financialSCurveData)
        .where(eq(schema.financialSCurveData.projectId, projectId));

      // Apply time range filter if provided
      if (timeRange) {
        query = query.where(and(
          eq(schema.financialSCurveData.projectId, projectId),
          sql`${schema.financialSCurveData.month} >= ${timeRange.startDate}`,
          sql`${schema.financialSCurveData.month} <= ${timeRange.endDate}`
        ));
      }

      const sCurveData = await query.orderBy(asc(schema.financialSCurveData.month));

      // Calculate cumulative values using SQL window functions
      const cumulativeData = await db
        .select({
          month: schema.financialSCurveData.month,
          monthlyLaborCost: schema.financialSCurveData.monthlyLaborCost,
          monthlyVendorCost: schema.financialSCurveData.monthlyVendorCost,
          monthlyTotalCost: schema.financialSCurveData.monthlyTotalCost,
          cumulativeLaborCost: sql`SUM(monthly_labor_cost) OVER (ORDER BY month)`,
          cumulativeVendorCost: sql`SUM(monthly_vendor_cost) OVER (ORDER BY month)`,
          cumulativeTotalCost: sql`SUM(monthly_total_cost) OVER (ORDER BY month)`,
          plannedBudget: schema.financialSCurveData.plannedBudget,
          q1Budget: schema.financialSCurveData.q1Budget,
          q2Budget: schema.financialSCurveData.q2Budget,
          q3Budget: schema.financialSCurveData.q3Budget,
          q4Budget: schema.financialSCurveData.q4Budget
        })
        .from(schema.financialSCurveData)
        .where(eq(schema.financialSCurveData.projectId, projectId))
        .orderBy(asc(schema.financialSCurveData.month));

      return {
        sCurveData: cumulativeData,
        summary: {
          totalBudget: cumulativeData[0]?.plannedBudget || 0,
          totalActualCost: cumulativeData[cumulativeData.length - 1]?.cumulativeTotalCost || 0,
          budgetUtilization: cumulativeData[cumulativeData.length - 1] ? 
            (cumulativeData[cumulativeData.length - 1].cumulativeTotalCost / cumulativeData[0].plannedBudget) * 100 : 0,
          months: cumulativeData.length
        }
      };
    } catch (error) {
      console.error('Error fetching financial S-curve:', error);
      throw error;
    }
  }

  // User Performance Dashboard - Optimized with materialized view
  static async getUserPerformanceDashboard(userId?: string, department?: string) {
    try {
      let query = db.select().from(schema.userPerformanceDashboard);

      // Apply filters
      const conditions = [];
      if (userId) {
        conditions.push(eq(schema.userPerformanceDashboard.userId, userId));
      }
      if (department && department !== 'all') {
        conditions.push(eq(schema.userPerformanceDashboard.department, department));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const users = await query.orderBy(desc(schema.userPerformanceDashboard.totalLaborCost));

      // Calculate department metrics
      const departmentMetrics = await db
        .select({
          department: schema.userPerformanceDashboard.department,
          totalUsers: count(schema.userPerformanceDashboard.userId),
          totalProjects: sum(schema.userPerformanceDashboard.totalProjects),
          completedProjects: sum(schema.userPerformanceDashboard.completedProjects),
          totalHours: sum(schema.userPerformanceDashboard.totalHoursLogged),
          totalCost: sum(schema.userPerformanceDashboard.totalLaborCost),
          averageTaskCompletion: avg(schema.userPerformanceDashboard.taskCompletionRate),
          averageProjectCompletion: avg(schema.userPerformanceDashboard.projectCompletionRate)
        })
        .from(schema.userPerformanceDashboard)
        .groupBy(schema.userPerformanceDashboard.department)
        .orderBy(desc(schema.userPerformanceDashboard.totalCost));

      return {
        users,
        departmentMetrics,
        summary: {
          totalUsers: users.length,
          totalProjects: users.reduce((sum, u) => sum + u.totalProjects, 0),
          totalHours: users.reduce((sum, u) => sum + u.totalHoursLogged, 0),
          totalCost: users.reduce((sum, u) => sum + u.totalLaborCost, 0),
          averageTaskCompletion: users.reduce((sum, u) => sum + u.taskCompletionRate, 0) / users.length,
          averageProjectCompletion: users.reduce((sum, u) => sum + u.projectCompletionRate, 0) / users.length
        }
      };
    } catch (error) {
      console.error('Error fetching user performance dashboard:', error);
      throw error;
    }
  }

  // Task Progress Summary - Optimized with database aggregations
  static async getTaskProgressSummary(projectId?: string, filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
  }) {
    try {
      // Use materialized view for optimal performance
      let query = db.select().from(schema.taskProgressSummary);

      const conditions = [];
      if (projectId) {
        conditions.push(eq(schema.taskProgressSummary.projectId, projectId));
      }
      if (filters?.status && filters.status !== 'all') {
        conditions.push(eq(schema.tasks.status, filters.status));
      }
      if (filters?.priority && filters.priority !== 'all') {
        conditions.push(eq(schema.tasks.priority, filters.priority));
      }
      if (filters?.assignedTo) {
        conditions.push(eq(schema.tasks.assignedTo, filters.assignedTo));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const taskSummary = await query.orderBy(desc(schema.taskProgressSummary.completionPercentage));

      // Calculate overall metrics using SQL aggregations
      const overallMetrics = await db
        .select({
          totalTasks: count(schema.tasks.id),
          completedTasks: count(schema.tasks.id).where(eq(schema.tasks.status, 'completed')),
          inProgressTasks: count(schema.tasks.id).where(eq(schema.tasks.status, 'in_progress')),
          todoTasks: count(schema.tasks.id).where(eq(schema.tasks.status, 'todo')),
          urgentTasks: count(schema.tasks.id).where(eq(schema.tasks.priority, 'urgent')),
          highPriorityTasks: count(schema.tasks.id).where(eq(schema.tasks.priority, 'high')),
          totalEstimatedHours: sum(schema.tasks.estimatedHours),
          totalActualHours: sum(schema.tasks.actualHours),
          averageProgress: avg(schema.tasks.progress)
        })
        .from(schema.tasks)
        .where(and(...conditions));

      return {
        taskSummary,
        metrics: overallMetrics[0] || {},
        performance: {
          overallCompletion: overallMetrics[0] ? (overallMetrics[0].completedTasks / overallMetrics[0].totalTasks) * 100 : 0,
          hoursVariance: overallMetrics[0] ? Number(overallMetrics[0].totalActualHours) - Number(overallMetrics[0].totalEstimatedHours) : 0,
          urgentTaskCount: overallMetrics[0]?.urgentTasks || 0,
          highPriorityCount: overallMetrics[0]?.highPriorityTasks || 0
        }
      };
    } catch (error) {
      console.error('Error fetching task progress summary:', error);
      throw error;
    }
  }
}

// ============================================================
// SOFT DELETE IMPLEMENTATION
// ============================================================

export class SoftDeleteManager {
  // Soft delete project with cascading soft deletes
  static async softDeleteProject(projectId: string, deletedBy: string) {
    const transaction = await db.transaction(async (tx) => {
      // Soft delete project
      await tx
        .update(schema.projects)
        .set({ 
          deletedAt: new Date(), 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.projects.id, projectId));

      // Soft delete related tasks
      await tx
        .update(schema.tasks)
        .set({ 
          deletedAt: new Date(), 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.tasks.projectId, projectId));

      // Soft delete related timesheets
      await tx
        .update(schema.timesheets)
        .set({ 
          deletedAt: new Date(), 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.timesheets.projectId, projectId));

      // Soft delete related milestones
      await tx
        .update(schema.milestones)
        .set({ 
          deletedAt: new Date(), 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.milestones.projectId, projectId));

      // Soft delete related vendor contracts
      await tx
        .update(schema.vendorContracts)
        .set({ 
          deletedAt: new Date(), 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.vendorContracts.projectId, projectId));

      // Log the soft delete action
      await tx
        .insert(schema.auditLogs)
        .values({
          action: 'soft_delete',
          entityType: 'project',
          entityId: projectId,
          userId: deletedBy,
          details: { timestamp: new Date().toISOString() },
          createdAt: new Date()
        });
    });

    return transaction;
  }

  // Soft delete task
  static async softDeleteTask(taskId: string, deletedBy: string) {
    const transaction = await db.transaction(async (tx) => {
      // Soft delete task
      await tx
        .update(schema.tasks)
        .set({ 
          deletedAt: new Date(), 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.tasks.id, taskId));

      // Soft delete related timesheets
      await tx
        .update(schema.timesheets)
        .set({ 
          deletedAt: new Date(), 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.timesheets.taskId, taskId));

      // Log the soft delete action
      await tx
        .insert(schema.auditLogs)
        .values({
          action: 'soft_delete',
          entityType: 'task',
          entityId: taskId,
          userId: deletedBy,
          details: { timestamp: new Date().toISOString() },
          createdAt: new Date()
        });
    });

    return transaction;
  }

  // Soft delete timesheet
  static async softDeleteTimesheet(timesheetId: string, deletedBy: string) {
    const transaction = await db.transaction(async (tx) => {
      // Soft delete timesheet
      await tx
        .update(schema.timesheets)
        .set({ 
          deletedAt: new Date(), 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.timesheets.id, timesheetId));

      // Log the soft delete action
      await tx
        .insert(schema.auditLogs)
        .values({
          action: 'soft_delete',
          entityType: 'timesheet',
          entityId: timesheetId,
          userId: deletedBy,
          details: { timestamp: new Date().toISOString() },
          createdAt: new Date()
        });
    });

    return transaction;
  }

  // Restore soft deleted entity
  static async restoreSoftDeletedEntity(entityType: string, entityId: string, restoredBy: string) {
    const transaction = await db.transaction(async (tx) => {
      let table;
      switch (entityType) {
        case 'project':
          table = schema.projects;
          break;
        case 'task':
          table = schema.tasks;
          break;
        case 'timesheet':
          table = schema.timesheets;
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      await tx
        .update(table)
        .set({ 
          deletedAt: null, 
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(table.id, entityId));

      // Log the restore action
      await tx
        .insert(schema.auditLogs)
        .values({
          action: 'restore',
          entityType,
          entityId,
          userId: restoredBy,
          details: { timestamp: new Date().toISOString() },
          createdAt: new Date()
        });
    });

    return transaction;
  }
}

// ============================================================
// MIGRATION MANAGEMENT
// ============================================================

export class MigrationManager {
  // Run all pending migrations
  static async runMigrations() {
    try {
      console.log('Running database migrations...');
      await migrate(db, { migrationsFolder: './drizzle' });
      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  // Create performance indexes
  static async createPerformanceIndexes() {
    try {
      console.log('Creating performance indexes...');
      
      const indexes = [
        // Project dashboard indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_dashboard ON projects(status, priority, health, is_active, deleted_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_financial ON projects(budget, actual_cost, is_active, deleted_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_dates_dashboard ON projects(start_date, end_date, is_active, deleted_at)',
        
        // Task dashboard indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_dashboard ON tasks(project_id, status, priority, is_active, deleted_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_dashboard ON tasks(assigned_to, status, is_active, deleted_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_progress_dashboard ON tasks(progress, status, is_active, deleted_at)',
        
        // Timesheet financial indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheets_financial ON timesheets(project_id, status, work_date, labor_cost, is_active, deleted_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheets_user_financial ON timesheets(user_id, status, work_date, labor_cost, is_active, deleted_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheets_cost_analysis ON timesheets(labor_cost, billable_hours, work_type, is_active, deleted_at)',
        
        // User performance indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_performance ON users(department, is_active, deleted_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_projects ON users(id, is_active, deleted_at) WHERE id IN (SELECT manager_id FROM projects UNION SELECT client_id FROM projects)',
        
        // Milestone tracking indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_tracking ON milestones(project_id, status, target_date, is_active, deleted_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_assigned_tracking ON milestones(assigned_to, status, target_date, is_active, deleted_at)',
        
        // Vendor contract indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendor_contracts_analysis ON vendor_contracts(project_id, status, risk_level, total_value, is_active, deleted_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendor_contracts_financial ON vendor_contracts(total_value, paid_amount, is_active, deleted_at)'
      ];

      for (const indexSql of indexes) {
        try {
          await db.execute(sql.raw(indexSql));
          console.log(`Created index: ${indexSql.substring(0, 50)}...`);
        } catch (error) {
          console.error(`Failed to create index: ${indexSql.substring(0, 50)}...`, error);
        }
      }

      console.log('Performance indexes created successfully');
    } catch (error) {
      console.error('Failed to create performance indexes:', error);
      throw error;
    }
  }

  // Create materialized views
  static async createMaterializedViews() {
    try {
      console.log('Creating materialized views...');
      
      const views = [
        // Project portfolio summary
        `CREATE MATERIALIZED VIEW IF NOT EXISTS project_portfolio_summary AS
         SELECT 
           p.id,
           p.name,
           p.status,
           p.priority,
           p.health,
           p.budget,
           COALESCE(pfs.total_actual_cost, 0) as total_actual_cost,
           p.budget - COALESCE(pfs.total_actual_cost, 0) as remaining_budget,
           COALESCE(pfs.task_completion_percentage, 0) as task_completion_percentage,
           COALESCE(pfs.budget_utilization_percentage, 0) as budget_utilization_percentage,
           COUNT(DISTINCT CASE WHEN m.status = 'overdue' THEN m.id END) as overdue_milestones,
           COUNT(DISTINCT CASE WHEN vc.contract_status = 'expired' THEN vc.id END) as expired_contracts
         FROM projects p
         LEFT JOIN project_financial_summary pfs ON p.id = pfs.project_id
         LEFT JOIN milestone_tracking m ON p.id = m.project_id
         LEFT JOIN vendor_contract_analysis vc ON p.id = vc.project_id
         WHERE p.deleted_at IS NULL AND p.is_active = true
         GROUP BY p.id, p.name, p.status, p.priority, p.health, p.budget, pfs.total_actual_cost, pfs.task_completion_percentage, pfs.budget_utilization_percentage`,
        
        // User performance dashboard
        `CREATE MATERIALIZED VIEW IF NOT EXISTS user_performance_dashboard AS
         SELECT 
           u.id,
           u.name,
           u.email,
           u.department,
           ups.total_projects,
           ups.completed_projects,
           ups.total_tasks,
           ups.completed_tasks,
           ups.total_hours_logged,
           ups.total_labor_cost,
           ups.average_labor_cost,
           ups.total_milestones,
           ups.completed_milestones,
           CASE 
             WHEN ups.total_tasks > 0 THEN (ups.completed_tasks * 100.0 / ups.total_tasks)
             ELSE 0 
           END as task_completion_rate,
           CASE 
             WHEN ups.total_projects > 0 THEN (ups.completed_projects * 100.0 / ups.total_projects)
             ELSE 0 
           END as project_completion_rate
         FROM users u
         LEFT JOIN user_performance_summary ups ON u.id = ups.user_id
         WHERE u.deleted_at IS NULL AND u.is_active = true
         GROUP BY u.id, u.name, u.email, u.department, ups.total_projects, ups.completed_projects, ups.total_tasks, ups.completed_tasks, ups.total_hours_logged, ups.total_labor_cost, ups.average_labor_cost, ups.total_milestones, ups.completed_milestones`,
        
        // Financial S-Curve data
        `CREATE MATERIALIZED VIEW IF NOT EXISTS financial_s_curve_data AS
         SELECT 
           p.id as project_id,
           p.name as project_name,
           DATE_TRUNC('month', ts.work_date) as month,
           COALESCE(SUM(ts.labor_cost), 0) as monthly_labor_cost,
           COALESCE(SUM(vc.total_value), 0) as monthly_vendor_cost,
           COALESCE(SUM(ts.labor_cost), 0) + COALESCE(SUM(vc.total_value), 0) as monthly_total_cost,
           COALESCE(SUM(CASE WHEN ts.work_date <= p.end_date THEN ts.labor_cost END), 0) as cumulative_labor_cost,
           COALESCE(SUM(CASE WHEN ts.end_date <= DATE_TRUNC('month', ts.work_date) THEN vc.total_value END), 0) as cumulative_vendor_cost,
           COALESCE(SUM(CASE WHEN ts.work_date <= p.end_date THEN ts.labor_cost END), 0) + COALESCE(SUM(CASE WHEN ts.end_date <= DATE_TRUNC('month', ts.work_date) THEN vc.total_value END), 0) as cumulative_total_cost,
           p.budget as planned_budget,
           p.budget * 0.25 as q1_budget,
           p.budget * 0.50 as q2_budget,
           p.budget * 0.75 as q3_budget,
           p.budget as q4_budget
         FROM projects p
         LEFT JOIN timesheets ts ON p.id = ts.project_id AND ts.deleted_at IS NULL AND ts.status = 'approved'
         LEFT JOIN vendor_contracts vc ON p.id = vc.project_id AND vc.deleted_at IS NULL
         WHERE p.deleted_at IS NULL AND p.is_active = true
         GROUP BY p.id, p.name, p.budget, DATE_TRUNC('month', ts.work_date)
         ORDER BY p.id, DATE_TRUNC('month', ts.work_date)`
      ];

      for (const viewSql of views) {
        try {
          await db.execute(sql.raw(viewSql));
          console.log(`Created materialized view: ${viewSql.substring(0, 50)}...`);
        } catch (error) {
          console.error(`Failed to create materialized view: ${viewSql.substring(0, 50)}...`, error);
        }
      }

      console.log('Materialized views created successfully');
    } catch (error) {
      console.error('Failed to create materialized views:', error);
      throw error;
    }
  }

  // Refresh materialized views
  static async refreshMaterializedViews() {
    try {
      console.log('Refreshing materialized views...');
      
      const views = [
        'project_portfolio_summary',
        'user_performance_dashboard',
        'financial_s_curve_data'
      ];
      
      for (const viewName of views) {
        try {
          await db.execute(sql.raw(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`));
          console.log(`Refreshed materialized view: ${viewName}`);
        } catch (error) {
          console.error(`Failed to refresh materialized view: ${viewName}`, error);
        }
      }

      console.log('Materialized views refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh materialized views:', error);
      throw error;
    }
  }

  // Create automatic refresh triggers
  static async createRefreshTriggers() {
    try {
      console.log('Creating refresh triggers...');
      
      const triggers = [
        // Project portfolio summary refresh trigger
        `CREATE OR REPLACE FUNCTION refresh_project_portfolio_summary()
         RETURNS TRIGGER AS $$
         BEGIN
           REFRESH MATERIALIZED VIEW CONCURRENTLY project_portfolio_summary;
           RETURN COALESCE(NEW, OLD);
         END;
         $$ LANGUAGE plpgsql;
         
         DROP TRIGGER IF EXISTS trigger_refresh_project_portfolio_summary ON projects;
         CREATE TRIGGER trigger_refresh_project_portfolio_summary
           AFTER INSERT OR UPDATE OR DELETE ON projects
           FOR EACH ROW EXECUTE FUNCTION refresh_project_portfolio_summary();`,
        
        // User performance dashboard refresh trigger
        `CREATE OR REPLACE FUNCTION refresh_user_performance_dashboard()
         RETURNS TRIGGER AS $$
         BEGIN
           REFRESH MATERIALIZED VIEW CONCURRENTLY user_performance_dashboard;
           RETURN COALESCE(NEW, OLD);
         END;
         $$ LANGUAGE plpgsql;
         
         DROP TRIGGER IF EXISTS trigger_refresh_user_performance_dashboard_users ON users;
         CREATE TRIGGER trigger_refresh_user_performance_dashboard_users
           AFTER INSERT OR UPDATE OR DELETE ON users
           FOR EACH ROW EXECUTE FUNCTION refresh_user_performance_dashboard();`,
        
        // Financial S-Curve refresh trigger
        `CREATE OR REPLACE FUNCTION refresh_financial_s_curve_data()
         RETURNS TRIGGER AS $$
         BEGIN
           REFRESH MATERIALIZED VIEW CONCURRENTLY financial_s_curve_data;
           RETURN COALESCE(NEW, OLD);
         END;
         $$ LANGUAGE plpgsql;
         
         DROP TRIGGER IF EXISTS trigger_refresh_financial_s_curve_data_timesheets ON timesheets;
         CREATE TRIGGER trigger_refresh_financial_s_curve_data_timesheets
           AFTER INSERT OR UPDATE OR DELETE ON timesheets
           FOR EACH ROW EXECUTE FUNCTION refresh_financial_s_curve_data();`
      ];

      for (const triggerSql of triggers) {
        try {
          await db.execute(sql.raw(triggerSql));
          console.log(`Created trigger: ${triggerSql.substring(0, 50)}...`);
        } catch (error) {
          console.error(`Failed to create trigger: ${triggerSql.substring(0, 50)}...`, error);
        }
      }

      console.log('Refresh triggers created successfully');
    } catch (error) {
      console.error('Failed to create refresh triggers:', error);
      throw error;
    }
  }
}

// ============================================================
// PERFORMANCE MONITORING
// ============================================================

export class PerformanceMonitor {
  // Analyze slow queries
  static async analyzeSlowQueries() {
    try {
      const slowQueries = await db.execute(sql`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows,
          100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
        FROM pg_stat_statements
        WHERE mean_time > 100 -- Queries taking more than 100ms
        ORDER BY mean_time DESC
        LIMIT 10
      `);

      return slowQueries;
    } catch (error) {
      console.error('Failed to analyze slow queries:', error);
      throw error;
    }
  }

  // Analyze index usage
  static async analyzeIndexUsage() {
    try {
      const indexUsage = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch,
          CASE 
            WHEN idx_scan = 0 THEN 'UNUSED'
            WHEN idx_scan < 10 THEN 'LOW_USAGE'
            WHEN idx_scan < 100 THEN 'MEDIUM_USAGE'
            ELSE 'HIGH_USAGE'
          END as usage_category
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC
      `);

      return indexUsage;
    } catch (error) {
      console.error('Failed to analyze index usage:', error);
      throw error;
    }
  }

  // Analyze table sizes
  static async analyzeTableSizes() {
    try {
      const tableSizes = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
          pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes,
          pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename) AS index_size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);

      return tableSizes;
    } catch (error) {
      console.error('Failed to analyze table sizes:', error);
      throw error;
    }
  }

  // Get database connection pool stats
  static async getPoolStats() {
    return DatabaseConnectionPool.getInstance().getPoolStats();
  }

  // Database health check
  static async healthCheck() {
    return DatabaseConnectionPool.getInstance().healthCheck();
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

export async function initializeOptimizedDatabase() {
  try {
    console.log('Initializing optimized database...');
    
    // Run migrations
    await MigrationManager.runMigrations();
    
    // Create performance indexes
    await MigrationManager.createPerformanceIndexes();
    
    // Create materialized views
    await MigrationManager.createMaterializedViews();
    
    // Create refresh triggers
    await MigrationManager.createRefreshTriggers();
    
    // Refresh materialized views
    await MigrationManager.refreshMaterializedViews();
    
    console.log('Optimized database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize optimized database:', error);
    throw error;
  }
}

// Export classes and utilities
export {
  OptimizedProjectAPI,
  SoftDeleteManager,
  MigrationManager,
  PerformanceMonitor,
  DatabaseConnectionPool
};
