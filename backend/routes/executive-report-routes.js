import express from 'express';
import { ExecutiveReportService } from '../src/features/projects/services/executive-report.service.js';

const router = express.Router();
const reportService = new ExecutiveReportService();

// GET /api/projects/executive-report - ดึงข้อมูลรายงานเชิงบริหาร
router.get('/', async (req, res) => {
  try {
    const filters = {
      year: parseInt(req.query.year) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month) : undefined,
      userId: req.query.userId,
      projectId: req.query.projectId,
      workType: req.query.workType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const report = await reportService.getExecutiveReport(filters);
    res.json(report);
  } catch (error) {
    console.error('Error fetching executive report:', error);
    res.status(500).json({ error: 'Failed to fetch executive report' });
  }
});

// GET /api/projects/executive-report/summary - ดึงข้อมูลสรุปเฉพาะ
router.get('/summary', async (req, res) => {
  try {
    const filters = {
      year: parseInt(req.query.year) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month) : undefined,
      userId: req.query.userId,
      projectId: req.query.projectId,
      workType: req.query.workType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const report = await reportService.getExecutiveReport(filters);
    res.json(report.summary);
  } catch (error) {
    console.error('Error fetching executive summary:', error);
    res.status(500).json({ error: 'Failed to fetch executive summary' });
  }
});

// GET /api/projects/executive-report/monthly/:year - ดึงข้อมูลรายเดือน
router.get('/monthly/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const monthlyReport = await reportService.getMonthlyReport(parseInt(year));
    res.json(monthlyReport);
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
});

// GET /api/projects/executive-report/projects - ดึงข้อมูลสรุปตามโปรเจค
router.get('/projects', async (req, res) => {
  try {
    const filters = {
      year: parseInt(req.query.year) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month) : undefined,
      userId: req.query.userId,
      projectId: req.query.projectId,
      workType: req.query.workType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const projectSummary = await reportService.getProjectReportSummary(filters);
    res.json(projectSummary);
  } catch (error) {
    console.error('Error fetching project summary:', error);
    res.status(500).json({ error: 'Failed to fetch project summary' });
  }
});

// GET /api/projects/executive-report/employees - ดึงข้อมูลสรุปตามพนักงาน
router.get('/employees', async (req, res) => {
  try {
    const filters = {
      year: parseInt(req.query.year) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month) : undefined,
      userId: req.query.userId,
      projectId: req.query.projectId,
      workType: req.query.workType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const employeeSummary = await reportService.getEmployeeReportSummary(filters);
    res.json(employeeSummary);
  } catch (error) {
    console.error('Error fetching employee summary:', error);
    res.status(500).json({ error: 'Failed to fetch employee summary' });
  }
});

// GET /api/projects/executive-report/export - เตรียมข้อมูลสำหรับส่งออก
router.get('/export', async (req, res) => {
  try {
    const filters = {
      year: parseInt(req.query.year) || new Date().getFullYear(),
      month: req.query.month ? parseInt(req.query.month) : undefined,
      userId: req.query.userId,
      projectId: req.query.projectId,
      workType: req.query.workType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const exportData = await reportService.prepareExportData(filters);
    res.json(exportData);
  } catch (error) {
    console.error('Error preparing export data:', error);
    res.status(500).json({ error: 'Failed to prepare export data' });
  }
});

// DELETE /api/projects/executive-report/batch - ลบข้อมูลแบบหลายรายการ
router.delete('/batch', async (req, res) => {
  try {
    const request = req.body;

    if (!request.ids || !Array.isArray(request.ids) || request.ids.length === 0) {
      return res.status(400).json({ error: 'IDs array is required' });
    }

    const result = await reportService.batchDelete(request);
    res.json(result);
  } catch (error) {
    console.error('Error batch deleting timesheet entries:', error);
    res.status(500).json({ error: 'Failed to batch delete timesheet entries' });
  }
});

// GET /api/projects/executive-report/filters - ดึงข้อมูลตัวเลือกสำหรับฟิลเตอร์
router.get('/filters', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

export default router;
