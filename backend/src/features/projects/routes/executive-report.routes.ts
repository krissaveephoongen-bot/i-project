import express from 'express';
import { ExecutiveReportService } from '../services/executive-report.service.js';
import { authMiddleware, requireRole } from '../../../shared/middleware/authMiddleware';
import type {
  ExecutiveReportFilters,
  BatchDeleteRequest
} from '../types/executive-report';

const router = express.Router();
const reportService = new ExecutiveReportService();

// SECURITY: All reporting endpoints require authentication and admin role
// These contain sensitive business data and batch operations

// GET /api/projects/executive-report - ดึงข้อมูลรายงานเชิงบริหาร
router.get('/', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const filters: ExecutiveReportFilters = {
      year: parseInt(req.query.year as string) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month as string) : undefined,
      userId: req.query.userId as string,
      projectId: req.query.projectId as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const report = await reportService.getExecutiveReport(filters);
    res.json(report);
  } catch (error) {
    console.error('Error fetching executive report:', error);
    next(error);
  }
});

// GET /api/projects/executive-report/summary - ดึงข้อมูลสรุปเฉพาะ
router.get('/summary', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const filters: ExecutiveReportFilters = {
      year: parseInt(req.query.year as string) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month as string) : undefined,
      userId: req.query.userId as string,
      projectId: req.query.projectId as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const report = await reportService.getExecutiveReport(filters);
    res.json(report.summary);
  } catch (error) {
    console.error('Error fetching executive summary:', error);
    next(error);
  }
});

// GET /api/projects/executive-report/monthly/:year - ดึงข้อมูลรายเดือน
router.get('/monthly/:year', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const { year } = req.params;
    const monthlyReport = await reportService.getMonthlyReport(parseInt(year));
    res.json(monthlyReport);
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    next(error);
  }
});

// GET /api/projects/executive-report/projects - ดึงข้อมูลสรุปตามโปรเจค
router.get('/projects', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const filters: ExecutiveReportFilters = {
      year: parseInt(req.query.year as string) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month as string) : undefined,
      userId: req.query.userId as string,
      projectId: req.query.projectId as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const projectSummary = await reportService.getProjectReportSummary(filters);
    res.json(projectSummary);
  } catch (error) {
    console.error('Error fetching project summary:', error);
    next(error);
  }
});

// GET /api/projects/executive-report/employees - ดึงข้อมูลสรุปตามพนักงาน
router.get('/employees', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const filters: ExecutiveReportFilters = {
      year: parseInt(req.query.year as string) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month as string) : undefined,
      userId: req.query.userId as string,
      projectId: req.query.projectId as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const employeeSummary = await reportService.getEmployeeReportSummary(filters);
    res.json(employeeSummary);
  } catch (error) {
    console.error('Error fetching employee summary:', error);
    next(error);
  }
});

// GET /api/projects/executive-report/export - เตรียมข้อมูลสำหรับส่งออก
router.get('/export', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const filters: ExecutiveReportFilters = {
      year: parseInt(req.query.year as string) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month as string) : undefined,
      userId: req.query.userId as string,
      projectId: req.query.projectId as string,
      workType: req.query.workType as 'project' | 'office' | 'other',
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const exportData = await reportService.prepareExportData(filters);
    res.json(exportData);
  } catch (error) {
    console.error('Error preparing export data:', error);
    next(error);
  }
});

// DELETE /api/projects/executive-report/batch - ลบข้อมูลแบบหลายรายการ
router.delete('/batch', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const request: BatchDeleteRequest = req.body;

    if (!request.ids || !Array.isArray(request.ids) || request.ids.length === 0) {
      return res.status(400).json({ error: 'IDs array is required' });
    }

    const result = await reportService.batchDelete(request);
    res.json(result);
  } catch (error) {
    console.error('Error batch deleting timesheet entries:', error);
    next(error);
  }
});

// GET /api/projects/executive-report/filters - ดึงข้อมูลตัวเลือกสำหรับฟิลเตอร์
router.get('/filters', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    // สามารถเพิ่มการดึงข้อมูลตัวเลือกต่างๆ เช่น รายชื่อพนักงาน, โปรเจค, ปีที่มีข้อมูล
    res.json({
      years: [2024, 2025, 2026],
      months: [
        { value: 1, label: 'มกราคม' },
        { value: 2, label: 'กุมภาพันธ์' },
        { value: 3, label: 'มีนาคม' },
        { value: 4, label: 'เมษายน' },
        { value: 5, label: 'พฤษภาคม' },
        { value: 6, label: 'มิถุนายน' },
        { value: 7, label: 'กรกฎาคม' },
        { value: 8, label: 'สิงหาคม' },
        { value: 9, label: 'กันยายน' },
        { value: 10, label: 'ตุลาคม' },
        { value: 11, label: 'พฤศจิกายน' },
        { value: 12, label: 'ธันวาคม' },
      ],
      workTypes: [
        { value: 'project', label: 'Project' },
        { value: 'office', label: 'Office' },
        { value: 'other', label: 'Other' },
      ],
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    next(error);
  }
});

export default router;
