// backend/routes/vendors-management-routes.js
import express from 'express';
import { db } from '../lib/db.js';
import { vendors, vendor_contracts, vendor_payments, vendor_kpi_evaluations, users, projects, expense_items } from '../lib/schema.js';
import { eq, and, or, ilike, desc, asc, gte, lte } from 'drizzle-orm';

const router = express.Router();

// Get all vendors with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      type, 
      category, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(or(
        ilike(vendors.name, `%${search}%`),
        ilike(vendors.code, `%${search}%`),
        ilike(vendors.contactPerson, `%${search}%`),
        ilike(vendors.email, `%${search}%`)
      ));
    }
    
    if (type) {
      whereConditions.push(eq(vendors.type, type));
    }
    
    if (category) {
      whereConditions.push(eq(vendors.category, category));
    }
    
    if (status) {
      whereConditions.push(eq(vendors.status, status));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Safe sort column mapping
    const allowedSortColumns = {
      createdAt: vendors.createdAt,
      updatedAt: vendors.updatedAt,
      name: vendors.name,
      code: vendors.code,
      type: vendors.type,
      status: vendors.status,
      category: vendors.category,
      overallRating: vendors.overallRating
    };
    const sortColumn = allowedSortColumns[sortBy] || vendors.createdAt;

    // Get vendors (explicit columns to avoid selecting non-existent ones)
    const vendorsList = await db.select({
      id: vendors.id,
      name: vendors.name,
      code: vendors.code,
      type: vendors.type,
      category: vendors.category,
      status: vendors.status,
      contactPerson: vendors.contactPerson,
      email: vendors.email,
      phone: vendors.phone,
      website: vendors.website,
      taxId: vendors.taxId,
      registrationNumber: vendors.registrationNumber,
      address: vendors.address,
      city: vendors.city,
      province: vendors.province,
      postalCode: vendors.postalCode,
      country: vendors.country,
      bankAccount: vendors.bankAccount,
      bankName: vendors.bankName,
      paymentTerms: vendors.paymentTerms,
      creditLimit: vendors.creditLimit,
      notes: vendors.notes,
      overallRating: vendors.overallRating,
      onTimeDeliveryRate: vendors.onTimeDeliveryRate,
      totalProjects: vendors.totalProjects,
      successfulProjects: vendors.successfulProjects,
      createdAt: vendors.createdAt,
      updatedAt: vendors.updatedAt
    })
    .from(vendors)
    .where(whereClause)
    .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalCount = await db.select({ count: vendors.id })
      .from(vendors)
      .where(whereClause);

    res.json({
      vendors: vendorsList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.length,
        pages: Math.ceil(totalCount.length / limit)
      }
    });

  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await db.select()
      .from(vendors)
      .where(eq(vendors.id, id))
      .limit(1);

    if (vendor.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Get vendor's contracts
    const contracts = await db.select()
      .from(vendor_contracts)
      .where(eq(vendor_contracts.vendorId, id))
      .orderBy(desc(vendor_contracts.createdAt));

    // Get vendor's recent payments
    const recentPayments = await db.select()
      .from(vendor_payments)
      .where(eq(vendor_payments.vendorId, id))
      .orderBy(desc(vendor_payments.dueDate))
      .limit(10);

    // Get vendor's KPI evaluations
    const kpiEvaluations = await db.select()
      .from(vendor_kpi_evaluations)
      .where(eq(vendor_kpi_evaluations.vendorId, id))
      .orderBy(desc(vendor_kpi_evaluations.createdAt))
      .limit(5);

    res.json({
      vendor: vendor[0],
      contracts,
      recentPayments,
      kpiEvaluations
    });

  } catch (error) {
    console.error('Get vendor details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new vendor
router.post('/', async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      category,
      contactPerson,
      email,
      phone,
      website,
      taxId,
      registrationNumber,
      address,
      city,
      province,
      postalCode,
      country,
      bankAccount,
      bankName,
      paymentTerms,
      creditLimit,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !type || !category) {
      return res.status(400).json({ 
        error: 'Name, type, and category are required' 
      });
    }

    // Check if vendor code already exists
    if (code) {
      const existingVendor = await db.select()
        .from(vendors)
        .where(eq(vendors.code, code))
        .limit(1);

      if (existingVendor.length > 0) {
        return res.status(400).json({ error: 'Vendor code already exists' });
      }
    }

    const newVendor = {
      id: `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      code: code || null,
      type,
      category,
      status: 'active',
      contactPerson: contactPerson || null,
      email: email || null,
      phone: phone || null,
      website: website || null,
      taxId: taxId || null,
      registrationNumber: registrationNumber || null,
      address: address || null,
      city: city || null,
      province: province || null,
      postalCode: postalCode || null,
      country: country || 'Thailand',
      bankAccount: bankAccount || null,
      bankName: bankName || null,
      paymentTerms: paymentTerms ? parseInt(paymentTerms) : null,
      creditLimit: creditLimit ? parseFloat(creditLimit) : null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.insert(vendors)
      .values(newVendor)
      .returning();

    res.status(201).json({
      message: 'Vendor created successfully',
      vendor: result[0]
    });

  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vendor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if vendor exists
    const existingVendor = await db.select()
      .from(vendors)
      .where(eq(vendors.id, id))
      .limit(1);

    if (existingVendor.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check if code conflicts with another vendor
    if (updateData.code && updateData.code !== existingVendor[0].code) {
      const codeConflict = await db.select()
        .from(vendors)
        .where(and(
          eq(vendors.code, updateData.code),
          eq(vendors.status, 'active')
        ))
        .limit(1);

      if (codeConflict.length > 0) {
        return res.status(400).json({ error: 'Vendor code already exists' });
      }
    }

    // Prepare update data
    const vendorUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    // Remove fields that shouldn't be updated directly
    delete vendorUpdate.id;
    delete vendorUpdate.createdAt;
    delete vendorUpdate.totalProjects;
    delete vendorUpdate.successfulProjects;
    delete vendorUpdate.overallRating;
    delete vendorUpdate.onTimeDeliveryRate;

    const result = await db.update(vendors)
      .set(vendorUpdate)
      .where(eq(vendors.id, id))
      .returning();

    res.json({
      message: 'Vendor updated successfully',
      vendor: result[0]
    });

  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vendor (soft delete - change status to inactive)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vendor exists
    const existingVendor = await db.select()
      .from(vendors)
      .where(eq(vendors.id, id))
      .limit(1);

    if (existingVendor.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check if vendor has active contracts
    const activeContracts = await db.select()
      .from(vendor_contracts)
      .where(and(
        eq(vendor_contracts.vendorId, id),
        eq(vendor_contracts.status, 'active')
      ));

    if (activeContracts.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete vendor with active contracts' 
      });
    }

    // Soft delete by changing status
    await db.update(vendors)
      .set({ 
        status: 'inactive',
        updatedAt: new Date()
      })
      .where(eq(vendors.id, id));

    res.json({ message: 'Vendor deleted successfully' });

  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Total vendors by status
    const vendorsByStatus = await db.select({
      status: vendors.status,
      count: vendors.id
    })
    .from(vendors)
    .groupBy(vendors.status);

    // Total vendors by category
    const vendorsByCategory = await db.select({
      category: vendors.category,
      count: vendors.id
    })
    .from(vendors)
    .groupBy(vendors.category);

    // Total vendors by type
    const vendorsByType = await db.select({
      type: vendors.type,
      count: vendors.id
    })
    .from(vendors)
    .groupBy(vendors.type);

    // Top performing vendors
    const topVendors = await db.select()
      .from(vendors)
      .where(eq(vendors.status, 'active'))
      .orderBy(desc(vendors.overallRating))
      .limit(10);

    res.json({
      vendorsByStatus,
      vendorsByCategory,
      vendorsByType,
      topVendors
    });

  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
