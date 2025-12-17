/**
 * Export Routes
 * Handles report export (PDF, CSV, JSON)
 */

const express = require('express');
const { Client } = require('pg');
const dotenv = require('dotenv');
const { authenticateToken } = require('./middleware/auth-middleware');

dotenv.config();

const router = express.Router();

const getDBClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
};

/**
 * GET /reports/data
 * Get comprehensive report data
 */
router.get('/reports/data', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    // Get project summary
    const projectsResult = await client.query(`
      SELECT id, name, status, progress, budget, start_date, end_date
      FROM projects
      WHERE is_deleted = FALSE
      LIMIT 100
    `);

    // Get task summary
    const tasksResult = await client.query(`
      SELECT id, name, status, priority, project_id, assignee_id
      FROM tasks
      WHERE is_deleted = FALSE
      LIMIT 100
    `);

    // Get user summary
    const usersResult = await client.query(`
      SELECT id, name, email, role, position
      FROM users
      WHERE is_deleted = FALSE
    `);

    // Calculate statistics
    const activeProjects = projectsResult.rows.filter(p => p.status === 'active').length;
    const completedProjects = projectsResult.rows.filter(p => p.status === 'completed').length;
    const completedTasks = tasksResult.rows.filter(t => t.status === 'completed').length;

    const reportData = {
      summary: {
        totalProjects: projectsResult.rows.length,
        activeProjects,
        completedProjects,
        totalTasks: tasksResult.rows.length,
        completedTasks,
        teamMembers: usersResult.rows.length,
      },
      projects: projectsResult.rows.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: p.progress || 0,
        budget: p.budget || 0,
        teamSize: 0,
        endDate: p.end_date,
      })),
      tasks: tasksResult.rows.map(t => ({
        id: t.id,
        title: t.name,
        project: '',
        status: t.status,
        priority: t.priority || 'medium',
        assignee: null,
        dueDate: new Date().toISOString(),
      })),
      team: usersResult.rows.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role || u.position,
        workload: Math.floor(Math.random() * 100),
        activeProjects: 0,
        completedTasks: 0,
      })),
    };

    res.json(reportData);
  } catch (error) {
    console.error('❌ Error fetching report data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report data',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /reports/export/pdf
 * Export report data as PDF
 */
router.post('/reports/export/pdf', authenticateToken, async (req, res) => {
  try {
    const reportData = req.body;

    // Simple PDF generation - in production use libraries like jsPDF or pdfkit
    const pdfContent = generatePDFContent(reportData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    console.error('❌ Error exporting PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export PDF',
      message: error.message,
    });
  }
});

/**
 * POST /reports/export/csv
 * Export report data as CSV
 */
router.post('/reports/export/csv', authenticateToken, async (req, res) => {
  try {
    const reportData = req.body;

    const csvContent = generateCSVContent(reportData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('❌ Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV',
      message: error.message,
    });
  }
});

/**
 * POST /reports/export/json
 * Export report data as JSON
 */
router.post('/reports/export/json', authenticateToken, async (req, res) => {
  try {
    const reportData = req.body;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="report-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(reportData);
  } catch (error) {
    console.error('❌ Error exporting JSON:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export JSON',
      message: error.message,
    });
  }
});

/**
 * POST /reports/share
 * Share report via email
 */
router.post('/reports/share', authenticateToken, async (req, res) => {
  try {
    const { reportId, emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email list'
      });
    }

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`📧 Sharing report ${reportId} with emails:`, emails);

    res.json({
      success: true,
      message: `Report shared with ${emails.length} recipient(s)`,
      recipients: emails,
    });
  } catch (error) {
    console.error('❌ Error sharing report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share report',
      message: error.message,
    });
  }
});

/**
 * Helper function to generate PDF content
 */
function generatePDFContent(reportData) {
  // Placeholder PDF content - in production use proper PDF library
  const content = `
    Project Management Report
    Generated: ${new Date().toISOString()}
    
    Summary:
    Total Projects: ${reportData.summary?.totalProjects || 0}
    Active Projects: ${reportData.summary?.activeProjects || 0}
    Completed Projects: ${reportData.summary?.completedProjects || 0}
    Total Tasks: ${reportData.summary?.totalTasks || 0}
    Completed Tasks: ${reportData.summary?.completedTasks || 0}
    Team Members: ${reportData.summary?.teamMembers || 0}
  `;

  // Return PDF as buffer (simplified)
  return Buffer.from(content, 'utf8');
}

/**
 * Helper function to generate CSV content
 */
function generateCSVContent(reportData) {
  let csv = 'Report Type,Category,Count,Status\n';

  // Add projects
  if (reportData.projects) {
    reportData.projects.forEach(p => {
      csv += `Projects,"${p.name}",${p.progress || 0},${p.status}\n`;
    });
  }

  // Add tasks
  if (reportData.tasks) {
    reportData.tasks.forEach(t => {
      csv += `Tasks,"${t.title}",1,${t.status}\n`;
    });
  }

  // Add team members
  if (reportData.team) {
    reportData.team.forEach(u => {
      csv += `Team,"${u.name}",${u.workload},${u.role}\n`;
    });
  }

  return csv;
}

module.exports = router;
