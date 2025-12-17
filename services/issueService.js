/**
 * Project Issue Service
 * Handles business logic for project issue management
 */

const { executeQuery } = require('../database/neon-connection');

class IssueService {
  /**
   * Get all issues for a project with optional filters
   */
  static async getProjectIssues(projectId, filters = {}) {
    try {
      let query = `
        SELECT * FROM project_issues
        WHERE project_id = $1 AND is_deleted = false
      `;
      const params = [projectId];

      if (filters.status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(filters.status);
      }

      if (filters.priority) {
        query += ` AND priority = $${params.length + 1}`;
        params.push(filters.priority);
      }

      if (filters.category) {
        query += ` AND category = $${params.length + 1}`;
        params.push(filters.category);
      }

      if (filters.assignedTo) {
        query += ` AND assigned_to = $${params.length + 1}`;
        params.push(filters.assignedTo);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await executeQuery(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting project issues:', error.message);
      throw error;
    }
  }

  /**
   * Get issue summary statistics for a project
   */
  static async getIssueSummary(projectId) {
    try {
      const query = `
        SELECT 
          COUNT(*) AS total_issues,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_issues,
          SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress_issues,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_issues,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_issues,
          SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) AS critical_issues,
          SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS high_priority_issues,
          SUM(CASE WHEN impact_on_schedule = true THEN 1 ELSE 0 END) AS schedule_impact_count,
          SUM(CASE WHEN impact_on_budget = true THEN 1 ELSE 0 END) AS budget_impact_count,
          COALESCE(SUM(estimated_cost), 0) AS total_issue_cost
        FROM project_issues
        WHERE project_id = $1 AND is_deleted = false
      `;

      const result = await executeQuery(query, [projectId]);
      return result.rows[0] || this._getEmptySummary();
    } catch (error) {
      console.error('❌ Error getting issue summary:', error.message);
      throw error;
    }
  }

  /**
   * Get critical/high priority issues across all projects
   */
  static async getCriticalIssues(limit = 50) {
    try {
      const query = `
        SELECT 
          pi.*,
          p.name AS project_name,
          p.code AS project_code
        FROM project_issues pi
        JOIN projects p ON pi.project_id = p.id
        WHERE pi.is_deleted = FALSE 
          AND (pi.status IN ('open', 'in-progress') OR pi.priority IN ('high', 'critical'))
        ORDER BY 
          CASE pi.priority
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END,
          pi.created_at DESC
        LIMIT $1
      `;

      const result = await executeQuery(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting critical issues:', error.message);
      throw error;
    }
  }

  /**
   * Create a new issue
   */
  static async createIssue(projectId, issueData) {
    try {
      const {
        code,
        title,
        description,
        category = 'other',
        priority = 'medium',
        assigned_to,
        reported_by,
        impact_on_schedule = false,
        impact_on_budget = false,
        estimated_cost,
        root_cause,
        due_date,
      } = issueData;

      // Validate required fields
      if (!code || !title) {
        throw new Error('Code and title are required');
      }

      const query = `
        INSERT INTO project_issues (
          project_id, code, title, description, category, priority,
          assigned_to, reported_by, impact_on_schedule, impact_on_budget,
          estimated_cost, root_cause, due_date, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING *
      `;

      const result = await executeQuery(query, [
        projectId,
        code,
        title,
        description || null,
        category,
        priority,
        assigned_to || null,
        reported_by || null,
        impact_on_schedule,
        impact_on_budget,
        estimated_cost || null,
        root_cause || null,
        due_date || null,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating issue:', error.message);
      throw error;
    }
  }

  /**
   * Update an issue
   */
  static async updateIssue(issueId, updateData) {
    try {
      const updates = [];
      const params = [];
      let paramIndex = 1;

      const allowedFields = [
        'title',
        'description',
        'category',
        'status',
        'priority',
        'assigned_to',
        'impact_on_schedule',
        'impact_on_budget',
        'estimated_cost',
        'root_cause',
        'resolution_notes',
        'due_date',
        'resolved_date',
      ];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push(`updated_at = NOW()`);
      params.push(issueId);

      const query = `
        UPDATE project_issues
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex} AND is_deleted = false
        RETURNING *
      `;

      const result = await executeQuery(query, params);

      if (result.rows.length === 0) {
        throw new Error('Issue not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating issue:', error.message);
      throw error;
    }
  }

  /**
   * Update issue status
   */
  static async updateIssueStatus(issueId, status, resolvedDate = null) {
    try {
      const isResolved = ['resolved', 'closed'].includes(status);
      const actualResolvedDate = isResolved ? resolvedDate || new Date() : null;

      const query = `
        UPDATE project_issues
        SET status = $1,
            resolved_date = CASE WHEN $1 IN ('resolved', 'closed') THEN COALESCE($2, NOW()) ELSE resolved_date END,
            updated_at = NOW()
        WHERE id = $3 AND is_deleted = false
        RETURNING *
      `;

      const result = await executeQuery(query, [
        status,
        actualResolvedDate,
        issueId,
      ]);

      if (result.rows.length === 0) {
        throw new Error('Issue not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating issue status:', error.message);
      throw error;
    }
  }

  /**
   * Delete (soft delete) an issue
   */
  static async deleteIssue(issueId) {
    try {
      const query = `
        UPDATE project_issues 
        SET is_deleted = true, updated_at = NOW() 
        WHERE id = $1 
        RETURNING *
      `;

      const result = await executeQuery(query, [issueId]);

      if (result.rows.length === 0) {
        throw new Error('Issue not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error deleting issue:', error.message);
      throw error;
    }
  }

  /**
   * Get issues by assignee
   */
  static async getIssuesByAssignee(assigneeName, projectId = null) {
    try {
      let query = `
        SELECT * FROM project_issues
        WHERE assigned_to = $1 AND is_deleted = false
      `;
      const params = [assigneeName];

      if (projectId) {
        query += ` AND project_id = $2`;
        params.push(projectId);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await executeQuery(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting issues by assignee:', error.message);
      throw error;
    }
  }

  /**
   * Get overdue issues
   */
  static async getOverdueIssues(projectId = null) {
    try {
      let query = `
        SELECT * FROM project_issues
        WHERE due_date < NOW() 
          AND status NOT IN ('resolved', 'closed', 'cancelled')
          AND is_deleted = false
      `;
      const params = [];

      if (projectId) {
        query += ` AND project_id = $1`;
        params.push(projectId);
      }

      query += ` ORDER BY due_date ASC`;

      const result = await executeQuery(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting overdue issues:', error.message);
      throw error;
    }
  }

  /**
   * Get issues by priority
   */
  static async getIssuesByPriority(priority, projectId = null) {
    try {
      let query = `
        SELECT * FROM project_issues
        WHERE priority = $1 AND is_deleted = false
      `;
      const params = [priority];

      if (projectId) {
        query += ` AND project_id = $2`;
        params.push(projectId);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await executeQuery(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting issues by priority:', error.message);
      throw error;
    }
  }

  /**
   * Get issue resolution metrics
   */
  static async getResolutionMetrics(projectId) {
    try {
      const query = `
        SELECT 
          COUNT(*) AS total_issues,
          COUNT(CASE WHEN resolved_date IS NOT NULL THEN 1 END) AS resolved_count,
          AVG(EXTRACT(DAY FROM (resolved_date - reported_date))) AS avg_resolution_days,
          MIN(EXTRACT(DAY FROM (resolved_date - reported_date))) AS min_resolution_days,
          MAX(EXTRACT(DAY FROM (resolved_date - reported_date))) AS max_resolution_days
        FROM project_issues
        WHERE project_id = $1 AND is_deleted = false AND resolved_date IS NOT NULL
      `;

      const result = await executeQuery(query, [projectId]);
      return result.rows[0] || this._getEmptyMetrics();
    } catch (error) {
      console.error('❌ Error getting resolution metrics:', error.message);
      throw error;
    }
  }

  /**
   * Helper: Get empty summary object
   */
  static _getEmptySummary() {
    return {
      total_issues: 0,
      open_issues: 0,
      in_progress_issues: 0,
      resolved_issues: 0,
      closed_issues: 0,
      critical_issues: 0,
      high_priority_issues: 0,
      schedule_impact_count: 0,
      budget_impact_count: 0,
      total_issue_cost: 0,
    };
  }

  /**
   * Helper: Get empty metrics object
   */
  static _getEmptyMetrics() {
    return {
      total_issues: 0,
      resolved_count: 0,
      avg_resolution_days: 0,
      min_resolution_days: 0,
      max_resolution_days: 0,
    };
  }
}

module.exports = IssueService;
