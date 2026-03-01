import { Router } from "express";
import { TaskController } from "../controllers/TaskController";
import { authMiddleware } from "../../../shared/middleware/authMiddleware";
import {
  validateRequest,
  validateQuery,
} from "../../../shared/middleware/validateRequest";
import { createTaskSchema, updateTaskSchema } from "../schemas/taskSchemas";
import { taskSchemas } from "../../../shared/validation/schemas";

const router = Router();
const taskController = new TaskController();

// All task routes require authentication
router.use(authMiddleware);

// GET /api/tasks - Get all tasks (with filtering and validation)
router.get("/", validateQuery(taskSchemas.list), taskController.getTasks);

// GET /api/tasks/:id - Get task by ID
router.get("/:id", taskController.getTaskById);

// POST /api/tasks - Create new task
router.post("/", validateRequest(createTaskSchema), taskController.createTask);

// PUT /api/tasks/:id - Update task
router.put(
  "/:id",
  validateRequest(updateTaskSchema),
  taskController.updateTask,
);

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", taskController.deleteTask);

// GET /api/tasks/project/:projectId - Get tasks by project
router.get("/project/:projectId", taskController.getTasksByProject);

// GET /api/tasks/assignee/:userId - Get tasks by assignee
router.get("/assignee/:userId", taskController.getTasksByAssignee);

export { router as taskRoutes };
