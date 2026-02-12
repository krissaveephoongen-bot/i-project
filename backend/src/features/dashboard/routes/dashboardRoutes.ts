import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../../../shared/middleware/authMiddleware';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/kpi - Get dashboard KPI data
router.get('/kpi', dashboardController.getKpiData);

// GET /api/dashboard/projects/overview - Get projects overview
router.get('/projects/overview', dashboardController.getProjectsOverview);

// GET /api/dashboard/team/performance - Get team performance data
router.get('/team/performance', dashboardController.getTeamPerformance);

// GET /api/dashboard/financial/summary - Get financial summary
router.get('/financial/summary', dashboardController.getFinancialSummary);

export { router as dashboardRoutes };
