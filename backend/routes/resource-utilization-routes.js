import express from 'express';
import { db } from '../lib/db.js';
import { users, tasks, projects } from '../lib/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';

const router = express.Router();

// GET /api/resource-utilization - Get resource utilization
router.get('/', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      // Return empty structure instead of error for frontend compatibility
      return res.json({
        userId: null,
        period: null,
        totalCapacity: 0,
        allocatedHours: 0,
        utilizedHours: 0,
        utilizationPercentage: 0,
        tasks: [],
        message: 'Please provide userId, startDate, and endDate parameters'
      });
    }

    // TODO: Implement actual utilization calculation
    // For now, return mock data
    res.json({
      userId,
      period: { startDate, endDate },
      totalCapacity: 40,
      allocatedHours: 32,
      utilizedHours: 28,
      utilizationPercentage: 70,
      tasks: [
        {
          id: 1,
          title: 'Task 1',
          projectName: 'Project A',
          allocatedHours: 16,
          actualHours: 14,
        },
        {
          id: 2,
          title: 'Task 2',
          projectName: 'Project B',
          allocatedHours: 16,
          actualHours: 14,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching resource utilization:', error);
    res.status(500).json({ error: 'Failed to fetch resource utilization' });
  }
});

export default router;