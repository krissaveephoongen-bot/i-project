import express from 'express';
import { ProjectInsightsService } from '../services/project-insights.service';
import { authMiddleware, requireRole } from '../../../shared/middleware/authMiddleware';
import type {
  ProjectInsightFilters,
  ProjectStructureAnalysis,
  TimesheetAnalysis,
  InsightComparison
} from '../types/insights';

const router = express.Router();
const insightsService = new ProjectInsightsService();

// SECURITY: All insights endpoints require authentication and admin role

// GET /api/projects/insights - Get project insights
router.get('/', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const filters: ProjectInsightFilters = {
      projectId: req.query.projectId as string,
      userId: req.query.userId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
    };

    const insights = await insightsService.getProjectInsights(filters);
    res.json(insights);
  } catch (error) {
    console.error('Error fetching project insights:', error);
    next(error);
  }
});

// GET /api/projects/insights/summary - Get project insights summary
router.get('/summary', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const filters: ProjectInsightFilters = {
      projectId: req.query.projectId as string,
      userId: req.query.userId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
    };

    const summary = await insightsService.getProjectInsightSummary(filters);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching project insights summary:', error);
    next(error);
  }
});

// GET /api/projects/insights/structure - Get project structure analysis for sunburst chart
router.get('/structure', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = req.query.month as string;
    const filters: ProjectInsightFilters = {
      projectId: req.query.projectId as string,
      userId: req.query.userId as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
    };

    const analysis: ProjectStructureAnalysis = await insightsService.getProjectStructureAnalysis(
      year,
      month,
      filters
    );
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching project structure analysis:', error);
    next(error);
  }
});

// GET /api/projects/insights/timesheet-analysis - Get comprehensive timesheet analysis
router.get('/timesheet-analysis', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const filters: ProjectInsightFilters = {
      projectId: req.query.projectId as string,
      userId: req.query.userId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
    };

    const analysis: TimesheetAnalysis = await insightsService.getTimesheetAnalysis(filters);
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching timesheet analysis:', error);
    next(error);
  }
});

// POST /api/projects/insights/compare - Compare insights between two periods
router.post('/compare', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const { period1, period2, filters } = req.body;

    if (!period1 || !period2 || !period1.startDate || !period1.endDate || 
        !period2.startDate || !period2.endDate) {
      return res.status(400).json({ 
        error: 'Both periods must include startDate and endDate' 
      });
    }

    const comparison: InsightComparison = await insightsService.compareInsights(
      period1,
      period2,
      filters || {}
    );
    
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing insights:', error);
    next(error);
  }
});

// GET /api/projects/insights/project/:projectId - Get insights for specific project
router.get('/project/:projectId', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const filters: ProjectInsightFilters = {
      projectId,
      userId: req.query.userId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
    };

    const insights = await insightsService.getProjectInsights(filters);
    
    if (insights.length === 0) {
      return next(error);
    }

    res.json(insights[0]); // Return single project insight
  } catch (error) {
    console.error('Error fetching project insights:', error);
    next(error);
  }
});

// GET /api/projects/insights/user/:userId - Get insights for specific user
router.get('/user/:userId', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const filters: ProjectInsightFilters = {
      userId,
      projectId: req.query.projectId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
    };

    const insights = await insightsService.getProjectInsights(filters);
    res.json(insights);
  } catch (error) {
    console.error('Error fetching user insights:', error);
    next(error);
  }
});

export default router;

