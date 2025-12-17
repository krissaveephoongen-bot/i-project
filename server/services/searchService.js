const { pool } = require('../config/database');

const SearchService = {
  /**
   * Advanced search across multiple entities
   * @param {Object} filters - Search criteria
   * @param {string[]} [entities=['projects', 'tasks', 'users']] - Entities to search in
   * @param {number} [page=1] - Page number
   * @param {number} [limit=10] - Items per page
   * @returns {Promise<Object>} Search results
   */
  async advancedSearch(filters = {}, entities = ['projects', 'tasks', 'users'], page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const results = { total: 0, page, limit, items: [] };
    
    try {
      // Build dynamic queries for each entity
      for (const entity of entities) {
        switch (entity) {
          case 'projects':
            const projects = await this.searchProjects(filters, offset, limit);
            results.items.push(...projects);
            break;
            
          case 'tasks':
            const tasks = await this.searchTasks(filters, offset, limit);
            results.items.push(...tasks);
            break;
            
          case 'users':
            const users = await this.searchUsers(filters, offset, limit);
            results.items.push(...users);
            break;
        }
      }
      
      // Sort results by relevance or other criteria
      results.items.sort((a, b) => b.relevance - a.relevance);
      results.total = results.items.length;
      
      // Apply pagination
      results.items = results.items.slice(offset, offset + limit);
      
      return results;
      
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw new Error('Failed to perform search');
    }
  },
  
  /**
   * Search projects with filters
   */
  async searchProjects(filters, offset, limit) {
    const { 
      query, 
      status, 
      startDate, 
      endDate, 
      department, 
      priority, 
      sortBy = 'updated_at', 
      sortOrder = 'DESC' 
    } = filters;
    
    const whereClauses = [];
    const params = [];
    let paramIndex = 1;
    
    if (query) {
      whereClauses.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${query}%`);
      paramIndex++;
    }
    
    if (status) {
      whereClauses.push(`p.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (startDate) {
      whereClauses.push(`p.start_date >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      whereClauses.push(`p.end_date <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }
    
    if (department) {
      whereClauses.push(`p.department = $${paramIndex}`);
      params.push(department);
      paramIndex++;
    }
    
    if (priority) {
      whereClauses.push(`p.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }
    
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    const queryStr = `
      SELECT 
        'project' as type,
        p.id,
        p.name,
        p.description,
        p.status,
        p.progress,
        p.start_date as "startDate",
        p.end_date as "endDate",
        p.updated_at as "updatedAt",
        ts_rank(
          to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '')),
          plainto_tsquery('english', $1)
        ) as relevance
      FROM projects p
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(queryStr, params);
    return result.rows;
  },
  
  /**
   * Search tasks with filters
   */
  async searchTasks(filters, offset, limit) {
    // Similar implementation to searchProjects but for tasks
    // ...
    return [];
  },
  
  /**
   * Search users with filters
   */
  async searchUsers(filters, offset, limit) {
    // Similar implementation to searchProjects but for users
    // ...
    return [];
  },
  
  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query, entityType) {
    // Implementation for search suggestions
    // ...
    return [];
  },
  
  /**
   * Get search filters metadata
   */
  async getSearchFilters() {
    // Return available filters and their options
    return {
      status: ['active', 'completed', 'on-hold', 'cancelled'],
      priority: ['low', 'medium', 'high', 'critical'],
      // ... other filter options
    };
  }
};

module.exports = SearchService;
