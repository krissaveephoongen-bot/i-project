import express from 'express';
import { WeeklySummaryService } from '../services/weekly-summary.service.js';
import type {
  WeeklySummaryFilters,
  WeeklyComparison,
  WeeklyExportData
} from '../types/weekly-summary';

const router = express.Router();
const weeklySummaryService = new WeeklySummaryService();

// GET /api/projects/weekly-summary - ดึงข้อมูลสรุปรายสัปดาห์
router.get('/', async (req, res) => {
  try {
    const filters: WeeklySummaryFilters = {
      weekStart: req.query.weekStart as string,
      weekEnd: req.query.weekEnd as string,
      year: req.query.year ? parseInt(req.query.year as string) : undefined,
      weekNumber: req.query.weekNumber ? parseInt(req.query.weekNumber as string) : undefined,
      userId: req.query.userId as string,
      department: req.query.department as string,
      role: req.query.role as string,
    };

    const weeklySummary = await weeklySummaryService.getWeeklySummary(filters);
    res.json(weeklySummary);
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ error: 'Failed to fetch weekly summary' });
  }
});

// GET /api/projects/weekly-summary/current - ดึงข้อมูลสรุปสัปดาห์ปัจจุบัน
router.get('/current', async (req, res) => {
  try {
    const weeklySummary = await weeklySummaryService.getWeeklySummary();
    res.json(weeklySummary);
  } catch (error) {
    console.error('Error fetching current weekly summary:', error);
    res.status(500).json({ error: 'Failed to fetch current weekly summary' });
  }
});

// GET /api/projects/weekly-summary/week/:year/:weekNumber - ดึงข้อมูลสรุปตามสัปดาห์ที่ระบุ
router.get('/week/:year/:weekNumber', async (req, res) => {
  try {
    const { year, weekNumber } = req.params;
    const userId = req.query.userId as string;

    const weeklySummary = await weeklySummaryService.getWeeklySummary({
      year: parseInt(year),
      weekNumber: parseInt(weekNumber),
      userId,
    });
    res.json(weeklySummary);
  } catch (error) {
    console.error('Error fetching weekly summary by week:', error);
    res.status(500).json({ error: 'Failed to fetch weekly summary by week' });
  }
});

// GET /api/projects/weekly-summary/daily/:weekStart/:weekEnd - ดึงข้อมูลสรุปรายวัน
router.get('/daily/:weekStart/:weekEnd', async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.params;
    
    const dailySummary = await weeklySummaryService.getDailySummary(
      new Date(weekStart),
      new Date(weekEnd)
    );
    res.json(dailySummary);
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
});

// GET /api/projects/weekly-summary/compare/:weekStart - เปรียบเทียบสัปดาห์ปัจจุบันกับสัปดาห์ที่แล้ว
router.get('/compare/:weekStart', async (req, res) => {
  try {
    const { weekStart } = req.params;
    
    const comparison = await weeklySummaryService.compareWeeks(new Date(weekStart));
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing weeks:', error);
    res.status(500).json({ error: 'Failed to compare weeks' });
  }
});

// GET /api/projects/weekly-summary/trends/:year - ดึงข้อมูลแนวโน้มรายสัปดาห์
router.get('/trends/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const weeks = req.query.weeks ? parseInt(req.query.weeks as string) : 12;
    
    const trends = await weeklySummaryService.getWeeklyTrends(parseInt(year), weeks);
    res.json(trends);
  } catch (error) {
    console.error('Error fetching weekly trends:', error);
    res.status(500).json({ error: 'Failed to fetch weekly trends' });
  }
});

// GET /api/projects/weekly-summary/export - เตรียมข้อมูลสำหรับส่งออก
router.get('/export', async (req, res) => {
  try {
    const filters: WeeklySummaryFilters = {
      weekStart: req.query.weekStart as string,
      weekEnd: req.query.weekEnd as string,
      year: req.query.year ? parseInt(req.query.year as string) : undefined,
      weekNumber: req.query.weekNumber ? parseInt(req.query.weekNumber as string) : undefined,
      userId: req.query.userId as string,
      department: req.query.department as string,
      role: req.query.role as string,
    };

    const exportData = await weeklySummaryService.prepareExportData(filters);
    res.json(exportData);
  } catch (error) {
    console.error('Error preparing export data:', error);
    res.status(500).json({ error: 'Failed to prepare export data' });
  }
});

// GET /api/projects/weekly-summary/available-weeks/:year - ดึงข้อมูลสัปดาห์ที่มีข้อมูล
router.get('/available-weeks/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    const availableWeeks = await weeklySummaryService.getAvailableWeeks(parseInt(year));
    res.json(availableWeeks);
  } catch (error) {
    console.error('Error fetching available weeks:', error);
    res.status(500).json({ error: 'Failed to fetch available weeks' });
  }
});

// GET /api/projects/weekly-summary/employee/:userId - ดึงข้อมูลสรุปตามพนักงาน
router.get('/employee/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const filters: WeeklySummaryFilters = {
      userId,
      weekStart: req.query.weekStart as string,
      weekEnd: req.query.weekEnd as string,
      year: req.query.year ? parseInt(req.query.year as string) : undefined,
      weekNumber: req.query.weekNumber ? parseInt(req.query.weekNumber as string) : undefined,
    };

    const weeklySummary = await weeklySummaryService.getWeeklySummary(filters);
    res.json(weeklySummary);
  } catch (error) {
    console.error('Error fetching employee weekly summary:', error);
    res.status(500).json({ error: 'Failed to fetch employee weekly summary' });
  }
});

// GET /api/projects/weekly-summary/filters - ดึงข้อมูลตัวเลือกสำหรับฟิลเตอร์
router.get('/filters', async (req, res) => {
  try {
    // สามารถเพิ่มการดึงข้อมูลตัวเลือกต่างๆ เช่น รายชื่อพนักงาน, แผนก, ตำแหน่ง
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    
    res.json({
      years: years.map(year => ({ value: year, label: year.toString() })),
      maxWeekNumber: 52,
      departments: [
        { value: 'IT', label: 'IT' },
        { value: 'PM', label: 'Project Management' },
        { value: 'HR', label: 'Human Resources' },
        { value: 'Finance', label: 'Finance' },
      ],
      roles: [
        { value: 'admin', label: 'Administrator' },
        { value: 'manager', label: 'PM' },
        { value: 'employee', label: 'Employee' },
        { value: 'project_coordinator', label: 'Project Coordinator' },
        { value: 'vp_pm', label: 'VP PM' },
      ],
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

export default router;
