const express = require('express');
const { authenticateToken } = require('./middleware/auth-middleware');
const { checkPermission } = require('./middleware/permissions-middleware');
const { prisma } = require('./prisma-client');

const router = express.Router();

// GET /api/project-managers - List all project managers
router.get('/', authenticateToken, checkPermission('project-managers:read'), async (req, res) => {
  try {
    const projectManagers = await prisma.projectManager.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            lastLogin: true,
            createdAt: true,
          }
        },
        projectAssignments: {
          where: { status: 'active' },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to match frontend expectations
    const transformedData = projectManagers.map(pm => ({
      id: pm.id,
      name: pm.user.name,
      email: pm.user.email,
      role: pm.managerRole,
      status: pm.status,
      projectsManaged: pm.projectAssignments.length,
      joinDate: pm.joinDate.toISOString().split('T')[0],
      lastActive: pm.lastActive.toISOString().split('T')[0],
      userId: pm.userId,
      department: pm.department,
      phone: pm.phone,
      isAvailable: pm.isAvailable,
      maxProjects: pm.maxProjects,
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching project managers:', error);
    res.status(500).json({ error: 'Failed to fetch project managers' });
  }
});

// GET /api/project-managers/:id - Get project manager details
router.get('/:id', authenticateToken, checkPermission('project-managers:read'), async (req, res) => {
  try {
    const { id } = req.params;

    const projectManager = await prisma.projectManager.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            lastLogin: true,
            createdAt: true,
          }
        },
        projectAssignments: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                code: true,
                status: true,
                startDate: true,
                endDate: true,
              }
            }
          }
        }
      }
    });

    if (!projectManager) {
      return res.status(404).json({ error: 'Project manager not found' });
    }

    const transformedData = {
      id: projectManager.id,
      name: projectManager.user.name,
      email: projectManager.user.email,
      role: projectManager.managerRole,
      status: projectManager.status,
      projectsManaged: projectManager.projectAssignments.length,
      joinDate: projectManager.joinDate.toISOString().split('T')[0],
      lastActive: projectManager.lastActive.toISOString().split('T')[0],
      userId: projectManager.userId,
      department: projectManager.department,
      phone: projectManager.phone,
      isAvailable: projectManager.isAvailable,
      maxProjects: projectManager.maxProjects,
      projects: projectManager.projectAssignments.map(pa => ({
        id: pa.project.id,
        name: pa.project.name,
        code: pa.project.code,
        status: pa.project.status,
        startDate: pa.startDate.toISOString().split('T')[0],
        endDate: pa.endDate?.toISOString().split('T')[0],
        role: pa.role,
      }))
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching project manager:', error);
    res.status(500).json({ error: 'Failed to fetch project manager' });
  }
});

// POST /api/project-managers - Create new project manager
router.post('/', authenticateToken, checkPermission('project-managers:create'), async (req, res) => {
  try {
    const { name, email, role, department, phone, maxProjects = 5 } = req.body;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user with PROJECT_MANAGER role
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: '$2b$10$dummy.hash.for.now', // This should be set properly via password reset
          role: 'PROJECT_MANAGER',
          status: 'active',
        }
      });
    } else {
      // Update existing user to PROJECT_MANAGER role
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'PROJECT_MANAGER',
          status: 'active',
        }
      });
    }

    // Check if project manager record already exists
    const existingPM = await prisma.projectManager.findUnique({
      where: { userId: user.id }
    });

    if (existingPM) {
      return res.status(400).json({ error: 'User is already a project manager' });
    }

    // Create project manager record
    const projectManager = await prisma.projectManager.create({
      data: {
        userId: user.id,
        managerRole: role,
        department,
        phone,
        maxProjects: parseInt(maxProjects),
        status: 'active',
        isAvailable: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          }
        }
      }
    });

    const transformedData = {
      id: projectManager.id,
      name: projectManager.user.name,
      email: projectManager.user.email,
      role: projectManager.managerRole,
      status: projectManager.status,
      projectsManaged: 0,
      joinDate: projectManager.joinDate.toISOString().split('T')[0],
      lastActive: projectManager.lastActive.toISOString().split('T')[0],
      userId: projectManager.userId,
      department: projectManager.department,
      phone: projectManager.phone,
      isAvailable: projectManager.isAvailable,
      maxProjects: projectManager.maxProjects,
    };

    res.status(201).json(transformedData);
  } catch (error) {
    console.error('Error creating project manager:', error);
    res.status(500).json({ error: 'Failed to create project manager' });
  }
});

// PUT /api/project-managers/:id - Update project manager
router.put('/:id', authenticateToken, checkPermission('project-managers:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, department, phone, isAvailable, maxProjects } = req.body;

    // Get current project manager
    const currentPM = await prisma.projectManager.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!currentPM) {
      return res.status(404).json({ error: 'Project manager not found' });
    }

    // Update user data if provided
    if (name || email) {
      await prisma.user.update({
        where: { id: currentPM.userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        }
      });
    }

    // Update project manager data
    const projectManager = await prisma.projectManager.update({
      where: { id },
      data: {
        ...(role && { managerRole: role }),
        ...(status && { status }),
        ...(department !== undefined && { department }),
        ...(phone !== undefined && { phone }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(maxProjects && { maxProjects: parseInt(maxProjects) }),
        lastActive: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          }
        },
        projectAssignments: {
          where: { status: 'active' },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              }
            }
          }
        }
      }
    });

    const transformedData = {
      id: projectManager.id,
      name: projectManager.user.name,
      email: projectManager.user.email,
      role: projectManager.managerRole,
      status: projectManager.status,
      projectsManaged: projectManager.projectAssignments.length,
      joinDate: projectManager.joinDate.toISOString().split('T')[0],
      lastActive: projectManager.lastActive.toISOString().split('T')[0],
      userId: projectManager.userId,
      department: projectManager.department,
      phone: projectManager.phone,
      isAvailable: projectManager.isAvailable,
      maxProjects: projectManager.maxProjects,
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Error updating project manager:', error);
    res.status(500).json({ error: 'Failed to update project manager' });
  }
});

// DELETE /api/project-managers/:id - Delete project manager
router.delete('/:id', authenticateToken, checkPermission('project-managers:delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get project manager to find userId
    const projectManager = await prisma.projectManager.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!projectManager) {
      return res.status(404).json({ error: 'Project manager not found' });
    }

    // Check if project manager has active assignments
    const activeAssignments = await prisma.projectManagerAssignment.findMany({
      where: {
        projectManagerId: id,
        status: 'active'
      }
    });

    if (activeAssignments.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete project manager with active project assignments. Please reassign projects first.'
      });
    }

    // Delete project manager record (this will cascade to assignments)
    await prisma.projectManager.delete({
      where: { id }
    });

    // Optionally, you might want to change the user's role back to USER
    // But for now, we'll keep them as PROJECT_MANAGER in case they get reassigned

    res.json({ message: 'Project manager deleted successfully' });
  } catch (error) {
    console.error('Error deleting project manager:', error);
    res.status(500).json({ error: 'Failed to delete project manager' });
  }
});

// GET /api/project-managers/:id/projects - Get manager's projects
router.get('/:id/projects', authenticateToken, checkPermission('project-managers:read'), async (req, res) => {
  try {
    const { id } = req.params;

    const assignments = await prisma.projectManagerAssignment.findMany({
      where: { projectManagerId: id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            startDate: true,
            endDate: true,
            budget: true,
            progress: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const projects = assignments.map(assignment => ({
      id: assignment.project.id,
      name: assignment.project.name,
      code: assignment.project.code,
      status: assignment.project.status,
      startDate: assignment.project.startDate.toISOString().split('T')[0],
      endDate: assignment.project.endDate?.toISOString().split('T')[0],
      budget: assignment.project.budget,
      progress: assignment.project.progress,
      role: assignment.role,
      assignmentStatus: assignment.status,
    }));

    res.json(projects);
  } catch (error) {
    console.error('Error fetching manager projects:', error);
    res.status(500).json({ error: 'Failed to fetch manager projects' });
  }
});

module.exports = router;