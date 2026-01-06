import express from 'express';
import { db } from '../lib/db.js';
import { users, projects, tasks } from '../lib/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';

const router = express.Router();

// GET /api/resources - Get all resources with capacities
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: users.department,
      position: users.position,
      hourlyRate: users.hourlyRate,
    }).from(users).where(eq(users.isActive, true));

    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// GET /api/resources/:userId/capacity - Get resource capacity
router.get('/:userId/capacity', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.select({
      id: users.id,
      name: users.name,
      hourlyRate: users.hourlyRate,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user[0].id,
      userName: user[0].name,
      totalCapacity: 40, // Default 40 hours/week
      allocatedCapacity: 0, // TODO: Calculate from tasks
      availableCapacity: (user[0].capacity || 40) - 0,
    });
  } catch (error) {
    console.error('Error fetching resource capacity:', error);
    res.status(500).json({ error: 'Failed to fetch resource capacity' });
  }
});

// PUT /api/resources/:userId/capacity - Update resource capacity
router.put('/:userId/capacity', async (req, res) => {
  try {
    const { userId } = req.params;
    const { totalCapacity } = req.body;

    // Note: capacity is not stored in users table, using default calculation
    const result = await db.select({
      id: users.id,
      name: users.name,
      hourlyRate: users.hourlyRate,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: result[0].id,
      userName: result[0].name,
      totalCapacity: totalCapacity || 40,
      allocatedCapacity: 0,
      availableCapacity: (totalCapacity || 40) - 0,
    });
  } catch (error) {
    console.error('Error updating resource capacity:', error);
    res.status(500).json({ error: 'Failed to update resource capacity' });
  }
});

// POST /api/resources/:userId/allocate - Allocate resource to project
router.post('/:userId/allocate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectId, hoursPerWeek, startDate, endDate } = req.body;

    // TODO: Implement allocation logic
    // For now, just return success
    const user = await db.select({
      id: users.id,
      name: users.name,
      hourlyRate: users.hourlyRate,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user[0].id,
      userName: user[0].name,
      totalCapacity: 40,
      allocatedCapacity: hoursPerWeek || 0,
      availableCapacity: (user[0].capacity || 40) - (hoursPerWeek || 0),
    });
  } catch (error) {
    console.error('Error allocating resource:', error);
    res.status(500).json({ error: 'Failed to allocate resource' });
  }
});

// POST /api/resources/:userId/deallocate - Deallocate resource from project
router.post('/:userId/deallocate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectId } = req.body;

    // TODO: Implement deallocation logic
    const user = await db.select({
      id: users.id,
      name: users.name,
      hourlyRate: users.hourlyRate,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user[0].id,
      userName: user[0].name,
      totalCapacity: 40,
      allocatedCapacity: 0,
      availableCapacity: user[0].capacity || 40,
    });
  } catch (error) {
    console.error('Error deallocating resource:', error);
    res.status(500).json({ error: 'Failed to deallocate resource' });
  }
});

export default router;