import { Router } from "express";
import { FilterController } from "../controllers/FilterController";
import { authMiddleware } from "@/shared/middleware/authMiddleware";

const router = Router();

// All filter routes require authentication
router.use(authMiddleware);

// GET /api/filters/options - Get all dynamic filter options
router.get("/options", FilterController.getFilterOptions);

export default router;
