import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/notifications/[id] - Get a single notification by ID
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  // GET /api/notifications/[id] - Get notification by ID
  if (req.method === 'GET') {
    const notification = await prisma.notification.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    // Mark as read when fetched individually
    if (!notification.read) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { 
          read: true,
          readAt: new Date() 
        },
      });
      
      // Return the updated notification
      notification.read = true;
      notification.readAt = new Date();
    }

    return res.status(200).json({ success: true, data: notification });
  }

  // PATCH /api/notifications/[id] - Mark notification as read/unread
  if (req.method === 'PATCH') {
    validateRequest(req, ['read']);
    
    const { read } = req.body;
    const userId = req.query.userId as string;

    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: id as string },
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'You are not authorized to update this notification');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: id as string },
      data: { 
        read,
        ...(read && !notification.readAt ? { readAt: new Date() } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.status(200).json({ 
      success: true, 
      data: updatedNotification,
      message: `Notification marked as ${read ? 'read' : 'unread'}` 
    });
  }

  // DELETE /api/notifications/[id] - Delete a notification
  if (req.method === 'DELETE') {
    const userId = req.query.userId as string;

    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: id as string },
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'You are not authorized to delete this notification');
    }

    await prisma.notification.delete({
      where: { id: id as string },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
