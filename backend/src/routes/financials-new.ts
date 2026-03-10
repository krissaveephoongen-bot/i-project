import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc, between, sum, count, sql } from 'drizzle-orm';
import { db } from '@/lib/database';
import { 
  projects, 
  users, 
  tasks, 
  timesheets, 
  actualLaborCosts,
  milestones
} from '@/lib/schema';
import { 
  withAuth,
  withPermission,
  withProjectContext,
  createErrorResponse,
  createSuccessResponse,
  addCorsHeaders
} from '@/lib/express-middleware';

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const financialsQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  includeActualCost: z.boolean().default(false),
});

// ============================================================
// FINANCIAL ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/financials/summary
 * Get comprehensive financial summary for a project
 */
router.get('/financials/summary', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(createErrorResponse('Insufficient permissions to read financial data', 403));
    }

    const projectId = contextResult.projectId!;

    // Validate query parameters
    const validation = financialsQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid query parameters', 400));
    }

    const { dateFrom, dateTo, includeActualCost } = validation.data;

    // Get project details
    const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    
    if (!project[0]) {
      return res.status(404).json(createErrorResponse('Project not found', 404));
    }

    // Get all tasks for progress calculation
    const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId));
    const completedTasks = allTasks.filter(task => task.status === 'done');
    const totalTasks = allTasks.length;
    const completionPercentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    // Calculate planned budget
    const plannedBudget = project[0]?.budget || 0;

    // Calculate actual costs
    let actualLaborCost = 0;
    let totalChargeAmount = 0;
    
    if (includeActualCost) {
      // Get actual labor costs from approved timesheets
      const laborCosts = await db.select({
        laborCost: actualLaborCosts.laborCost,
        chargeAmount: actualLaborCosts.chargeAmount
      }).where(eq(actualLaborCosts.projectId, projectId));
      
      actualLaborCost = laborCosts.reduce((sum, cost) => sum + Number(cost.laborCost || 0), 0);
      totalChargeAmount = laborCosts.reduce((sum, cost) => sum + Number(cost.chargeAmount || 0), 0);
    }

    // Get monthly cost breakdown
    const monthlyCosts = await db.select({
      monthStartDate: actualLaborCosts.monthStartDate,
      laborCost: sum(actualLaborCosts.laborCost),
      chargeAmount: sum(actualLaborCosts.chargeAmount)
    }).where(eq(actualLaborCosts.projectId, projectId))
      .groupBy(actualLaborCosts.monthStartDate)
      .orderBy(actualLaborCosts.monthStartDate);

    // Get task progress for SPI calculation
    const totalEstimatedHours = allTasks.reduce((sum, task) => sum + Number(task.estimatedHours || 0), 0);
    const totalActualHours = allTasks.reduce((sum, task) => sum + Number(task.actualHours || 0), 0);
    const spi = totalEstimatedHours > 0 ? (totalEstimatedHours / totalActualHours) : 1.00;

    // Get milestone progress
    const milestoneStats = allTasks.reduce((acc, task) => {
      if (task.milestoneId) {
        if (!acc[task.milestoneId]) {
          acc[task.milestoneId] = { completed: 0, total: 0 };
        }
        acc[task.milestoneId].total++;
        if (task.status === 'done') {
          acc[task.milestoneId].completed++;
        }
      }
      return acc;
    }, {} as Record<string, { completed: number; total: number }>);

    const milestoneProgress = Object.values(milestoneStats).map(stat => 
      stat.total > 0 ? (stat.completed / stat.total) * 100 : 0
    );

    // Calculate variance
    const variance = plannedBudget > 0 ? ((actualLaborCost - plannedBudget) / plannedBudget) * 100 : 0;

    const summary = {
      project: project[0],
      budget: {
        planned: plannedBudget,
        actual: actualLaborCost,
        chargeAmount: totalChargeAmount,
        remaining: plannedBudget - actualLaborCost,
        variance: variance
      },
      progress: {
        completionPercentage,
        taskProgress: {
          total: totalTasks,
          completed: completedTasks.length,
          inProgress: allTasks.filter(t => t.status === 'in_progress').length,
          blocked: allTasks.filter(t => t.status === 'blocked').length,
          overdue: allTasks.filter(t => 
            t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()
          ).length
        },
        spi,
        milestoneProgress
      },
      monthlyCosts: monthlyCosts.map(month => ({
        month: month.monthStartDate,
        laborCost: Number(month.laborCost),
        chargeAmount: Number(month.chargeAmount)
      }))
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(summary, 'Financial summary retrieved successfully'));
  } catch (error: any) {
    console.error('Get financial summary error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/financials/s-curve-data
 * Get S-curve data for visualization
 */
router.get('/financials/s-curve-data', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(createErrorResponse('Insufficient permissions to read financial data', 403));
    }

    const projectId = contextResult.projectId!;

    // Get project details
    const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    
    if (!project[0]) {
      return res.status(404).json(createErrorResponse('Project not found', 404));
    }

    // Get project timeline
    const startDate = project[0]?.startDate;
    const endDate = project[0]?.endDate;
    
    if (!startDate || !endDate) {
      return res.status(400).json(createErrorResponse('Project start and end dates are required for S-curve', 400));
    }

    // Get all tasks with their dates
    const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId));
    
    // Get monthly actual costs
    const monthlyActualCosts = await db.select({
      monthStartDate: actualLaborCosts.monthStartDate,
      laborCost: sum(actualLaborCosts.laborCost),
      chargeAmount: sum(actualLaborCosts.chargeAmount)
    }).where(eq(actualLaborCosts.projectId, projectId))
      .groupBy(actualLaborCosts.monthStartDate)
      .orderBy(actualLaborCosts.monthStartDate);

    // Generate monthly data for the entire project duration
    const monthlyData = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setMonth(date.getMonth() + 1)) {
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      // Calculate planned progress (linear distribution for simplicity)
      const totalMonths = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const currentMonth = Math.ceil((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const plannedProgress = Math.min((currentMonth / totalMonths) * 100, 100);
      
      // Get actual cost for this month
      const actualCostMonth = monthlyActualCosts.find(m => m.monthStartDate?.startsWith(monthKey));
      const actualCost = actualCostMonth ? Number(actualCostMonth.laborCost) : 0;
      
      // Calculate actual progress based on completed tasks
      const tasksCompletedThisMonth = allTasks.filter(task => 
        task.status === 'done' && 
        task.completedAt && 
        task.completedAt.startsWith(monthKey)
      ).length;
      const actualProgress = allTasks.length > 0 ? (tasksCompletedThisMonth / allTasks.length) * 100 : 0;

      monthlyData.push({
        month: monthKey,
        plannedProgress,
        actualProgress,
        plannedCost: (project[0]?.budget || 0) / totalMonths,
        actualCost
      });
    }

    // Calculate cumulative values
    let cumulativePlannedProgress = 0;
    let cumulativeActualProgress = 0;
    let cumulativePlannedCost = 0;
    let cumulativeActualCost = 0;

    const sCurveData = monthlyData.map(data => {
      cumulativePlannedProgress += data.plannedProgress;
      cumulativeActualProgress += data.actualProgress;
      cumulativePlannedCost += data.plannedCost;
      cumulativeActualCost += data.actualCost;

      return {
        month: data.month,
        plannedProgress: Math.min(cumulativePlannedProgress, 100),
        actualProgress: Math.min(cumulativeActualProgress, 100),
        plannedCost: cumulativePlannedCost,
        actualCost: cumulativeActualCost
      };
    });

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse({
      sCurveData,
      project: project[0]
    }, 'S-curve data retrieved successfully'));
  } catch (error: any) {
    console.error('Get S-curve data error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/financials/cost-breakdown
 * Get detailed cost breakdown by category
 */
router.get('/financials/cost-breakdown', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(createErrorResponse('Insufficient permissions to read financial data', 403));
    }

    const projectId = contextResult.projectId!;

    // Get actual labor costs by user
    const laborCostsByUser = await db.select({
      userId: actualLaborCosts.userId,
      userName: users.name,
      totalHours: sum(actualLaborCosts.hours),
      laborCost: sum(actualLaborCosts.laborCost),
      chargeAmount: sum(actualLaborCosts.chargeAmount)
    }).from(actualLaborCosts)
      .innerJoin(users, eq(actualLaborCosts.userId, users.id))
      .where(eq(actualLaborCosts.projectId, projectId))
      .groupBy(actualLaborCosts.userId, users.name)
      .orderBy(desc(sum(actualLaborCosts.laborCost)));

    // Get costs by task
    const costsByTask = await db.select({
      taskId: actualLaborCosts.taskId,
      taskTitle: tasks.title,
      totalHours: sum(actualLaborCosts.hours),
      laborCost: sum(actualLaborCosts.laborCost),
      chargeAmount: sum(actualLaborCosts.chargeAmount)
    }).from(actualLaborCosts)
      .innerJoin(tasks, eq(actualLaborCosts.taskId, tasks.id))
      .where(eq(actualLaborCosts.projectId, projectId))
      .groupBy(actualLaborCosts.taskId, tasks.title)
      .orderBy(desc(sum(actualLaborCosts.laborCost)));

    // Get costs by month
    const costsByMonth = await db.select({
      monthStartDate: actualLaborCosts.monthStartDate,
      laborCost: sum(actualLaborCosts.laborCost),
      chargeAmount: sum(actualLaborCosts.chargeAmount),
      hours: sum(actualLaborCosts.hours)
    }).where(eq(actualLaborCosts.projectId, projectId))
      .groupBy(actualLaborCosts.monthStartDate)
      .orderBy(actualLaborCosts.monthStartDate);

    // Get costs by work type
    const costsByWorkType = await db.select({
      workType: timesheets.workType,
      laborCost: sum(actualLaborCosts.laborCost),
      chargeAmount: sum(actualLaborCosts.chargeAmount),
      hours: sum(actualLaborCosts.hours)
    }).from(actualLaborCosts)
      .innerJoin(timesheets, eq(actualLaborCosts.timesheetId, timesheets.id))
      .where(eq(actualLaborCosts.projectId, projectId))
      .groupBy(timesheets.workType)
      .orderBy(desc(sum(actualLaborCosts.laborCost)));

    const breakdown = {
      byUser: laborCostsByUser.map(item => ({
        userId: item.userId,
        userName: item.userName,
        totalHours: Number(item.totalHours),
        laborCost: Number(item.laborCost),
        chargeAmount: Number(item.chargeAmount)
      })),
      byTask: costsByTask.map(item => ({
        taskId: item.taskId,
        taskTitle: item.taskTitle,
        totalHours: Number(item.totalHours),
        laborCost: Number(item.laborCost),
        chargeAmount: Number(item.chargeAmount)
      })),
      byMonth: costsByMonth.map(item => ({
        month: item.monthStartDate,
        laborCost: Number(item.laborCost),
        chargeAmount: Number(item.chargeAmount),
        hours: Number(item.hours)
      })),
      byWorkType: costsByWorkType.map(item => ({
        workType: item.workType,
        laborCost: Number(item.laborCost),
        chargeAmount: Number(item.chargeAmount),
        hours: Number(item.hours)
      }))
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(breakdown, 'Cost breakdown retrieved successfully'));
  } catch (error: any) {
    console.error('Get cost breakdown error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

export default router;
