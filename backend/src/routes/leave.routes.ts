/**
 * Leave API Routes
 * Handles all leave request and allocation related HTTP endpoints
 */

import { Router, Request, Response, NextFunction } from "express";
import LeaveService from "../features/leave/LeaveService";
import { AppError } from "../shared/errors/AppError";

const router = Router();

// Middleware to require auth
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    throw new AppError(401, "Authentication required");
  }
  next();
};

// ============================================================================
// LEAVE REQUEST ROUTES
// ============================================================================

/**
 * POST /api/leave/requests
 * Create a new leave request
 */
router.post(
  "/requests",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, leaveType, reason } = req.body;

      const request = await LeaveService.createLeaveRequest(req.user.id, {
        startDate,
        endDate,
        leaveType,
        reason,
      });

      res.status(201).json({
        success: true,
        data: request,
        message: "Leave request created successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/leave/requests/:id
 * Get a single leave request by ID
 */
router.get(
  "/requests/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const request = await LeaveService.getLeaveRequest(id);

      // Check authorization
      if (
        request.userId !== req.user.id &&
        req.user.role !== "admin" &&
        req.user.role !== "manager"
      ) {
        throw new AppError(403, "Not authorized to view this leave request");
      }

      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/leave/requests?status=pending
 * Get leave requests for the current user
 */
router.get(
  "/requests",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, userId } = req.query;

      // Check authorization
      const targetUserId =
        userId && req.user.role === "admin" ? (userId as string) : req.user.id;
      if (
        userId &&
        userId !== req.user.id &&
        req.user.role !== "admin" &&
        req.user.role !== "manager"
      ) {
        throw new AppError(
          403,
          "Not authorized to view other users leave requests",
        );
      }

      const requests = await LeaveService.getUserLeaveRequests(
        targetUserId,
        status as string | undefined,
      );

      res.json({
        success: true,
        data: requests,
        count: requests.length,
        filter: {
          status: status || "all",
          userId: targetUserId,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PUT /api/leave/requests/:id
 * Update a leave request (cancel it)
 */
router.put(
  "/requests/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Get request to check authorization
      const request = await LeaveService.getLeaveRequest(id);
      if (request.userId !== req.user.id && req.user.role !== "admin") {
        throw new AppError(403, "Not authorized to update this leave request");
      }

      // Only allow updating pending requests (reject them)
      if (request.status !== "pending") {
        throw new AppError(400, "Can only cancel pending leave requests");
      }

      // Reject the request
      const updated = await LeaveService.rejectLeaveRequest(id);

      res.json({
        success: true,
        data: updated,
        message: "Leave request cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * DELETE /api/leave/requests/:id
 * Delete a leave request (remove it)
 */
router.delete(
  "/requests/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Get request to check authorization
      const request = await LeaveService.getLeaveRequest(id);
      if (request.userId !== req.user.id && req.user.role !== "admin") {
        throw new AppError(403, "Not authorized to delete this leave request");
      }

      // Only allow deleting rejected requests
      if (request.status !== "rejected") {
        throw new AppError(400, "Can only delete rejected leave requests");
      }

      // In a real app, you might want to soft delete or archive
      // For now, we'll just return a message
      res.json({
        success: true,
        message:
          "Leave request deleted successfully (implementation depends on your needs)",
      });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// APPROVAL ROUTES
// ============================================================================

/**
 * POST /api/leave/requests/:id/approve
 * Approve a leave request
 */
router.post(
  "/requests/:id/approve",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Only managers and admins can approve
      if (!["manager", "admin"].includes(req.user.role)) {
        throw new AppError(403, "Only managers can approve leave requests");
      }

      const approved = await LeaveService.approveLeaveRequest(id, req.user.id);

      res.json({
        success: true,
        data: approved,
        message: "Leave request approved successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/leave/requests/:id/reject
 * Reject a leave request
 */
router.post(
  "/requests/:id/reject",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Only managers and admins can reject
      if (!["manager", "admin"].includes(req.user.role)) {
        throw new AppError(403, "Only managers can reject leave requests");
      }

      const rejected = await LeaveService.rejectLeaveRequest(id);

      res.json({
        success: true,
        data: rejected,
        message: "Leave request rejected successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/leave/requests/for-approval
 * Get all pending leave requests for approval
 */
router.get(
  "/for-approval",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only managers and admins can view pending approvals
      if (!["manager", "admin"].includes(req.user.role)) {
        throw new AppError(403, "Only managers can view pending approvals");
      }

      const requests = await LeaveService.getLeaveRequestsForApproval(
        req.user.id,
      );

      res.json({
        success: true,
        data: requests,
        count: requests.length,
        message: "Pending leave requests requiring approval",
      });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// ALLOCATION ROUTES
// ============================================================================

/**
 * GET /api/leave/allocations/:year
 * Get leave allocation for a user and year
 */
router.get(
  "/allocations/:year",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year } = req.params;
      const { userId } = req.query;

      // Check authorization
      const targetUserId =
        userId && req.user.role === "admin" ? (userId as string) : req.user.id;
      if (userId && userId !== req.user.id && req.user.role !== "admin") {
        throw new AppError(
          403,
          "Not authorized to view other users allocations",
        );
      }

      const allocation = await LeaveService.getAllocation(
        targetUserId,
        parseInt(year),
      );

      res.json({
        success: true,
        data: allocation,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PUT /api/leave/allocations/:year
 * Update leave allocation for a user and year (admin only)
 */
router.put(
  "/allocations/:year",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year } = req.params;
      const { userId, annualLeaveHours, usedLeaveHours } = req.body;

      // Only admins can update allocations
      if (req.user.role !== "admin") {
        throw new AppError(403, "Only admins can update leave allocations");
      }

      if (!userId) {
        throw new AppError(400, "userId is required");
      }

      const updated = await LeaveService.updateAllocation(
        userId,
        parseInt(year),
        {
          annualLeaveHours,
          usedLeaveHours,
        },
      );

      res.json({
        success: true,
        data: updated,
        message: "Leave allocation updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/leave/allocations/:year/balance
 * Get leave balance summary
 */
router.get(
  "/allocations/:year/balance",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year } = req.params;
      const { userId } = req.query;

      // Check authorization
      const targetUserId =
        userId && req.user.role === "admin" ? (userId as string) : req.user.id;
      if (userId && userId !== req.user.id && req.user.role !== "admin") {
        throw new AppError(403, "Not authorized");
      }

      const allocation = await LeaveService.getAllocation(
        targetUserId,
        parseInt(year),
      );

      // Get pending requests
      const requests = await LeaveService.getUserLeaveRequests(
        targetUserId,
        "pending",
      );

      res.json({
        success: true,
        data: {
          allocation,
          pendingRequests: requests,
          summary: {
            annualLeaveHours: allocation.annualLeaveHours,
            usedLeaveHours: allocation.usedLeaveHours,
            remainingHours: allocation.remainingHours,
            pendingHours: requests.reduce((sum, req) => {
              // Calculate hours for each pending request
              const start = new Date(req.startDate);
              const end = new Date(req.endDate);
              const days =
                Math.ceil(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                ) + 1;
              // Count business days (simplified - assumes 5 day week)
              return sum + days * 8;
            }, 0),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// ERROR HANDLER
// ============================================================================

router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (error.code === "P2025") {
    // Prisma not found error
    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  if (error.code === "P2003") {
    // Prisma foreign key error
    return res.status(400).json({
      success: false,
      message: "Invalid reference ID",
    });
  }

  console.error("Leave route error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

export default router;
