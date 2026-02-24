// backend/routes/vendor-contracts-routes.js
import express from 'express';
import { db } from '../lib/db.js';
import { vendor_contracts, vendors, projects, vendor_payments } from '../lib/schema.js';
import { eq, and, or, ilike, desc, asc, gte, lte } from 'drizzle-orm';

const router = express.Router();

// Get all contracts with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      vendorId, 
      projectId,
      type,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(or(
        ilike(vendor_contracts.title, `%${search}%`),
        ilike(vendor_contracts.contractNumber, `%${search}%`),
        ilike(vendor_contracts.description, `%${search}%`)
      ));
    }
    
    if (vendorId) {
      whereConditions.push(eq(vendor_contracts.vendorId, vendorId));
    }
    
    if (projectId) {
      whereConditions.push(eq(vendor_contracts.projectId, projectId));
    }
    
    if (type) {
      whereConditions.push(eq(vendor_contracts.type, type));
    }
    
    if (status) {
      whereConditions.push(eq(vendor_contracts.status, status));
    }

    if (startDate) {
      whereConditions.push(gte(vendor_contracts.startDate, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(vendor_contracts.endDate, new Date(endDate)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Safe sort column mapping
    const allowedSortColumns = {
      createdAt: vendor_contracts.createdAt,
      updatedAt: vendor_contracts.updatedAt,
      startDate: vendor_contracts.startDate,
      endDate: vendor_contracts.endDate,
      title: vendor_contracts.title,
      contractNumber: vendor_contracts.contractNumber,
      status: vendor_contracts.status,
      value: vendor_contracts.value
    };
    const sortColumn = allowedSortColumns[sortBy] || vendor_contracts.createdAt;

    // Get contracts with vendor and project details
    const contracts = await db.select({
      // Contract fields
      id: vendor_contracts.id,
      vendorId: vendor_contracts.vendorId,
      projectId: vendor_contracts.projectId,
      contractNumber: vendor_contracts.contractNumber,
      title: vendor_contracts.title,
      description: vendor_contracts.description,
      type: vendor_contracts.type,
      startDate: vendor_contracts.startDate,
      endDate: vendor_contracts.endDate,
      value: vendor_contracts.value,
      currency: vendor_contracts.currency,
      paymentTerms: vendor_contracts.paymentTerms,
      paymentSchedule: vendor_contracts.paymentSchedule,
      status: vendor_contracts.status,
      signedDate: vendor_contracts.signedDate,
      signedBy: vendor_contracts.signedBy,
      notes: vendor_contracts.notes,
      createdAt: vendor_contracts.createdAt,
      updatedAt: vendor_contracts.updatedAt,
      // Vendor details
      vendorName: vendors.name,
      vendorCode: vendors.code,
      vendorType: vendors.type,
      vendorCategory: vendors.category,
      // Project details
      projectName: projects.name,
      projectCode: projects.code
    })
    .from(vendor_contracts)
    .leftJoin(vendors, eq(vendor_contracts.vendorId, vendors.id))
    .leftJoin(projects, eq(vendor_contracts.projectId, projects.id))
    .where(whereClause)
    .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalCount = await db.select({ count: vendor_contracts.id })
      .from(vendor_contracts)
      .where(whereClause);

    res.json({
      contracts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.length,
        pages: Math.ceil(totalCount.length / limit)
      }
    });

  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contract by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await db.select({
      // Contract fields
      id: vendor_contracts.id,
      vendorId: vendor_contracts.vendorId,
      projectId: vendor_contracts.projectId,
      contractNumber: vendor_contracts.contractNumber,
      title: vendor_contracts.title,
      description: vendor_contracts.description,
      type: vendor_contracts.type,
      startDate: vendor_contracts.startDate,
      endDate: vendor_contracts.endDate,
      value: vendor_contracts.value,
      currency: vendor_contracts.currency,
      paymentTerms: vendor_contracts.paymentTerms,
      paymentSchedule: vendor_contracts.paymentSchedule,
      status: vendor_contracts.status,
      signedDate: vendor_contracts.signedDate,
      signedBy: vendor_contracts.signedBy,
      notes: vendor_contracts.notes,
      createdAt: vendor_contracts.createdAt,
      updatedAt: vendor_contracts.updatedAt,
      // Vendor details
      vendorName: vendors.name,
      vendorCode: vendors.code,
      vendorType: vendors.type,
      vendorCategory: vendors.category,
      vendorContactPerson: vendors.contactPerson,
      vendorEmail: vendors.email,
      vendorPhone: vendors.phone,
      // Project details
      projectName: projects.name,
      projectCode: projects.code,
      projectStatus: projects.status
    })
    .from(vendor_contracts)
    .leftJoin(vendors, eq(vendor_contracts.vendorId, vendors.id))
    .leftJoin(projects, eq(vendor_contracts.projectId, projects.id))
    .where(eq(vendor_contracts.id, id))
    .limit(1);

    if (contract.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Get contract payments
    const payments = await db.select()
      .from(vendor_payments)
      .where(eq(vendor_payments.contractId, id))
      .orderBy(desc(vendor_payments.dueDate));

    res.json({
      contract: contract[0],
      payments
    });

  } catch (error) {
    console.error('Get contract details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new contract
router.post('/', async (req, res) => {
  try {
    const {
      vendorId,
      projectId,
      contractNumber,
      title,
      description,
      type,
      startDate,
      endDate,
      value,
      currency = 'THB',
      paymentTerms,
      paymentSchedule,
      notes
    } = req.body;

    // Validate required fields
    if (!vendorId || !title || !type || !startDate || !value) {
      return res.status(400).json({ 
        error: 'Vendor ID, title, type, start date, and value are required' 
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

    // Check if contract number already exists
    if (contractNumber) {
      const existingContract = await db.select()
        .from(vendor_contracts)
        .where(eq(vendor_contracts.contractNumber, contractNumber))
        .limit(1);

      if (existingContract.length > 0) {
        return res.status(400).json({ error: 'Contract number already exists' });
      }
    }

    const newContract = {
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vendorId,
      projectId: projectId || null,
      contractNumber: contractNumber || null,
      title,
      description: description || null,
      type,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      value: parseFloat(value),
      currency,
      paymentTerms: paymentTerms || null,
      paymentSchedule: paymentSchedule || null,
      status: 'draft',
      signedDate: null,
      signedBy: null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.insert(vendor_contracts)
      .values(newContract)
      .returning();

    res.status(201).json({
      message: 'Contract created successfully',
      contract: result[0]
    });

  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contract
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if contract exists
    const existingContract = await db.select()
      .from(vendor_contracts)
      .where(eq(vendor_contracts.id, id))
      .limit(1);

    if (existingContract.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if contract is already signed (cannot modify signed contracts)
    if (existingContract[0].status === 'active' || existingContract[0].signedDate) {
      return res.status(400).json({ 
        error: 'Cannot modify signed or active contract' 
      });
    }

    // Check if contract number conflicts with another contract
    if (updateData.contractNumber && updateData.contractNumber !== existingContract[0].contractNumber) {
      const numberConflict = await db.select()
        .from(vendor_contracts)
        .where(eq(vendor_contracts.contractNumber, updateData.contractNumber))
        .limit(1);

      if (numberConflict.length > 0) {
        return res.status(400).json({ error: 'Contract number already exists' });
      }
    }

    // Prepare update data
    const contractUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    // Remove fields that shouldn't be updated directly
    delete contractUpdate.id;
    delete contractUpdate.createdAt;
    delete contractUpdate.signedDate;
    delete contractUpdate.signedBy;

    // Convert date fields
    if (contractUpdate.startDate) {
      contractUpdate.startDate = new Date(contractUpdate.startDate);
    }
    if (contractUpdate.endDate) {
      contractUpdate.endDate = new Date(contractUpdate.endDate);
    }
    if (contractUpdate.value) {
      contractUpdate.value = parseFloat(contractUpdate.value);
    }

    const result = await db.update(vendor_contracts)
      .set(contractUpdate)
      .where(eq(vendor_contracts.id, id))
      .returning();

    res.json({
      message: 'Contract updated successfully',
      contract: result[0]
    });

  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign contract
router.put('/:id/sign', async (req, res) => {
  try {
    const { id } = req.params;
    const { signedBy, signedDate = new Date() } = req.body;

    // Check if contract exists
    const existingContract = await db.select()
      .from(vendor_contracts)
      .where(eq(vendor_contracts.id, id))
      .limit(1);

    if (existingContract.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (existingContract[0].status === 'active') {
      return res.status(400).json({ error: 'Contract is already active' });
    }

    // Update contract to active status
    const result = await db.update(vendor_contracts)
      .set({ 
        status: 'active',
        signedDate: new Date(signedDate),
        signedBy,
        updatedAt: new Date()
      })
      .where(eq(vendor_contracts.id, id))
      .returning();

    res.json({
      message: 'Contract signed successfully',
      contract: result[0]
    });

  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Terminate contract
router.put('/:id/terminate', async (req, res) => {
  try {
    const { id } = req.params;
    const { terminationReason } = req.body;

    // Check if contract exists
    const existingContract = await db.select()
      .from(vendor_contracts)
      .where(eq(vendor_contracts.id, id))
      .limit(1);

    if (existingContract.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (existingContract[0].status === 'terminated') {
      return res.status(400).json({ error: 'Contract is already terminated' });
    }

    // Update contract to terminated status
    const result = await db.update(vendor_contracts)
      .set({ 
        status: 'terminated',
        endDate: new Date(),
        notes: terminationReason ? `${existingContract[0].notes || ''}\n\nTermination: ${terminationReason}` : terminationReason,
        updatedAt: new Date()
      })
      .where(eq(vendor_contracts.id, id))
      .returning();

    res.json({
      message: 'Contract terminated successfully',
      contract: result[0]
    });

  } catch (error) {
    console.error('Terminate contract error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contract
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if contract exists
    const existingContract = await db.select()
      .from(vendor_contracts)
      .where(eq(vendor_contracts.id, id))
      .limit(1);

    if (existingContract.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if contract has payments
    const contractPayments = await db.select()
      .from(vendor_payments)
      .where(eq(vendor_payments.contractId, id));

    if (contractPayments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete contract with existing payments' 
      });
    }

    // Only allow deletion of draft contracts
    if (existingContract[0].status !== 'draft') {
      return res.status(400).json({ 
        error: 'Can only delete draft contracts' 
      });
    }

    await db.delete(vendor_contracts)
      .where(eq(vendor_contracts.id, id));

    res.json({ message: 'Contract deleted successfully' });

  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contract statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Contracts by status
    const contractsByStatus = await db.select({
      status: vendor_contracts.status,
      count: vendor_contracts.id,
      totalValue: vendor_contracts.value
    })
    .from(vendor_contracts)
    .groupBy(vendor_contracts.status);

    // Contracts by type
    const contractsByType = await db.select({
      type: vendor_contracts.type,
      count: vendor_contracts.id,
      totalValue: vendor_contracts.value
    })
    .from(vendor_contracts)
    .groupBy(vendor_contracts.type);

    // Contracts expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringContracts = await db.select({
      id: vendor_contracts.id,
      title: vendor_contracts.title,
      vendorId: vendor_contracts.vendorId,
      endDate: vendor_contracts.endDate,
      value: vendor_contracts.value,
      vendorName: vendors.name
    })
    .from(vendor_contracts)
    .leftJoin(vendors, eq(vendor_contracts.vendorId, vendors.id))
    .where(and(
      eq(vendor_contracts.status, 'active'),
      gte(vendor_contracts.endDate, new Date()),
      lte(vendor_contracts.endDate, thirtyDaysFromNow)
    ))
    .orderBy(asc(vendor_contracts.endDate));

    res.json({
      contractsByStatus,
      contractsByType,
      expiringContracts
    });

  } catch (error) {
    console.error('Get contract stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
