import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import { db } from '@/lib/database';
import { tasks, users, milestones, taskDependencies } from '@/lib/schema';
import { 
  withAuth,
  withPermission,
  withProjectContext,
  createErrorResponse,
  createSuccessResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  addCorsHeaders
} from '@/lib/express-middleware';

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const createTaskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters'),
  description: z.string().optional(),
  wbsCode: z.string().optional(),
  parentTaskId: z.string().optional(),
  level: z.number().min(1).max(10).default(1),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  tags: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0).default(0),
  weight: z.number().min(0).max(10).default(1),
  storyPoints: z.number().min(0).optional(),
  assignedTo: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled', 'blocked']).default('todo'),
  progressActual: z.number().min(0).max(100).default(0),
  progressPlan: z.number().min(0).max(100).default(0),
  dependencies: z.array(z.string()).optional(),
  milestoneId: z.string().optional(),
});

const updateTaskSchema = createTaskSchema.partial();

const taskQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  status: z.enum(['all', 'todo', 'in_progress', 'in_review', 'done', 'cancelled', 'blocked']).default('all'),
  priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).default('all'),
  assignedTo: z.string().optional(),
  milestoneId: z.string().optional(),
  parentTaskId: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'dueDate', 'priority', 'status', 'createdAt', 'estimatedHours']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  view: z.enum(['kanban', 'list']).default('list'),
});

// ============================================================
// TASK ROUTES
// ============================================================

/**
 * GET /api/projects/:projectId/tasks
 * Get all tasks for a project with filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read tasks'));
    }

    const projectId = contextResult.projectId!;

    // Validate query parameters
    const validation = taskQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const { 
      page, 
      limit, 
      status, 
      priority, 
      assignedTo, 
      milestoneId, 
      parentTaskId,
      category,
      search,
      sortBy, 
      sortOrder,
      view
    } = validation.data;

    // Build query
    let query = db.select().from(tasks).where(eq(tasks.projectId, projectId));

    // Apply filters
    const conditions = [eq(tasks.projectId, projectId)];
    
    if (status !== 'all') {
      conditions.push(eq(tasks.status, status));
    }
    
    if (priority !== 'all') {
      conditions.push(eq(tasks.priority, priority));
    }
    
    if (assignedTo) {
      conditions.push(eq(tasks.assignedTo, assignedTo));
    }
    
    if (milestoneId) {
      conditions.push(eq(tasks.milestoneId, milestoneId));
    }
    
    if (parentTaskId) {
      conditions.push(eq(tasks.parentTaskId, parentTaskId));
    }
    
    if (category) {
      conditions.push(eq(tasks.category, category));
    }

    if (conditions.length > 1) {
      query = db.select().from(tasks).where(and(...conditions));
    }

    // Apply search (simple implementation)
    if (search) {
      // For now, we'll skip search as it requires more complex SQL
      // In a real implementation, you'd use full-text search or ILIKE
    }

    // Apply sorting
    const sortColumn = {
      title: tasks.title,
      dueDate: tasks.dueDate,
      priority: tasks.priority,
      status: tasks.status,
      createdAt: tasks.createdAt,
      estimatedHours: tasks.estimatedHours
    }[sortBy] || tasks.createdAt;

    query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

    // Get total count for pagination
    const totalCount = await db.select({ count: tasks.id }).from(tasks)
      .where(eq(tasks.projectId, projectId));
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Execute query
    const taskList = await query;

    // Get relations for each task
    const tasksWithRelations = await Promise.all(
      taskList.map(async (task) => {
        const [assignedUser, milestone, parentTask] = await Promise.all([
          task.assignedTo ? db.select().from(users).where(eq(users.id, task.assignedTo)).limit(1) : [],
          task.milestoneId ? db.select().from(milestones).where(eq(milestones.id, task.milestoneId)).limit(1) : [],
          task.parentTaskId ? db.select().from(tasks).where(eq(tasks.id, task.parentTaskId)).limit(1) : []
        ]);

        return {
          ...task,
          assignedUser: assignedUser[0] || null,
          milestone: milestone[0] || null,
          parentTask: parentTask[0] || null
        };
      })
    );

    // Calculate pagination
    const totalPages = Math.ceil(totalCount.length / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Group tasks by status for Kanban view
    let kanbanData = null;
    if (view === 'kanban') {
      kanbanData = {
        todo: tasksWithRelations.filter(task => task.status === 'todo'),
        in_progress: tasksWithRelations.filter(task => task.status === 'in_progress'),
        in_review: tasksWithRelations.filter(task => task.status === 'in_review'),
        done: tasksWithRelations.filter(task => task.status === 'done'),
        blocked: tasksWithRelations.filter(task => task.status === 'blocked'),
        cancelled: tasksWithRelations.filter(task => task.status === 'cancelled')
      };
    }

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    // Return response
    res.status(200).json(createSuccessResponse({
      tasks: view === 'kanban' ? kanbanData : tasksWithRelations,
      view,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        pages: totalPages,
        hasNext,
        hasPrevious
      }
    }, 'Tasks retrieved successfully'));
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/tasks/:id
 * Get a specific task by ID
 */
router.get('/:id', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read tasks'));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Get task
    const task = await db.select().from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .limit(1);
    
    if (!task[0]) {
      return res.status(404).json(createErrorResponse('Task not found', 404));
    }

    // Get relations
    const [assignedUser, milestone, parentTask, subtasks] = await Promise.all([
      task[0].assignedTo ? db.select().from(users).where(eq(users.id, task[0].assignedTo)).limit(1) : [],
      task[0].milestoneId ? db.select().from(milestones).where(eq(milestones.id, task[0].milestoneId)).limit(1) : [],
      task[0].parentTaskId ? db.select().from(tasks).where(eq(tasks.id, task[0].parentTaskId)).limit(1) : [],
      db.select().from(tasks).where(eq(tasks.parentTaskId, task[0].id))
    ]);

    const taskWithRelations = {
      ...task[0],
      assignedUser: assignedUser[0] || null,
      milestone: milestone[0] || null,
      parentTask: parentTask[0] || null,
      subtasks
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(taskWithRelations, 'Task retrieved successfully'));
  } catch (error: any) {
    console.error('Get task error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * POST /api/projects/:projectId/tasks
 * Create a new task
 */
router.post('/', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.create')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to create tasks'));
    }

    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const taskData = validation.data;

    // Create task
    const newTask = await db.insert(tasks).values({
      ...taskData,
      projectId,
      createdBy: contextResult.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Create dependencies if provided
    if (taskData.dependencies && taskData.dependencies.length > 0) {
      const dependencyInserts = taskData.dependencies.map(depId => ({
        taskId: newTask[0].id,
        dependsOnTaskId: depId,
        dependencyType: 'finish_to_start',
        lagDays: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await db.insert(taskDependencies).values(dependencyInserts);
    }

    // Get relations for the new task
    const [assignedUser, milestone, parentTask] = await Promise.all([
      newTask[0].assignedTo ? db.select().from(users).where(eq(users.id, newTask[0].assignedTo)).limit(1) : [],
      newTask[0].milestoneId ? db.select().from(milestones).where(eq(milestones.id, newTask[0].milestoneId)).limit(1) : [],
      newTask[0].parentTaskId ? db.select().from(tasks).where(eq(tasks.id, newTask[0].parentTaskId)).limit(1) : []
    ]);

    const taskWithRelations = {
      ...newTask[0],
      assignedUser: assignedUser[0] || null,
      milestone: milestone[0] || null,
      parentTask: parentTask[0] || null
    };

    // Update milestone completion percentage
    await updateMilestoneProgress(newTask[0].milestoneId);

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(201).json(createSuccessResponse(taskWithRelations, 'Task created successfully'));
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * PUT /api/projects/:projectId/tasks/:id
 * Update a task
 */
router.put('/:id', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.update')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to update tasks'));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Validate request body
    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(validationErrorResponse(validation.error.errors));
    }

    const updateData = validation.data;

    // Check if task exists
    const existingTask = await db.select().from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .limit(1);
    
    if (!existingTask[0]) {
      return res.status(404).json(createErrorResponse('Task not found', 404));
    }

    // Handle status change
    if (updateData.status && updateData.status !== existingTask[0].status) {
      // Set completed timestamp if task is marked as done
      if (updateData.status === 'done') {
        updateData.completedAt = new Date().toISOString();
        updateData.progressActual = 100;
      } else if (existingTask[0].status === 'done' && updateData.status !== 'done') {
        // Clear completed timestamp if task is moved away from done
        updateData.completedAt = null;
      }
    }

    // Update task
    const updatedTask = await db.update(tasks)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .returning();

    // Update dependencies if provided
    if (updateData.dependencies !== undefined) {
      // Delete existing dependencies
      await db.delete(taskDependencies).where(eq(taskDependencies.taskId, id));
      
      // Create new dependencies
      if (updateData.dependencies.length > 0) {
        const dependencyInserts = updateData.dependencies.map(depId => ({
          taskId: id,
          dependsOnTaskId: depId,
          dependencyType: 'finish_to_start',
          lagDays: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await db.insert(taskDependencies).values(dependencyInserts);
      }
    }

    // Get relations for the updated task
    const [assignedUser, milestone, parentTask] = await Promise.all([
      updatedTask[0].assignedTo ? db.select().from(users).where(eq(users.id, updatedTask[0].assignedTo)).limit(1) : [],
      updatedTask[0].milestoneId ? db.select().from(milestones).where(eq(milestones.id, updatedTask[0].milestoneId)).limit(1) : [],
      updatedTask[0].parentTaskId ? db.select().from(tasks).where(eq(tasks.id, updatedTask[0].parentTaskId)).limit(1) : []
    ]);

    const taskWithRelations = {
      ...updatedTask[0],
      assignedUser: assignedUser[0] || null,
      milestone: milestone[0] || null,
      parentTask: parentTask[0] || null
    };

    // Update milestone completion percentage
    await updateMilestoneProgress(updatedTask[0].milestoneId);

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(taskWithRelations, 'Task updated successfully'));
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * DELETE /api/projects/:projectId/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.delete')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to delete tasks'));
    }

    const { id } = req.params;
    const projectId = contextResult.projectId!;

    // Check if task exists
    const existingTask = await db.select().from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
      .limit(1);
    
    if (!existingTask[0]) {
      return res.status(404).json(createErrorResponse('Task not found', 404));
    }

    // Store milestone ID before deletion for progress update
    const milestoneId = existingTask[0].milestoneId;

    // Delete task (cascade delete should handle dependencies and other relations)
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)));

    // Update milestone completion percentage
    await updateMilestoneProgress(milestoneId);

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(null, 'Task deleted successfully'));
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

/**
 * GET /api/projects/:projectId/tasks/summary
 * Get task summary for a project
 */
router.get('/summary', async (req, res) => {
  try {
    // Authenticate and check project context
    const contextResult = await withProjectContext(req);
    
    if (contextResult.error) {
      const status = contextResult.error.includes('No token') ? 401 : 
                    contextResult.error.includes('Project context') ? 400 : 403;
      return res.status(status).json(createErrorResponse(contextResult.error, status));
    }

    // Check permissions
    if (!contextResult.user.permissions.some((p: any) => p.name === 'projects.read')) {
      return res.status(403).json(forbiddenResponse('Insufficient permissions to read tasks'));
    }

    const projectId = contextResult.projectId!;

    // Get all tasks for the project
    const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId));

    // Calculate summary
    const totalTasks = allTasks.length;
    const todoTasks = allTasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length;
    const inReviewTasks = allTasks.filter(t => t.status === 'in_review').length;
    const doneTasks = allTasks.filter(t => t.status === 'done').length;
    const blockedTasks = allTasks.filter(t => t.status === 'blocked').length;
    const cancelledTasks = allTasks.filter(t => t.status === 'cancelled').length;

    const totalEstimatedHours = allTasks.reduce((sum, t) => sum + Number(t.estimatedHours || 0), 0);
    const totalActualHours = allTasks.reduce((sum, t) => sum + Number(t.actualHours || 0), 0);

    const completionPercentage = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

    // Group by milestone
    const milestoneStats = allTasks.reduce((acc, task) => {
      const milestoneId = task.milestoneId || 'unassigned';
      if (!acc[milestoneId]) {
        acc[milestoneId] = {
          total: 0,
          completed: 0,
          inProgress: 0,
          blocked: 0
        };
      }
      acc[milestoneId].total++;
      if (task.status === 'done') acc[milestoneId].completed++;
      else if (task.status === 'in_progress') acc[milestoneId].inProgress++;
      else if (task.status === 'blocked') acc[milestoneId].blocked++;
      return acc;
    }, {} as Record<string, any>);

    const summary = {
      counts: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        inReview: inReviewTasks,
        done: doneTasks,
        blocked: blockedTasks,
        cancelled: cancelledTasks
      },
      hours: {
        estimated: totalEstimatedHours,
        actual: totalActualHours,
        remaining: totalEstimatedHours - totalActualHours
      },
      percentages: {
        completion: completionPercentage
      },
      milestoneStats
    };

    // Add CORS headers
    addCorsHeaders(res, req.headers.origin);

    res.status(200).json(createSuccessResponse(summary, 'Task summary retrieved successfully'));
  } catch (error: any) {
    console.error('Get task summary error:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Update milestone completion percentage based on tasks
 */
async function updateMilestoneProgress(milestoneId: string | null) {
  if (!milestoneId) return;

  try {
    // Get all tasks for this milestone
    const milestoneTasks = await db.select().from(tasks).where(eq(tasks.milestoneId, milestoneId));
    
    if (milestoneTasks.length === 0) return;

    // Calculate completion percentage
    const completedTasks = milestoneTasks.filter(t => t.status === 'done').length;
    const completionPercentage = (completedTasks / milestoneTasks.length) * 100;

    // Update milestone status based on completion
    let newStatus = 'pending';
    if (completionPercentage === 100) {
      newStatus = 'paid'; // Assuming all tasks done means milestone is complete
    } else if (completionPercentage > 0) {
      newStatus = 'invoiced'; // Some progress made
    }

    // Update milestone
    await db.update(milestones)
      .set({
        status: newStatus,
        updatedAt: new Date()
      })
      .where(eq(milestones.id, milestoneId));

    console.log(`Updated milestone ${milestoneId} progress: ${completionPercentage.toFixed(1)}% (${completedTasks}/${milestoneTasks.length} tasks)`);
  } catch (error) {
    console.error('Error updating milestone progress:', error);
  }
}

export default router;
