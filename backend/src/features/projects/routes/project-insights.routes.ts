import express from 'express';
import { ProjectInsightsService } from '../services/project-insights.service';
import type {
  ProjectInsightFilters,
  ProjectStructureAnalysis,
  TimesheetAnalysis,
  InsightComparison
} from '../types/insights';

const router = express.Router();
const insightsService = new ProjectInsightsService();

// GET /api/projects/insights - Get project insights
router.get('/', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch project insights' });
  }
});

// GET /api/projects/insights/summary - Get project insights summary
router.get('/summary', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch project insights summary' });
  }
});

// GET /api/projects/insights/structure - Get project structure analysis for sunburst chart
router.get('/structure', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch project structure analysis' });
  }
});

// GET /api/projects/insights/timesheet-analysis - Get comprehensive timesheet analysis
router.get('/timesheet-analysis', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch timesheet analysis' });
  }
});

// POST /api/projects/insights/compare - Compare insights between two periods
router.post('/compare', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to compare insights' });
  }
});

// GET /api/projects/insights/project/:projectId - Get insights for specific project
router.get('/project/:projectId', async (req, res) => {
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
      return res.status(404).json({ error: 'No insights found for this project' });
    }

    res.json(insights[0]); // Return single project insight
  } catch (error) {
    console.error('Error fetching project insights:', error);
    res.status(500).json({ error: 'Failed to fetch project insights' });
  }
});

// GET /api/projects/insights/user/:userId - Get insights for specific user
router.get('/user/:userId', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch user insights' });
  }
});

export default router;
