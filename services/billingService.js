/**
 * Billing Service
 * Handles business logic for project billing and invoicing
 */

const { executeQuery } = require('../database/neon-connection');

class BillingService {
  /**
   * Get all billing phases for a project
   */
  static async getBillingPhases(projectId, filters = {}) {
    try {
      let query = `
        SELECT * FROM project_billing_phases
        WHERE project_id = $1 AND is_deleted = false
      `;
      const params = [projectId];

      if (filters.status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(filters.status);
      }

      query += ` ORDER BY phase_number ASC`;

      const result = await executeQuery(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting billing phases:', error.message);
      throw error;
    }
  }

  /**
   * Create billing phase
   */
  static async createBillingPhase(projectId, phaseData) {
    try {
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
      } = phaseData;

      // Validate
      if (!phase_number || !description || !amount) {
        throw new Error('Phase number, description, and amount are required');
      }

      // Check project exists
      const projectCheck = await executeQuery(
        'SELECT id FROM projects WHERE id = $1 AND is_deleted = false',
        [projectId]
      );

      if (projectCheck.rows.length === 0) {
        throw new Error('Project not found');
      }

      // Check phase number doesn't exist
      const phaseCheck = await executeQuery(
        'SELECT id FROM project_billing_phases WHERE project_id = $1 AND phase_number = $2 AND is_deleted = false',
        [projectId, phase_number]
      );

      if (phaseCheck.rows.length > 0) {
        throw new Error('Phase number already exists for this project');
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

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating billing phase:', error.message);
      throw error;
    }
  }

  /**
   * Update billing phase
   */
  static async updateBillingPhase(phaseId, updateData) {
    try {
      const updates = [];
      const params = [];
      let paramIndex = 1;

      const allowedFields = [
        'description',
        'amount',
        'percentage_of_total',
        'planned_delivery_date',
        'actual_delivery_date',
        'planned_payment_date',
        'actual_payment_date',
        'status',
        'deliverables',
        'notes',
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
      params.push(phaseId);

      const query = `
        UPDATE project_billing_phases
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex} AND is_deleted = false
        RETURNING *
      `;

      const result = await executeQuery(query, params);

      if (result.rows.length === 0) {
        throw new Error('Billing phase not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating billing phase:', error.message);
      throw error;
    }
  }

  /**
   * Delete billing phase
   */
  static async deleteBillingPhase(phaseId) {
    try {
      const query = `
        UPDATE project_billing_phases 
        SET is_deleted = true, updated_at = NOW() 
        WHERE id = $1 
        RETURNING *
      `;

      const result = await executeQuery(query, [phaseId]);

      if (result.rows.length === 0) {
        throw new Error('Billing phase not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error deleting billing phase:', error.message);
      throw error;
    }
  }

  /**
   * Create invoice for a billing phase
   */
  static async createInvoice(phaseId, invoiceData) {
    try {
      const {
        invoice_number,
        subtotal,
        tax_rate = 0,
        due_date,
        payment_method,
        notes,
      } = invoiceData;

      if (!invoice_number || !subtotal) {
        throw new Error('Invoice number and subtotal are required');
      }

      // Get phase and project
      const phaseQuery = await executeQuery(
        'SELECT * FROM project_billing_phases WHERE id = $1 AND is_deleted = false',
        [phaseId]
      );

      if (phaseQuery.rows.length === 0) {
        throw new Error('Billing phase not found');
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

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating invoice:', error.message);
      throw error;
    }
  }

  /**
   * Record payment
   */
  static async recordPayment(invoiceId, paymentData) {
    try {
      const {
        amount_paid,
        paid_date,
        payment_method,
        transaction_reference,
        notes,
      } = paymentData;

      if (!amount_paid || amount_paid <= 0) {
        throw new Error('Valid payment amount is required');
      }

      // Get invoice
      const invoiceQuery = await executeQuery(
        'SELECT * FROM project_invoices_detailed WHERE id = $1 AND is_deleted = false',
        [invoiceId]
      );

      if (invoiceQuery.rows.length === 0) {
        throw new Error('Invoice not found');
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

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error recording payment:', error.message);
      throw error;
    }
  }

  /**
   * Get billing summary
   */
  static async getBillingSummary(projectId) {
    try {
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
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting billing summary:', error.message);
      throw error;
    }
  }

  /**
   * Get overdue invoices
   */
  static async getOverdueInvoices() {
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
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting overdue invoices:', error.message);
      throw error;
    }
  }

  /**
   * Calculate percentage of total
   */
  static calculatePercentage(amount, totalAmount) {
    if (totalAmount === 0) return 0;
    return (amount / totalAmount) * 100;
  }

  /**
   * Validate billing phases total percentage
   */
  static async validatePhasePercentages(projectId) {
    try {
      const query = `
        SELECT COALESCE(SUM(percentage_of_total), 0) AS total_percentage
        FROM project_billing_phases
        WHERE project_id = $1 AND is_deleted = false
      `;

      const result = await executeQuery(query, [projectId]);
      const totalPercentage = parseFloat(result.rows[0].total_percentage || 0);

      return {
        valid: Math.abs(totalPercentage - 100) < 0.01 || totalPercentage === 0,
        totalPercentage,
      };
    } catch (error) {
      console.error('❌ Error validating phases:', error.message);
      throw error;
    }
  }
}

module.exports = BillingService;
