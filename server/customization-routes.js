/**
 * Customization Routes
 * Handles team and project customization settings
 */

const express = require('express');
const { Client } = require('pg');
const dotenv = require('dotenv');
const { authenticateToken, requireManager, checkTeamAccess } = require('./middleware/auth-middleware');

dotenv.config();

const router = express.Router();

const getDBClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
};

/**
 * GET /teams/:teamId/customization
 * Get team customization settings
 */
router.get('/teams/:teamId/customization', authenticateToken, checkTeamAccess, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { teamId } = req.params;

    // Get team customization
    const result = await client.query(
      'SELECT * FROM team_customization WHERE team_id = $1',
      [teamId]
    );

    // Return default customization if not found
    const customization = result.rows.length > 0 ? result.rows[0] : {
      team_id: teamId,
      workflows: ['standard', 'agile', 'kanban'],
      statuses: ['todo', 'in-progress', 'in-review', 'completed', 'blocked'],
      priorities: ['low', 'medium', 'high', 'urgent'],
      custom_fields: [],
      automation_rules: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: customization
    });
  } catch (error) {
    console.error('❌ Error fetching team customization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team customization',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * PUT /teams/:teamId/customization
 * Update team customization settings
 */
router.put('/teams/:teamId/customization', authenticateToken, requireManager, checkTeamAccess, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { teamId } = req.params;
    const { workflows, statuses, priorities, customFields, automationRules } = req.body;

    // Check if customization exists
    const existsResult = await client.query(
      'SELECT id FROM team_customization WHERE team_id = $1',
      [teamId]
    );

    let result;
    if (existsResult.rows.length === 0) {
      // Create new customization
      result = await client.query(
        `INSERT INTO team_customization (team_id, workflows, statuses, priorities, custom_fields, automation_rules, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [teamId, JSON.stringify(workflows), JSON.stringify(statuses), JSON.stringify(priorities), JSON.stringify(customFields || []), JSON.stringify(automationRules || [])]
      );
    } else {
      // Update existing customization
      result = await client.query(
        `UPDATE team_customization 
         SET workflows = COALESCE($1, workflows),
             statuses = COALESCE($2, statuses),
             priorities = COALESCE($3, priorities),
             custom_fields = COALESCE($4, custom_fields),
             automation_rules = COALESCE($5, automation_rules),
             updated_at = NOW()
         WHERE team_id = $6
         RETURNING *`,
        [
          workflows ? JSON.stringify(workflows) : null,
          statuses ? JSON.stringify(statuses) : null,
          priorities ? JSON.stringify(priorities) : null,
          customFields ? JSON.stringify(customFields) : null,
          automationRules ? JSON.stringify(automationRules) : null,
          teamId
        ]
      );
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Team customization updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating team customization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team customization',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /teams/:teamId/customization/workflows
 * Add custom workflow
 */
router.post('/teams/:teamId/customization/workflows', authenticateToken, requireManager, checkTeamAccess, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { teamId } = req.params;
    const { name, stages, description } = req.body;

    if (!name || !stages) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, stages'
      });
    }

    const workflowId = `workflow-${Date.now()}`;

    const result = await client.query(
      `INSERT INTO custom_workflows (id, team_id, name, stages, description, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [workflowId, teamId, name, JSON.stringify(stages), description]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Custom workflow created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating custom workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create custom workflow',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /teams/:teamId/customization/automation-rules
 * Add automation rule
 */
router.post('/teams/:teamId/customization/automation-rules', authenticateToken, requireManager, checkTeamAccess, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { teamId } = req.params;
    const { name, trigger, action, isEnabled } = req.body;

    if (!name || !trigger || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, trigger, action'
      });
    }

    const ruleId = `rule-${Date.now()}`;

    const result = await client.query(
      `INSERT INTO automation_rules (id, team_id, name, trigger, action, is_enabled, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [ruleId, teamId, name, JSON.stringify(trigger), JSON.stringify(action), isEnabled !== false]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Automation rule created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating automation rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create automation rule',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /teams/:teamId/customization/automation-rules
 * Get team automation rules
 */
router.get('/teams/:teamId/customization/automation-rules', authenticateToken, checkTeamAccess, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { teamId } = req.params;

    const result = await client.query(
      'SELECT * FROM automation_rules WHERE team_id = $1 ORDER BY created_at DESC',
      [teamId]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching automation rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch automation rules',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * PUT /teams/:teamId/customization/automation-rules/:ruleId
 * Update automation rule
 */
router.put('/teams/:teamId/customization/automation-rules/:ruleId', authenticateToken, requireManager, checkTeamAccess, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { teamId, ruleId } = req.params;
    const { name, trigger, action, isEnabled } = req.body;

    const result = await client.query(
      `UPDATE automation_rules 
       SET name = COALESCE($1, name),
           trigger = COALESCE($2, trigger),
           action = COALESCE($3, action),
           is_enabled = COALESCE($4, is_enabled)
       WHERE id = $5 AND team_id = $6
       RETURNING *`,
      [name, trigger ? JSON.stringify(trigger) : null, action ? JSON.stringify(action) : null, isEnabled, ruleId, teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Automation rule not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Automation rule updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating automation rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update automation rule',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
