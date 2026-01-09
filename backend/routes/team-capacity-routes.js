import express from 'express';
import { db } from '../lib/db.js';
import { users, projects, tasks } from '../lib/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';

const router = express.Router();

// GET /api/team-capacity - Get team capacity for a project
router.get('/', async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;

    if (!projectId || !startDate || !endDate) {
      // Return empty structure instead of error for frontend compatibility
      return res.json({
        projectId: null,
        period: null,
        teamMembers: [],
        totalTeamCapacity: 0,
        totalAllocatedHours: 0,
        totalAvailableHours: 0,
        message: 'Please provide projectId, startDate, and endDate parameters'
      });
    }

    // TODO: Implement actual team capacity calculation
    // For now, return mock data
    res.json({
      projectId,
      period: { startDate, endDate },
      teamMembers: [
        {
          userId: '1',
          userName: 'John Doe',
          totalCapacity: 40,
          allocatedHours: 32,
          availableHours: 8,
        },
        {
          userId: '2',
          userName: 'Jane Smith',
          totalCapacity: 40,
          allocatedHours: 24,
          availableHours: 16,
        },
      ],
      totalTeamCapacity: 80,
      totalAllocatedHours: 56,
      totalAvailableHours: 24,
    });
  } catch (error) {
    console.error('Error fetching team capacity:', error);
    res.status(500).json({ error: 'Failed to fetch team capacity' });
  }
});

export default router;