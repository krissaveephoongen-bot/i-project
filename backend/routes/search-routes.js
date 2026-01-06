import express from 'express';
import { db } from '../lib/db.js';
import { projects, tasks, users, clients } from '../lib/schema.js';
import { sql, or, and, ilike, eq } from 'drizzle-orm';

const router = express.Router();

// GET /api/search - Global search across all entities
router.get('/', async (req, res) => {
  try {
    const { q: query, type, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const searchTerm = `%${query.trim()}%`;
    const limitNum = parseInt(limit);

    let results = [];

    // Search in projects
    if (!type || type === 'project') {
      const projectResults = await db
        .select({
          id: projects.id,
          type: sql`'project'`,
          title: projects.name,
          description: projects.description,
          code: projects.code,
          status: projects.status,
          score: sql`1` // Base relevance score
        })
        .from(projects)
        .where(and(
          sql`is_archived = false`,
          or(
            ilike(projects.name, searchTerm),
            ilike(projects.description, searchTerm),
            ilike(projects.code, searchTerm)
          )
        ))
        .limit(limitNum);

      results.push(...projectResults);
    }

    // Search in tasks
    if (!type || type === 'task') {
      const taskResults = await db
        .select({
          id: tasks.id,
          type: sql`'task'`,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          projectName: projects.name,
          score: sql`1`
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(or(
          ilike(tasks.title, searchTerm),
          ilike(tasks.description, searchTerm)
        ))
        .limit(limitNum);

      results.push(...taskResults);
    }

    // Search in users
    if (!type || type === 'user') {
      const userResults = await db
        .select({
          id: users.id,
          type: sql`'user'`,
          title: users.name,
          description: sql`concat(users.email, ' - ', coalesce(users.department, ''), ' - ', coalesce(users.position, ''))`,
          status: users.status,
          department: users.department,
          score: sql`1`
        })
        .from(users)
        .where(and(
          sql`is_active = true`,
          or(
            ilike(users.name, searchTerm),
            ilike(users.email, searchTerm),
            ilike(users.department, searchTerm),
            ilike(users.position, searchTerm)
          )
        ))
        .limit(limitNum);

      results.push(...userResults);
    }

    // Search in clients
    if (!type || type === 'client') {
      const clientResults = await db
        .select({
          id: clients.id,
          type: sql`'client'`,
          title: clients.name,
          description: sql`concat(coalesce(clients.email, ''), ' - ', coalesce(clients.phone, ''))`,
          score: sql`1`
        })
        .from(clients)
        .where(or(
          ilike(clients.name, searchTerm),
          ilike(clients.email, searchTerm)
        ))
        .limit(limitNum);

      results.push(...clientResults);
    }

    // Sort by relevance (this is a simple implementation)
    // In a real application, you might want more sophisticated scoring
    results.sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.title.toLowerCase().includes(query.toLowerCase());
      const bExact = b.title.toLowerCase().includes(query.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    // Limit total results
    results = results.slice(0, limitNum);

    res.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/search/suggestions - Search suggestions/autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.json([]);
    }

    const searchTerm = `${query.trim()}%`;
    const limitNum = parseInt(limit);

    const suggestions = [];

    // Project name suggestions
    const projectSuggestions = await db
      .select({
        text: projects.name,
        type: sql`'project'`,
        id: projects.id
      })
      .from(projects)
      .where(and(
        sql`is_archived = false`,
        ilike(projects.name, searchTerm)
      ))
      .limit(Math.ceil(limitNum / 4));

    suggestions.push(...projectSuggestions);

    // Task title suggestions
    const taskSuggestions = await db
      .select({
        text: tasks.title,
        type: sql`'task'`,
        id: tasks.id
      })
      .from(tasks)
      .where(ilike(tasks.title, searchTerm))
      .limit(Math.ceil(limitNum / 4));

    suggestions.push(...taskSuggestions);

    // User name suggestions
    const userSuggestions = await db
      .select({
        text: users.name,
        type: sql`'user'`,
        id: users.id
      })
      .from(users)
      .where(and(
        sql`is_active = true`,
        ilike(users.name, searchTerm)
      ))
      .limit(Math.ceil(limitNum / 4));

    suggestions.push(...userSuggestions);

    // Client name suggestions
    const clientSuggestions = await db
      .select({
        text: clients.name,
        type: sql`'client'`,
        id: clients.id
      })
      .from(clients)
      .where(ilike(clients.name, searchTerm))
      .limit(Math.ceil(limitNum / 4));

    suggestions.push(...clientSuggestions);

    // Remove duplicates and limit
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) =>
        index === self.findIndex(s => s.text === suggestion.text)
      )
      .slice(0, limitNum);

    res.json(uniqueSuggestions);
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch search suggestions' });
  }
});

// GET /api/search/advanced - Advanced search with filters
router.get('/advanced', async (req, res) => {
  try {
    const {
      q: query,
      type,
      status,
      priority,
      department,
      projectId,
      assignedTo,
      startDate,
      endDate,
      limit = 50
    } = req.query;

    let whereConditions = [];
    let results = [];

    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;

      // Advanced search based on type
      if (!type || type === 'project') {
        let projectConditions = [
          sql`is_archived = false`,
          or(
            ilike(projects.name, searchTerm),
            ilike(projects.description, searchTerm),
            ilike(projects.code, searchTerm)
          )
        ];

        if (status) projectConditions.push(eq(projects.status, status));

        const projectResults = await db
          .select({
            id: projects.id,
            type: sql`'project'`,
            title: projects.name,
            description: projects.description,
            status: projects.status,
            code: projects.code,
            startDate: projects.startDate,
            endDate: projects.endDate
          })
          .from(projects)
          .where(and(...projectConditions))
          .limit(parseInt(limit));

        results.push(...projectResults);
      }

      if (!type || type === 'task') {
        let taskConditions = [
          or(
            ilike(tasks.title, searchTerm),
            ilike(tasks.description, searchTerm)
          )
        ];

        if (status) taskConditions.push(eq(tasks.status, status));
        if (priority) taskConditions.push(eq(tasks.priority, priority));
        if (projectId) taskConditions.push(eq(tasks.projectId, projectId));
        if (assignedTo) taskConditions.push(eq(tasks.assignedTo, assignedTo));

        const taskResults = await db
          .select({
            id: tasks.id,
            type: sql`'task'`,
            title: tasks.title,
            description: tasks.description,
            status: tasks.status,
            priority: tasks.priority,
            projectName: projects.name,
            assignedToName: users.name,
            dueDate: tasks.dueDate
          })
          .from(tasks)
          .leftJoin(projects, eq(tasks.projectId, projects.id))
          .leftJoin(users, eq(tasks.assignedTo, users.id))
          .where(and(...taskConditions))
          .limit(parseInt(limit));

        results.push(...taskResults);
      }

      if (!type || type === 'user') {
        let userConditions = [
          sql`is_active = true`,
          or(
            ilike(users.name, searchTerm),
            ilike(users.email, searchTerm),
            ilike(users.department, searchTerm)
          )
        ];

        if (department) userConditions.push(eq(users.department, department));

        const userResults = await db
          .select({
            id: users.id,
            type: sql`'user'`,
            title: users.name,
            description: users.email,
            department: users.department,
            position: users.position,
            status: users.status
          })
          .from(users)
          .where(and(...userConditions))
          .limit(parseInt(limit));

        results.push(...userResults);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error performing advanced search:', error);
    res.status(500).json({ error: 'Advanced search failed' });
  }
});

export default router;