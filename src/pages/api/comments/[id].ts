import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/comments/[id] - Get a single comment by ID
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  // GET /api/comments/[id] - Get comment by ID
  if (req.method === 'GET') {
    const comment = await prisma.comment.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            position: true,
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
            status: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    return res.status(200).json({ success: true, data: comment });
  }

  // PUT /api/comments/[id] - Update a comment
  if (req.method === 'PUT') {
    const { content, attachments } = req.body;

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id: id as string },
    });

    if (!existingComment) {
      throw new ApiError(404, 'Comment not found');
    }

    // Only allow the comment author to update the comment
    if (existingComment.userId !== req.body.userId) {
      throw new ApiError(403, 'You are not authorized to update this comment');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: id as string },
      data: {
        ...(content && { content }),
        ...(attachments !== undefined && { attachments }),
        edited: true,
        editedAt: new Date(),
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
        parent: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return res.status(200).json({ 
      success: true, 
      data: updatedComment,
      message: 'Comment updated successfully' 
    });
  }

  // DELETE /api/comments/[id] - Delete a comment
  if (req.method === 'DELETE') {
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: id as string },
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    // Only allow the comment author or an admin to delete the comment
    if (comment.userId !== req.body.userId && req.body.userRole !== 'ADMIN') {
      throw new ApiError(403, 'You are not authorized to delete this comment');
    }

    // If the comment has replies, mark it as deleted instead of removing it
    if (comment._count.replies > 0) {
      await prisma.comment.update({
        where: { id: id as string },
        data: {
          content: '[This comment has been deleted]',
          attachments: [],
          deleted: true,
          deletedAt: new Date(),
        },
      });
    } else {
      // If no replies, delete the comment
      await prisma.comment.delete({
        where: { id: id as string },
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Comment deleted successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
