/**
 * Main Routes Index
 * Combines all API routes
 */

import { Router } from "express";
import timesheetRoutes from "./timesheet.routes";
import leaveRoutes from "./leave.routes";

const router = Router();

// Mount all route groups
router.use("/timesheet", timesheetRoutes);
router.use("/leave", leaveRoutes);

// Example: You can add more route groups here
// router.use('/projects', projectRoutes);
// router.use('/tasks', taskRoutes);

export default router;
