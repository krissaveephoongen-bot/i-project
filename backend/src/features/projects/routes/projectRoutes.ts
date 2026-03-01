import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import {
  authMiddleware,
  requireRole,
} from "../../../shared/middleware/authMiddleware";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/projectSchemas";

const router = Router();
const projectController = new ProjectController();

// All project routes require authentication
router.use(authMiddleware);

// GET /api/projects - Get all projects (with pagination and filtering)
router.get("/", projectController.getProjects);

// GET /api/projects/:id - Get project by ID
router.get("/:id", projectController.getProjectById);

// POST /api/projects - Create new project (admin/manager only)
router.post(
  "/",
  requireRole(["admin", "manager"]),
  validateRequest(createProjectSchema),
  projectController.createProject,
);

// PUT /api/projects/:id - Update project (admin/manager only)
router.put(
  "/:id",
  requireRole(["admin", "manager"]),
  validateRequest(updateProjectSchema),
  projectController.updateProject,
);

// DELETE /api/projects/:id - Delete project (admin only)
router.delete("/:id", requireRole(["admin"]), projectController.deleteProject);

// GET /api/projects/:id/tasks - Get project tasks
router.get("/:id/tasks", projectController.getProjectTasks);

// GET /api/projects/:id/team - Get project team members
router.get("/:id/team", projectController.getProjectTeam);

// POST /api/projects/:id/team - Add team member to project
router.post(
  "/:id/team",
  requireRole(["admin", "manager"]),
  projectController.addTeamMember,
);

// DELETE /api/projects/:id/team/:userId - Remove team member from project
router.delete(
  "/:id/team/:userId",
  requireRole(["admin", "manager"]),
  projectController.removeTeamMember,
);

export { router as projectRoutes };
