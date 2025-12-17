/**
 * Search Routes
 * Global search across projects, tasks, clients
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');

// Global search endpoint
router.get('/search', async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = `%${query}%`;
    const results = [];

    // Search projects
    try {
      const projectsResult = await executeQuery(
        `SELECT id, name, description, 'project' as type, status, contract_amount 
         FROM projects 
         WHERE (name ILIKE $1 OR description ILIKE $1) AND is_deleted = false
         LIMIT 10`,
        [searchTerm]
      );
      results.push(...projectsResult.rows.map(p => ({ ...p, category: 'Projects' })));
    } catch (e) {
      console.warn('Project search error:', e.message);
    }

    // Search tasks
    try {
      const tasksResult = await executeQuery(
        `SELECT id, title, description, 'task' as type, status, priority 
         FROM tasks 
         WHERE (title ILIKE $1 OR description ILIKE $1) AND is_deleted = false
         LIMIT 10`,
        [searchTerm]
      );
      results.push(...tasksResult.rows.map(t => ({ ...t, category: 'Tasks' })));
    } catch (e) {
      console.warn('Task search error:', e.message);
    }

    // Search clients
    try {
      const clientsResult = await executeQuery(
        `SELECT id, name, email, 'client' as type 
         FROM clients 
         WHERE (name ILIKE $1 OR email ILIKE $1) AND is_deleted = false
         LIMIT 10`,
        [searchTerm]
      );
      results.push(...clientsResult.rows.map(c => ({ ...c, category: 'Clients' })));
    } catch (e) {
      console.warn('Client search error:', e.message);
    }

    res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('❌ Search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

module.exports = router;
