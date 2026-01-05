import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/projects - Get all projects with pagination and filtering
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // GET /api/projects - Get all projects with pagination
  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string || '';
    const status = req.query.status as string | undefined;
    const clientId = req.query.clientId as string | undefined;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          projectManager: {
            select: {
              id: true,
              managerRole: true,
              status: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
              timesheets: true,
              timeLogs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  // POST /api/projects - Create a new project
  if (req.method === 'POST') {
    validateRequest(req, ['name', 'code', 'startDate']);
    
    const {
      name,
      code,
      description,
      startDate,
      endDate,
      budget,
      actualCost,
      estimatedHours,
      status = 'PLANNING',
      priority = 'medium',
      clientId,
      projectManagerId,
      tags = [],
      progress = 0,
    } = req.body;

    // Check if project with same code already exists
    const existingProject = await prisma.project.findUnique({
      where: { code },
    });

    if (existingProject) {
      throw new ApiError(400, 'Project with this code already exists');
    }

    const project = await prisma.project.create({
      data: {
        name,
        code,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        budget,
        actualCost,
        estimatedHours,
        status,
        priority,
        clientId,
        projectManagerId,
        tags,
        progress,
      },
      include: {
        client: true,
        projectManager: {
          select: {
            id: true,
            managerRole: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({ 
      success: true, 
      data: project,
      message: 'Project created successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
