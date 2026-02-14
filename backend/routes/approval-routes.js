// backend/routes/approval-routes.js
import express from 'express';
import { db } from '../lib/db.js';
import {
  approvalRequests,
  approvalActions,
  approvalWorkflows,
  users,
  projects,
  timeEntries,
  expenses
} from '../lib/schema.js';
import { eq, and, desc, asc, isNull } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment - MUST be set
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET not configured. Set it in .env file.');
  }
  if (secret.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be at least 32 characters.');
  }
  return secret;
}

const router = express.Router();

// Middleware to check if user has approval permissions
const checkApprovalPermissions = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());
    
    // Only managers and admins can access approval system
    if (decoded.role !== 'manager' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get pending approvals
router.get('/pending', checkApprovalPermissions, async (req, res) => {
  try {
    const { type, priority } = req.query;
    
    let whereConditions = [eq(approvalRequests.status, 'pending')];
    
    if (type) {
      whereConditions.push(eq(approvalRequests.type, type));
    }
    
    if (priority) {
      whereConditions.push(eq(approvalRequests.priority, priority));
    }

    const pendingApprovals = await db.select({
      requestId: approvalRequests.id,
      type: approvalRequests.type,
      title: approvalRequests.title,
      description: approvalRequests.description,
      requestedBy: approvalRequests.requestedBy,
      requestedAt: approvalRequests.requestedAt,
      status: approvalRequests.status,
      priority: approvalRequests.priority,
      amount: approvalRequests.amount,
      currency: approvalRequests.currency,
      projectId: approvalRequests.projectId,
      metadata: approvalRequests.metadata,
      requestedByName: users.name,
      requestedByEmail: users.email,
      projectName: projects.name,
      createdAt: approvalRequests.createdAt
    })
    .from(approvalRequests)
    .leftJoin(users, eq(approvalRequests.requestedBy, users.id))
    .leftJoin(projects, eq(approvalRequests.projectId, projects.id))
    .where(and(...whereConditions))
    .orderBy(desc(approvalRequests.priority), desc(approvalRequests.requestedAt));

    res.json(pendingApprovals);

  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approval history
router.get('/history', checkApprovalPermissions, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const approvalHistory = await db.select({
      requestId: approvalRequests.id,
      type: approvalRequests.type,
      title: approvalRequests.title,
      description: approvalRequests.description,
      requestedBy: approvalRequests.requestedBy,
      requestedAt: approvalRequests.requestedAt,
      status: approvalRequests.status,
      priority: approvalRequests.priority,
      amount: approvalRequests.amount,
      currency: approvalRequests.currency,
      projectId: approvalRequests.projectId,
      requestedByName: users.name,
      requestedByEmail: users.email,
      projectName: projects.name,
      createdAt: approvalRequests.createdAt
    })
    .from(approvalRequests)
    .leftJoin(users, eq(approvalRequests.requestedBy, users.id))
    .leftJoin(projects, eq(approvalRequests.projectId, projects.id))
    .where(eq(approvalRequests.status, 'approved'))
    .orderBy(desc(approvalRequests.requestedAt))
    .limit(parseInt(limit))
    .offset(parseInt(offset));

    res.json(approvalHistory);

  } catch (error) {
    console.error('Get approval history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approval statistics
router.get('/stats', checkApprovalPermissions, async (req, res) => {
  try {
    const stats = await db.select({
      type: approvalRequests.type,
      status: approvalRequests.status,
      count: approvalRequests.id,
      totalAmount: approvalRequests.amount
    })
    .from(approvalRequests)
    .groupBy(approvalRequests.type, approvalRequests.status);

    // Get pending count by priority
    const priorityStats = await db.select({
      priority: approvalRequests.priority,
      count: approvalRequests.id
    })
    .from(approvalRequests)
    .where(eq(approvalRequests.status, 'pending'))
    .groupBy(approvalRequests.priority);

    // Get recent approvals
    const recentApprovals = await db.select({
      requestId: approvalRequests.id,
      type: approvalRequests.type,
      title: approvalRequests.title,
      status: approvalRequests.status,
      requestedAt: approvalRequests.requestedAt,
      requestedByName: users.name
    })
    .from(approvalRequests)
    .leftJoin(users, eq(approvalRequests.requestedBy, users.id))
    .orderBy(desc(approvalRequests.requestedAt))
    .limit(5);

    res.json({
      stats,
      priorityStats,
      recentApprovals
    });

  } catch (error) {
    console.error('Get approval stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve request
router.post('/:requestId/approve', checkApprovalPermissions, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { comments } = req.body;
    const approverId = req.user.userId;

    // Check if request exists and is pending
    const request = await db.select()
      .from(approvalRequests)
      .where(eq(approvalRequests.id, requestId))
      .limit(1);

    if (request.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    const approvalRequest = request[0];
    if (approvalRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Update request status
      await tx.update(approvalRequests)
        .set({ 
          status: 'approved',
          updatedAt: new Date()
        })
        .where(eq(approvalRequests.id, requestId));

      // Add approval action
      await tx.insert(approvalActions).values({
        requestId,
        actionBy: approverId,
        action: 'approve',
        comments,
        actionAt: new Date()
      });

      // Update the original item based on type
      if (approvalRequest.type === 'timesheet') {
        await tx.update(timeEntries)
          .set({ status: 'approved' })
          .where(eq(timeEntries.id, approvalRequest.requestId));
      } else if (approvalRequest.type === 'expense') {
        await tx.update(expenses)
          .set({ status: 'approved' })
          .where(eq(expenses.id, approvalRequest.requestId));
      }
    });

    res.json({ message: 'Request approved successfully' });

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject request
router.post('/:requestId/reject', checkApprovalPermissions, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { comments } = req.body;
    const approverId = req.user.userId;

    if (!comments || comments.trim() === '') {
      return res.status(400).json({ error: 'Comments are required for rejection' });
    }

    // Check if request exists and is pending
    const request = await db.select()
      .from(approvalRequests)
      .where(eq(approvalRequests.id, requestId))
      .limit(1);

    if (request.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    const approvalRequest = request[0];
    if (approvalRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Update request status
      await tx.update(approvalRequests)
        .set({ 
          status: 'rejected',
          updatedAt: new Date()
        })
        .where(eq(approvalRequests.id, requestId));

      // Add rejection action
      await tx.insert(approvalActions).values({
        requestId,
        actionBy: approverId,
        action: 'reject',
        comments,
        actionAt: new Date()
      });

      // Update the original item based on type
      if (approvalRequest.type === 'timesheet') {
        await tx.update(timeEntries)
          .set({ status: 'rejected' })
          .where(eq(timeEntries.id, approvalRequest.requestId));
      } else if (approvalRequest.type === 'expense') {
        await tx.update(expenses)
          .set({ status: 'rejected' })
          .where(eq(expenses.id, approvalRequest.requestId));
      }
    });

    res.json({ message: 'Request rejected successfully' });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approval details
router.get('/:requestId', checkApprovalPermissions, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await db.select({
      requestId: approvalRequests.id,
      type: approvalRequests.type,
      title: approvalRequests.title,
      description: approvalRequests.description,
      requestedBy: approvalRequests.requestedBy,
      requestedAt: approvalRequests.requestedAt,
      status: approvalRequests.status,
      priority: approvalRequests.priority,
      amount: approvalRequests.amount,
      currency: approvalRequests.currency,
      projectId: approvalRequests.projectId,
      metadata: approvalRequests.metadata,
      requestedByName: users.name,
      requestedByEmail: users.email,
      requestedByPosition: users.position,
      projectName: projects.name,
      createdAt: approvalRequests.createdAt,
      updatedAt: approvalRequests.updatedAt
    })
    .from(approvalRequests)
    .leftJoin(users, eq(approvalRequests.requestedBy, users.id))
    .leftJoin(projects, eq(approvalRequests.projectId, projects.id))
    .where(eq(approvalRequests.id, requestId))
    .limit(1);

    if (request.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    // Get approval actions history
    const actions = await db.select({
      actionId: approvalActions.id,
      action: approvalActions.action,
      comments: approvalActions.comments,
      actionAt: approvalActions.actionAt,
      actionByName: users.name,
      actionByPosition: users.position
    })
    .from(approvalActions)
    .leftJoin(users, eq(approvalActions.actionBy, users.id))
    .where(eq(approvalActions.requestId, requestId))
    .orderBy(asc(approvalActions.actionAt));

    res.json({
      ...request[0],
      actions
    });

  } catch (error) {
    console.error('Get approval details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

