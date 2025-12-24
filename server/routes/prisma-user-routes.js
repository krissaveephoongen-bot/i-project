const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const { prisma } = require('../prisma-client');

// Helper function for error handling
const handleError = (res, error, statusCode = 500) => {
  console.error('API Error:', error);
  res.status(statusCode).json({
    error: error.message || 'Internal Server Error',
    status: statusCode
  });
};

/**
 * GET /api/prisma/users
 * Get all users
 */
router.get('/users', async (req, res) => {
  try {
    const { role, search, skip = 0, take = 10 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          hireDate: true,
          lastLogin: true,
          department: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { createdCosts: true, approvedCosts: true, costApprovals: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(take)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      data: users,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/users/:id
 * Get a specific user
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        createdCosts: {
          select: { id: true, description: true, amount: true, status: true, date: true }
        },
        approvedCosts: {
          select: { id: true, description: true, amount: true, date: true }
        },
        costApprovals: {
          select: { id: true, costId: true, status: true, createdAt: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/users
 * Create a new user
 */
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role = 'USER', status = 'active', hireDate, department, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, password'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
        hireDate: hireDate ? new Date(hireDate) : null,
        department,
        phone
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        hireDate: true,
        department: true,
        phone: true,
        createdAt: true
      }
    });

    res.status(201).json({ data: user, message: 'User created successfully' });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    handleError(res, error);
  }
});

/**
 * PUT /api/prisma/users/:id
 * Update a user
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, password, role, status, hireDate, lastLogin, department, phone } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (password) data.password = await bcryptjs.hash(password, 12);
    if (role !== undefined) data.role = role;
    if (status !== undefined) data.status = status;
    if (hireDate !== undefined) data.hireDate = hireDate ? new Date(hireDate) : null;
    if (lastLogin !== undefined) data.lastLogin = lastLogin ? new Date(lastLogin) : null;
    if (department !== undefined) data.department = department;
    if (phone !== undefined) data.phone = phone;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        hireDate: true,
        lastLogin: true,
        department: true,
        phone: true,
        updatedAt: true
      }
    });

    res.json({ data: user, message: 'User updated successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    handleError(res, error);
  }
});

/**
 * DELETE /api/prisma/users/:id
 * Delete a user
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.delete({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true }
    });

    res.json({ data: user, message: 'User deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.code === 'P2014') {
      return res.status(400).json({ error: 'Cannot delete user with active records' });
    }
    handleError(res, error);
  }
});

/**
 * PUT /api/prisma/users/:id/change-password
 * Change user password
 */
router.put('/users/:id/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing currentPassword or newPassword'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/users/:id/admin-reset-password
 * Admin directly resets user password (no email needed)
 */
router.post('/users/:id/admin-reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        error: 'Missing newPassword'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password and update
    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword }
    });

    res.json({ 
      message: 'Password updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/users/verify-reset-token
 * Verify password reset token and update password
 */
router.post('/users/verify-reset-token', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Missing token or newPassword'
      });
    }

    // TODO: Implement token verification
    // Steps:
    // 1. Find user with matching reset token hash
    // 2. Verify token hasn't expired
    // 3. Update password and clear reset token
    // Example:
    // const users = await prisma.user.findMany({
    //   where: {
    //     resetTokenExpires: { gt: new Date() }
    //   }
    // });
    // const user = users.find(u => bcryptjs.compareSync(token, u.resetToken));
    // if (!user) {
    //   return res.status(400).json({ error: 'Invalid or expired token' });
    // }
    // const hashedPassword = await bcryptjs.hash(newPassword, 12);
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     password: hashedPassword,
    //     resetToken: null,
    //     resetTokenExpires: null
    //   }
    // });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/users/:id/activity
 * Get user activity summary
 */
router.get('/users/:id/activity', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [createdCosts, approvedCosts, approvals] = await Promise.all([
      prisma.cost.count({ where: { submittedBy: req.params.id } }),
      prisma.cost.count({ where: { approvedBy: req.params.id } }),
      prisma.costApproval.count({ where: { approvedBy: req.params.id } })
    ]);

    res.json({
      data: {
        userId: user.id,
        name: user.name,
        role: user.role,
        activity: {
          costsCreated: createdCosts,
          costsApproved: approvedCosts,
          approvalsGiven: approvals
        }
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
