// backend/routes/vendor-payments-routes.js
import express from 'express';
import { db } from '../lib/db.js';
import { vendor_payments, vendor_contracts, vendors, projects, users } from '../lib/schema.js';
import { eq, and, or, ilike, desc, asc, gte, lte } from 'drizzle-orm';

const router = express.Router();

// Get all payments with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      vendorId, 
      contractId,
      projectId,
      paymentType,
      status,
      paymentMethod,
      startDate,
      endDate,
      dueDateStart,
      dueDateEnd,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(or(
        ilike(vendor_payments.description, `%${search}%`),
        ilike(vendor_payments.transactionId, `%${search}%`),
        ilike(vendor_payments.receiptUrl, `%${search}%`)
      ));
    }
    
    if (vendorId) {
      whereConditions.push(eq(vendor_payments.vendorId, vendorId));
    }
    
    if (contractId) {
      whereConditions.push(eq(vendor_payments.contractId, contractId));
    }
    
    if (projectId) {
      whereConditions.push(eq(vendor_payments.projectId, projectId));
    }
    
    if (paymentType) {
      whereConditions.push(eq(vendor_payments.paymentType, paymentType));
    }
    
    if (status) {
      whereConditions.push(eq(vendor_payments.status, status));
    }

    if (paymentMethod) {
      whereConditions.push(eq(vendor_payments.paymentMethod, paymentMethod));
    }

    if (startDate) {
      whereConditions.push(gte(vendor_payments.paidDate, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(vendor_payments.paidDate, new Date(endDate)));
    }

    if (dueDateStart) {
      whereConditions.push(gte(vendor_payments.dueDate, new Date(dueDateStart)));
    }

    if (dueDateEnd) {
      whereConditions.push(lte(vendor_payments.dueDate, new Date(dueDateEnd)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Resolve sort column safely
    const sortColumnMap = {
      dueDate: vendor_payments.dueDate,
      paidDate: vendor_payments.paidDate,
      amount: vendor_payments.amount,
      createdAt: vendor_payments.createdAt,
      updatedAt: vendor_payments.updatedAt,
      status: vendor_payments.status,
    };
    const sortColumn = sortColumnMap[sortBy] || vendor_payments.dueDate;

    // Get payments with related data
    const payments = await db.select({
      // Payment fields
      id: vendor_payments.id,
      vendorId: vendor_payments.vendorId,
      contractId: vendor_payments.contractId,
      projectId: vendor_payments.projectId,
      paymentType: vendor_payments.paymentType,
      amount: vendor_payments.amount,
      currency: vendor_payments.currency,
      dueDate: vendor_payments.dueDate,
      paidDate: vendor_payments.paidDate,
      installmentNumber: vendor_payments.installmentNumber,
      totalInstallments: vendor_payments.totalInstallments,
      status: vendor_payments.status,
      paymentMethod: vendor_payments.paymentMethod,
      transactionId: vendor_payments.transactionId,
      receiptUrl: vendor_payments.receiptUrl,
      approvedBy: vendor_payments.approvedBy,
      approvedAt: vendor_payments.approvedAt,
      rejectedReason: vendor_payments.rejectedReason,
      description: vendor_payments.description,
      notes: vendor_payments.notes,
      createdAt: vendor_payments.createdAt,
      updatedAt: vendor_payments.updatedAt,
      // Vendor details
      vendorName: vendors.name,
      vendorCode: vendors.code,
      vendorType: vendors.type,
      // Contract details
      contractTitle: vendor_contracts.title,
      contractNumber: vendor_contracts.contractNumber,
      // Project details
      projectName: projects.name,
      projectCode: projects.code
    })
    .from(vendor_payments)
    .leftJoin(vendors, eq(vendor_payments.vendorId, vendors.id))
    .leftJoin(vendor_contracts, eq(vendor_payments.contractId, vendor_contracts.id))
    .leftJoin(projects, eq(vendor_payments.projectId, projects.id))
    .where(whereClause)
    .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalCount = await db.select({ count: vendor_payments.id })
      .from(vendor_payments)
      .where(whereClause);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.length,
        pages: Math.ceil(totalCount.length / limit)
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await db.select({
      // Payment fields
      id: vendor_payments.id,
      vendorId: vendor_payments.vendorId,
      contractId: vendor_payments.contractId,
      projectId: vendor_payments.projectId,
      paymentType: vendor_payments.paymentType,
      amount: vendor_payments.amount,
      currency: vendor_payments.currency,
      dueDate: vendor_payments.dueDate,
      paidDate: vendor_payments.paidDate,
      installmentNumber: vendor_payments.installmentNumber,
      totalInstallments: vendor_payments.totalInstallments,
      status: vendor_payments.status,
      paymentMethod: vendor_payments.paymentMethod,
      transactionId: vendor_payments.transactionId,
      receiptUrl: vendor_payments.receiptUrl,
      approvedBy: vendor_payments.approvedBy,
      approvedAt: vendor_payments.approvedAt,
      rejectedReason: vendor_payments.rejectedReason,
      description: vendor_payments.description,
      notes: vendor_payments.notes,
      createdAt: vendor_payments.createdAt,
      updatedAt: vendor_payments.updatedAt,
      // Vendor details
      vendorName: vendors.name,
      vendorCode: vendors.code,
      vendorType: vendors.type,
      vendorContactPerson: vendors.contactPerson,
      vendorEmail: vendors.email,
      vendorPhone: vendors.phone,
      vendorBankAccount: vendors.bankAccount,
      vendorBankName: vendors.bankName,
      // Contract details
      contractTitle: vendor_contracts.title,
      contractNumber: vendor_contracts.contractNumber,
      contractValue: vendor_contracts.value,
      // Project details
      projectName: projects.name,
      projectCode: projects.code,
      projectStatus: projects.status,
      // Approver details
      approverName: users.name
    })
    .from(vendor_payments)
    .leftJoin(vendors, eq(vendor_payments.vendorId, vendors.id))
    .leftJoin(vendor_contracts, eq(vendor_payments.contractId, vendor_contracts.id))
    .leftJoin(projects, eq(vendor_payments.projectId, projects.id))
    .leftJoin(users, eq(vendor_payments.approvedBy, users.id))
    .where(eq(vendor_payments.id, id))
    .limit(1);

    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment: payment[0] });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new payment
router.post('/', async (req, res) => {
  try {
    const {
      vendorId,
      contractId,
      projectId,
      paymentType,
      amount,
      currency = 'THB',
      dueDate,
      installmentNumber,
      totalInstallments,
      paymentMethod,
      description,
      notes
    } = req.body;

    // Validate required fields
    if (!vendorId || !paymentType || !amount || !dueDate) {
      return res.status(400).json({ 
        error: 'Vendor ID, payment type, amount, and due date are required' 
      });
    }

    // Check if vendor exists
    const vendorExists = await db.select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (vendorExists.length === 0) {
      return res.status(400).json({ error: 'Vendor not found' });
    }

    // Check if contract exists (if provided)
    if (contractId) {
      const contractExists = await db.select()
        .from(vendor_contracts)
        .where(eq(vendor_contracts.id, contractId))
        .limit(1);

      if (contractExists.length === 0) {
        return res.status(400).json({ error: 'Contract not found' });
      }
    }

    // Check if project exists (if provided)
    if (projectId) {
      const projectExists = await db.select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (projectExists.length === 0) {
        return res.status(400).json({ error: 'Project not found' });
      }
    }

    const newPayment = {
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vendorId,
      contractId: contractId || null,
      projectId: projectId || null,
      paymentType,
      amount: parseFloat(amount),
      currency,
      dueDate: new Date(dueDate),
      paidDate: null,
      installmentNumber: installmentNumber ? parseInt(installmentNumber) : null,
      totalInstallments: totalInstallments ? parseInt(totalInstallments) : null,
      status: 'pending',
      paymentMethod: paymentMethod || null,
      transactionId: null,
      receiptUrl: null,
      approvedBy: null,
      approvedAt: null,
      rejectedReason: null,
      description: description || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.insert(vendor_payments)
      .values(newPayment)
      .returning();

    res.status(201).json({
      message: 'Payment created successfully',
      payment: result[0]
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if payment exists
    const existingPayment = await db.select()
      .from(vendor_payments)
      .where(eq(vendor_payments.id, id))
      .limit(1);

    if (existingPayment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Cannot modify approved or paid payments
    if (existingPayment[0].status === 'paid' || existingPayment[0].status === 'approved') {
      return res.status(400).json({ 
        error: 'Cannot modify approved or paid payment' 
      });
    }

    // Prepare update data
    const paymentUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    // Remove fields that shouldn't be updated directly
    delete paymentUpdate.id;
    delete paymentUpdate.createdAt;
    delete paymentUpdate.approvedBy;
    delete paymentUpdate.approvedAt;
    delete paymentUpdate.paidDate;
    delete paymentUpdate.rejectedReason;

    // Convert date and number fields
    if (paymentUpdate.dueDate) {
      paymentUpdate.dueDate = new Date(paymentUpdate.dueDate);
    }
    if (paymentUpdate.amount) {
      paymentUpdate.amount = parseFloat(paymentUpdate.amount);
    }
    if (paymentUpdate.installmentNumber) {
      paymentUpdate.installmentNumber = parseInt(paymentUpdate.installmentNumber);
    }
    if (paymentUpdate.totalInstallments) {
      paymentUpdate.totalInstallments = parseInt(paymentUpdate.totalInstallments);
    }

    const result = await db.update(vendor_payments)
      .set(paymentUpdate)
      .where(eq(vendor_payments.id, id))
      .returning();

    res.json({
      message: 'Payment updated successfully',
      payment: result[0]
    });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve payment
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, paymentMethod, transactionId, receiptUrl } = req.body;

    // Check if payment exists
    const existingPayment = await db.select()
      .from(vendor_payments)
      .where(eq(vendor_payments.id, id))
      .limit(1);

    if (existingPayment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (existingPayment[0].status !== 'pending') {
      return res.status(400).json({ 
        error: 'Payment is already processed' 
      });
    }

    // Update payment to approved status
    const result = await db.update(vendor_payments)
      .set({ 
        status: 'approved',
        paymentMethod: paymentMethod || existingPayment[0].paymentMethod,
        transactionId: transactionId || null,
        receiptUrl: receiptUrl || null,
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(vendor_payments.id, id))
      .returning();

    res.json({
      message: 'Payment approved successfully',
      payment: result[0]
    });

  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark payment as paid
router.put('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { paidDate = new Date() } = req.body;

    // Check if payment exists
    const existingPayment = await db.select()
      .from(vendor_payments)
      .where(eq(vendor_payments.id, id))
      .limit(1);

    if (existingPayment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (existingPayment[0].status !== 'approved') {
      return res.status(400).json({ 
        error: 'Payment must be approved before marking as paid' 
      });
    }

    // Update payment to paid status
    const result = await db.update(vendor_payments)
      .set({ 
        status: 'paid',
        paidDate: new Date(paidDate),
        updatedAt: new Date()
      })
      .where(eq(vendor_payments.id, id))
      .returning();

    res.json({
      message: 'Payment marked as paid successfully',
      payment: result[0]
    });

  } catch (error) {
    console.error('Mark payment as paid error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject payment
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectedReason } = req.body;

    if (!rejectedReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Check if payment exists
    const existingPayment = await db.select()
      .from(vendor_payments)
      .where(eq(vendor_payments.id, id))
      .limit(1);

    if (existingPayment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (existingPayment[0].status !== 'pending') {
      return res.status(400).json({ 
        error: 'Cannot reject processed payment' 
      });
    }

    // Update payment to rejected status
    const result = await db.update(vendor_payments)
      .set({ 
        status: 'rejected',
        rejectedReason,
        updatedAt: new Date()
      })
      .where(eq(vendor_payments.id, id))
      .returning();

    res.json({
      message: 'Payment rejected successfully',
      payment: result[0]
    });

  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payment exists
    const existingPayment = await db.select()
      .from(vendor_payments)
      .where(eq(vendor_payments.id, id))
      .limit(1);

    if (existingPayment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Only allow deletion of pending payments
    if (existingPayment[0].status !== 'pending') {
      return res.status(400).json({ 
        error: 'Can only delete pending payments' 
      });
    }

    await db.delete(vendor_payments)
      .where(eq(vendor_payments.id, id));

    res.json({ message: 'Payment deleted successfully' });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Payments by status
    const paymentsByStatus = await db.select({
      status: vendor_payments.status,
      count: vendor_payments.id,
      totalAmount: vendor_payments.amount
    })
    .from(vendor_payments)
    .groupBy(vendor_payments.status);

    // Payments by type
    const paymentsByType = await db.select({
      paymentType: vendor_payments.paymentType,
      count: vendor_payments.id,
      totalAmount: vendor_payments.amount
    })
    .from(vendor_payments)
    .groupBy(vendor_payments.paymentType);

    // Overdue payments
    const today = new Date();
    const overduePayments = await db.select({
      id: vendor_payments.id,
      description: vendor_payments.description,
      amount: vendor_payments.amount,
      dueDate: vendor_payments.dueDate,
      vendorName: vendors.name
    })
    .from(vendor_payments)
    .leftJoin(vendors, eq(vendor_payments.vendorId, vendors.id))
    .where(and(
      eq(vendor_payments.status, 'pending'),
      lte(vendor_payments.dueDate, today)
    ))
    .orderBy(asc(vendor_payments.dueDate));

    // Upcoming payments (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingPayments = await db.select({
      id: vendor_payments.id,
      description: vendor_payments.description,
      amount: vendor_payments.amount,
      dueDate: vendor_payments.dueDate,
      vendorName: vendors.name
    })
    .from(vendor_payments)
    .leftJoin(vendors, eq(vendor_payments.vendorId, vendors.id))
    .where(and(
      eq(vendor_payments.status, 'pending'),
      gte(vendor_payments.dueDate, today),
      lte(vendor_payments.dueDate, sevenDaysFromNow)
    ))
    .orderBy(asc(vendor_payments.dueDate));

    res.json({
      paymentsByStatus,
      paymentsByType,
      overduePayments,
      upcomingPayments
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
