import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/users - Get all users with pagination
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // GET /api/users - Get all users with pagination
  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string || '';
    const role = req.query.role as string | undefined;
    const status = req.query.status as string | undefined;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
      ...(status && { status }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          phone: true,
          position: true,
          department: true,
          status: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  // POST /api/users - Create a new user
  if (req.method === 'POST') {
    validateRequest(req, ['name', 'email', 'password']);
    
    const { name, email, password, role, avatar, phone, position, department } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // In a real app, you would hash the password here
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        // password: hashedPassword,
        password, // For demo purposes only - in production, always hash passwords
        role: role || 'USER',
        avatar,
        phone,
        position,
        department,
      },
    });

    // Don't send password hash back
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({ 
      success: true, 
      data: userWithoutPassword,
      message: 'User created successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
