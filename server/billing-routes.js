/**
 * Project Billing API Routes
 * Handle CRUD operations for billing phases, invoices, and payment tracking
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');

// ==================== BILLING PHASES ====================

// Get all billing phases for a project
router.get('/projects/:projectId/billing-phases', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT * FROM project_billing_phases
      WHERE project_id = $1 AND is_deleted = false
    `;
    const params = [projectId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY phase_number ASC`;

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('❌ Get billing phases error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing phases',
      error: error.message,
    });
  }
});

// Get single billing phase
router.get('/billing-phases/:phaseId', async (req, res) => {
  try {
    const { phaseId } = req.params;

    const result = await executeQuery(
      'SELECT * FROM project_billing_phases WHERE id = $1 AND is_deleted = false',
      [phaseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Billing phase not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Get billing phase error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing phase',
      error: error.message,
    });
  }
});

// Create new billing phase
router.post('/projects/:projectId/billing-phases', async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      phase_number,
      description,
      amount,
      percentage_of_total,
      currency = 'THB',
      planned_delivery_date,
      actual_delivery_date,
      planned_payment_date,
      actual_payment_date,
      status = 'pending',
      deliverables,
      notes,
    } = req.body;

    // Validate required fields
    if (!phase_number || !description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phase number, description, and amount are required',
      });
    }

    // Check if project exists
    const projectCheck = await executeQuery(
      'SELECT id FROM projects WHERE id = $1 AND is_deleted = false',
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if phase number already exists
    const phaseCheck = await executeQuery(
      'SELECT id FROM project_billing_phases WHERE project_id = $1 AND phase_number = $2 AND is_deleted = false',
      [projectId, phase_number]
    );

    if (phaseCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Phase number already exists for this project',
      });
    }

    const query = `
      INSERT INTO project_billing_phases (
        project_id, phase_number, description, amount, percentage_of_total,
        currency, planned_delivery_date, actual_delivery_date,
        planned_payment_date, actual_payment_date, status, deliverables, notes,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `;

    const result = await executeQuery(query, [
      projectId,
      phase_number,
      description,
      amount,
      percentage_of_total || null,
      currency,
      planned_delivery_date || null,
      actual_delivery_date || null,
      planned_payment_date || null,
      actual_payment_date || null,
      status,
      deliverables || null,
      notes || null,
    ]);

    res.status(201).json({
      success: true,
      message: 'Billing phase created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Create billing phase error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create billing phase',
      error: error.message,
    });
  }
});

// Update billing phase
router.put('/billing-phases/:phaseId', async (req, res) => {
  try {
    const { phaseId } = req.params;
    const {
      description,
      amount,
      percentage_of_total,
      planned_delivery_date,
      actual_delivery_date,
      planned_payment_date,
      actual_payment_date,
      status,
      deliverables,
      notes,
    } = req.body;

    // Check if phase exists
    const phaseCheck = await executeQuery(
      'SELECT id FROM project_billing_phases WHERE id = $1 AND is_deleted = false',
      [phaseId]
    );

    if (phaseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Billing phase not found',
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    const fields = {
      description,
      amount,
      percentage_of_total,
      planned_delivery_date,
      actual_delivery_date,
      planned_payment_date,
      actual_payment_date,
      status,
      deliverables,
      notes,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = NOW()`);
    params.push(phaseId);

    const query = `
      UPDATE project_billing_phases
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      message: 'Billing phase updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Update billing phase error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update billing phase',
      error: error.message,
    });
  }
});

// Delete billing phase
router.delete('/billing-phases/:phaseId', async (req, res) => {
  try {
    const { phaseId } = req.params;

    const result = await executeQuery(
      'UPDATE project_billing_phases SET is_deleted = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [phaseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Billing phase not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Billing phase deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Delete billing phase error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete billing phase',
      error: error.message,
    });
  }
});

// ==================== INVOICES ====================

// Get invoices by project
router.get('/projects/:projectId/invoices', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT 
        pii.*,
        pbp.phase_number,
        pbp.description AS phase_description
      FROM project_invoices_detailed pii
      JOIN project_billing_phases pbp ON pii.billing_phase_id = pbp.id
      WHERE pii.project_id = $1 AND pii.is_deleted = false
    `;
    const params = [projectId];

    if (status) {
      query += ` AND pii.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY pbp.phase_number ASC`;

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('❌ Get invoices error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message,
    });
  }
});

// Get invoice details
router.get('/invoices/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const result = await executeQuery(
      'SELECT * FROM project_invoices_detailed WHERE id = $1 AND is_deleted = false',
      [invoiceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Get invoice error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message,
    });
  }
});

// Create invoice
router.post('/billing-phases/:phaseId/invoices', async (req, res) => {
  try {
    const { phaseId } = req.params;
    const {
      invoice_number,
      subtotal,
      tax_rate = 0,
      due_date,
      payment_method,
      notes,
    } = req.body;

    // Validate required fields
    if (!invoice_number || !subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number and subtotal are required',
      });
    }

    // Get billing phase
    const phaseQuery = await executeQuery(
      'SELECT * FROM project_billing_phases WHERE id = $1 AND is_deleted = false',
      [phaseId]
    );

    if (phaseQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Billing phase not found',
      });
    }

    const phase = phaseQuery.rows[0];
    const tax_amount = (subtotal * tax_rate) / 100;
    const total_amount = subtotal + tax_amount;

    const query = `
      INSERT INTO project_invoices_detailed (
        project_id, billing_phase_id, invoice_number, subtotal, tax_amount,
        tax_rate, total_amount, balance_due, due_date, payment_method, notes,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `;

    const result = await executeQuery(query, [
      phase.project_id,
      phaseId,
      invoice_number,
      subtotal,
      tax_amount,
      tax_rate,
      total_amount,
      total_amount,
      due_date || null,
      payment_method || null,
      notes || null,
    ]);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Create invoice error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message,
    });
  }
});

// Record payment
router.post('/invoices/:invoiceId/payment', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const {
      amount_paid,
      paid_date,
      payment_method,
      transaction_reference,
      notes,
    } = req.body;

    if (!amount_paid || amount_paid <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required',
      });
    }

    // Get current invoice
    const invoiceQuery = await executeQuery(
      'SELECT * FROM project_invoices_detailed WHERE id = $1 AND is_deleted = false',
      [invoiceId]
    );

    if (invoiceQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const invoice = invoiceQuery.rows[0];
    const new_amount_paid = invoice.amount_paid + amount_paid;
    const new_balance_due = Math.max(0, invoice.total_amount - new_amount_paid);
    const new_status = new_balance_due === 0 ? 'paid' : invoice.status;

    const query = `
      UPDATE project_invoices_detailed
      SET amount_paid = $1,
          balance_due = $2,
          status = $3,
          paid_date = COALESCE($4, paid_date),
          payment_method = COALESCE($5, payment_method),
          transaction_reference = COALESCE($6, transaction_reference),
          notes = COALESCE($7, notes),
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const result = await executeQuery(query, [
      new_amount_paid,
      new_balance_due,
      new_status,
      paid_date || null,
      payment_method || null,
      transaction_reference || null,
      notes || null,
      invoiceId,
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Record payment error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message,
    });
  }
});

// ==================== BILLING SUMMARY ====================

// Get billing summary for project
router.get('/projects/:projectId/billing-summary', async (req, res) => {
  try {
    const { projectId } = req.params;

    const query = `
      SELECT 
        p.id AS project_id,
        p.code AS project_code,
        p.name AS project_name,
        p.contract_amount AS total_contract_value,
        COUNT(DISTINCT pbp.id) AS total_phases,
        SUM(pbp.amount) AS total_billing_amount,
        SUM(CASE WHEN pbp.status = 'pending' THEN pbp.amount ELSE 0 END) AS pending_amount,
        SUM(CASE WHEN pbp.status IN ('invoiced', 'paid') THEN pbp.amount ELSE 0 END) AS invoiced_amount,
        SUM(CASE WHEN pbp.status = 'paid' THEN pbp.amount ELSE 0 END) AS paid_amount,
        SUM(CASE WHEN pbp.status = 'overdue' THEN pbp.amount ELSE 0 END) AS overdue_amount,
        COUNT(CASE WHEN pbp.status = 'delivered' THEN 1 END) AS delivered_phases,
        COUNT(CASE WHEN pbp.status = 'paid' THEN 1 END) AS paid_phases,
        SUM(pii.amount_paid) AS total_paid_invoices,
        SUM(pii.balance_due) AS total_balance_due
      FROM projects p
      LEFT JOIN project_billing_phases pbp ON p.id = pbp.project_id AND pbp.is_deleted = FALSE
      LEFT JOIN project_invoices_detailed pii ON pbp.id = pii.billing_phase_id AND pii.is_deleted = FALSE
      WHERE p.id = $1 AND p.is_deleted = FALSE
      GROUP BY p.id, p.code, p.name, p.contract_amount
    `;

    const result = await executeQuery(query, [projectId]);

    res.status(200).json({
      success: true,
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error('❌ Get billing summary error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing summary',
      error: error.message,
    });
  }
});

// Get overdue invoices
router.get('/invoices/overdue', async (req, res) => {
  try {
    const query = `
      SELECT 
        pii.*,
        pbp.phase_number,
        pbp.description,
        p.name AS project_name,
        p.code AS project_code,
        EXTRACT(DAY FROM (NOW() - pii.due_date)) AS days_overdue
      FROM project_invoices_detailed pii
      JOIN project_billing_phases pbp ON pii.billing_phase_id = pbp.id
      JOIN projects p ON pii.project_id = p.id
      WHERE pii.due_date < NOW() 
        AND pii.status != 'paid'
        AND pii.is_deleted = FALSE
        AND pbp.is_deleted = FALSE
        AND p.is_deleted = FALSE
      ORDER BY pii.due_date ASC
    `;

    const result = await executeQuery(query, []);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('❌ Get overdue invoices error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue invoices',
      error: error.message,
    });
  }
});

module.exports = router;
