import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError } from '@/lib/api-utils';

// GET /api/users/[id] - Get a single user by ID
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { id } = req.query;
    
    const user = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        position: true,
        department: true,
        hireDate: true,
        status: true,
        lastLogin: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return res.status(200).json({ success: true, data: user });
  }

  // PUT /api/users/[id] - Update a user
  if (req.method === 'PUT') {
    const { id } = req.query;
    const { name, email, role, avatar, phone, position, department, status } = req.body;

    const user = await prisma.user.update({
      where: { id: id as string },
      data: {
        name,
        email,
        role,
        avatar,
        phone,
        position,
        department,
        status,
      },
    });

    return res.status(200).json({ success: true, data: user });
  }

  // DELETE /api/users/[id] - Delete a user
  if (req.method === 'DELETE') {
    const { id } = req.query;

    await prisma.user.delete({
      where: { id: id as string },
    });

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
