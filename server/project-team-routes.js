/**
 * Project Team Management Routes
 * Handles adding and removing team members from projects
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');

// Add team member to project
router.post('/projects/:projectId/team', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, email, phone, role } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team member name is required'
      });
    }

    // Create or get user
    let userId;
    try {
      // Try to find existing user
      const userResult = await executeQuery(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [email]
      );

      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      } else if (email) {
        // Create new user if email provided
        const newUserResult = await executeQuery(
          'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id',
          [name, email, role || 'member']
        );
        userId = newUserResult.rows[0].id;
      }
    } catch (userError) {
      console.warn('User creation/lookup warning:', userError.message);
    }

    // Append to team_members field (since table structure uses comma-separated)
    const projectResult = await executeQuery(
      'SELECT team_members FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const currentTeam = projectResult.rows[0].team_members || '';
    const newTeamMembers = currentTeam 
      ? `${currentTeam},${name}` 
      : name;

    await executeQuery(
      'UPDATE projects SET team_members = $1, updated_at = NOW() WHERE id = $2',
      [newTeamMembers, projectId]
    );

    res.status(201).json({
      success: true,
      message: 'Team member added',
      data: {
        id: userId || `team_${Date.now()}`,
        name,
        email,
        phone,
        role
      }
    });
  } catch (error) {
    console.error('❌ Add team member error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add team member',
      error: error.message
    });
  }
});

// Remove team member from project
router.delete('/projects/:projectId/team/:memberId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { memberName } = req.body;

    // Get current team members
    const projectResult = await executeQuery(
      'SELECT team_members FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const currentTeam = projectResult.rows[0].team_members || '';
    const teamArray = currentTeam.split(',').map(m => m.trim()).filter(m => m);
    
    // Remove the member (by index or name)
    const updatedTeam = teamArray
      .filter((m, idx) => idx.toString() !== req.params.memberId && m !== memberName)
      .join(',');

    await executeQuery(
      'UPDATE projects SET team_members = $1, updated_at = NOW() WHERE id = $2',
      [updatedTeam, projectId]
    );

    res.status(200).json({
      success: true,
      message: 'Team member removed'
    });
  } catch (error) {
    console.error('❌ Remove team member error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team member',
      error: error.message
    });
  }
});

module.exports = router;
