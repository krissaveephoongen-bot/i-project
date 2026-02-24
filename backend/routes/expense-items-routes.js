// backend/routes/expense-items-routes.js
import express from 'express';
import { db } from '../lib/db.js';
import { expense_items, expenses, vendors, projects } from '../lib/schema.js';
import { eq, and, or, ilike, desc, asc, gte, lte } from 'drizzle-orm';

const router = express.Router();

// Get all expense items with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      expenseId,
      vendorId,
      category,
      subcategory,
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
        ilike(expense_items.description, `%${search}%`),
        ilike(expense_items.subcategory, `%${search}%`),
        ilike(expense_items.vendorItemCode, `%${search}%`),
        ilike(expense_items.vendorInvoice, `%${search}%`)
      ));
    }
    
    if (expenseId) {
      whereConditions.push(eq(expense_items.expenseId, expenseId));
    }
    
    if (vendorId) {
      whereConditions.push(eq(expense_items.vendorId, vendorId));
    }
    
    if (category) {
      whereConditions.push(eq(expense_items.category, category));
    }

    if (subcategory) {
      whereConditions.push(eq(expense_items.subcategory, subcategory));
    }

    if (startDate) {
      whereConditions.push(gte(expense_items.createdAt, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(expense_items.createdAt, new Date(endDate)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get expense items with related data
    const items = await db.select({
      // Expense item fields
      id: expense_items.id,
      expenseId: expense_items.expenseId,
      vendorId: expense_items.vendorId,
      category: expense_items.category,
      subcategory: expense_items.subcategory,
      description: expense_items.description,
      quantity: expense_items.quantity,
      unitPrice: expense_items.unitPrice,
      totalPrice: expense_items.totalPrice,
      baseCost: expense_items.baseCost,
      markup: expense_items.markup,
      marginAmount: expense_items.marginAmount,
      finalPrice: expense_items.finalPrice,
      vendorItemCode: expense_items.vendorItemCode,
      vendorInvoice: expense_items.vendorInvoice,
      notes: expense_items.notes,
      createdAt: expense_items.createdAt,
      updatedAt: expense_items.updatedAt,
      // Expense details
      expenseDate: expenses.date,
      expenseDescription: expenses.description,
      expenseStatus: expenses.status,
      // Vendor details
      vendorName: vendors.name,
      vendorCode: vendors.code,
      vendorType: vendors.type,
      // Project details
      projectName: projects.name,
      projectCode: projects.code
    })
    .from(expense_items)
    .leftJoin(expenses, eq(expense_items.expenseId, expenses.id))
    .leftJoin(vendors, eq(expense_items.vendorId, vendors.id))
    .leftJoin(projects, eq(expenses.projectId, projects.id))
    .where(whereClause)
    .orderBy(
      sortOrder === 'desc' ? desc(expense_items[sortBy]) : asc(expense_items[sortBy])
    )
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalCount = await db.select({ count: expense_items.id })
      .from(expense_items)
      .where(whereClause);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.length,
        pages: Math.ceil(totalCount.length / limit)
      }
    });

  } catch (error) {
    console.error('Get expense items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expense item by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await db.select({
      // Expense item fields
      id: expense_items.id,
      expenseId: expense_items.expenseId,
      vendorId: expense_items.vendorId,
      category: expense_items.category,
      subcategory: expense_items.subcategory,
      description: expense_items.description,
      quantity: expense_items.quantity,
      unitPrice: expense_items.unitPrice,
      totalPrice: expense_items.totalPrice,
      baseCost: expense_items.baseCost,
      markup: expense_items.markup,
      marginAmount: expense_items.marginAmount,
      finalPrice: expense_items.finalPrice,
      vendorItemCode: expense_items.vendorItemCode,
      vendorInvoice: expense_items.vendorInvoice,
      notes: expense_items.notes,
      createdAt: expense_items.createdAt,
      updatedAt: expense_items.updatedAt,
      // Expense details
      expenseDate: expenses.date,
      expenseDescription: expenses.description,
      expenseStatus: expenses.status,
      expenseAmount: expenses.amount,
      // Vendor details
      vendorName: vendors.name,
      vendorCode: vendors.code,
      vendorType: vendors.type,
      vendorContactPerson: vendors.contactPerson,
      vendorEmail: vendors.email,
      vendorPhone: vendors.phone,
      // Project details
      projectName: projects.name,
      projectCode: projects.code,
      projectStatus: projects.status
    })
    .from(expense_items)
    .leftJoin(expenses, eq(expense_items.expenseId, expenses.id))
    .leftJoin(vendors, eq(expense_items.vendorId, vendors.id))
    .leftJoin(projects, eq(expenses.projectId, projects.id))
    .where(eq(expense_items.id, id))
    .limit(1);

    if (item.length === 0) {
      return res.status(404).json({ error: 'Expense item not found' });
    }

    res.json({ item: item[0] });

  } catch (error) {
    console.error('Get expense item details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new expense item
router.post('/', async (req, res) => {
  try {
    const {
      expenseId,
      vendorId,
      category,
      subcategory,
      description,
      quantity = 1,
      unitPrice,
      baseCost,
      markup = 0,
      vendorItemCode,
      vendorInvoice,
      notes
    } = req.body;

    // Validate required fields
    if (!expenseId || !category || !description || !unitPrice) {
      return res.status(400).json({ 
        error: 'Expense ID, category, description, and unit price are required' 
      });
    }

    // Check if expense exists
    const expenseExists = await db.select()
      .from(expenses)
      .where(eq(expenses.id, expenseId))
      .limit(1);

    if (expenseExists.length === 0) {
      return res.status(400).json({ error: 'Expense not found' });
    }

    // Check if vendor exists (if provided)
    if (vendorId) {
      const vendorExists = await db.select()
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      if (vendorExists.length === 0) {
        return res.status(400).json({ error: 'Vendor not found' });
      }
    }

    // Calculate values
    const totalPrice = parseFloat(quantity) * parseFloat(unitPrice);
    const actualBaseCost = baseCost ? parseFloat(baseCost) : totalPrice;
    const markupPercentage = parseFloat(markup);
    const marginAmount = totalPrice - actualBaseCost;
    const finalPrice = actualBaseCost * (1 + markupPercentage / 100);

    const newItem = {
      id: `expense_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expenseId,
      vendorId: vendorId || null,
      category,
      subcategory: subcategory || null,
      description,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      totalPrice,
      baseCost: actualBaseCost,
      markup: markupPercentage,
      marginAmount,
      finalPrice,
      vendorItemCode: vendorItemCode || null,
      vendorInvoice: vendorInvoice || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.insert(expense_items)
      .values(newItem)
      .returning();

    res.status(201).json({
      message: 'Expense item created successfully',
      item: result[0]
    });

  } catch (error) {
    console.error('Create expense item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if expense item exists
    const existingItem = await db.select()
      .from(expense_items)
      .where(eq(expense_items.id, id))
      .limit(1);

    if (existingItem.length === 0) {
      return res.status(404).json({ error: 'Expense item not found' });
    }

    // Check if expense is already approved
    const expenseStatus = await db.select({ status: expenses.status })
      .from(expenses)
      .where(eq(expenses.id, existingItem[0].expenseId))
      .limit(1);

    if (expenseStatus.length > 0 && expenseStatus[0].status === 'approved') {
      return res.status(400).json({ 
        error: 'Cannot modify items of approved expense' 
      });
    }

    // Prepare update data
    const itemUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    // Remove fields that shouldn't be updated directly
    delete itemUpdate.id;
    delete itemUpdate.expenseId;
    delete itemUpdate.createdAt;

    // Recalculate values if price or quantity changed
    if (itemUpdate.quantity !== undefined || itemUpdate.unitPrice !== undefined) {
      const quantity = itemUpdate.quantity !== undefined ? parseFloat(itemUpdate.quantity) : existingItem[0].quantity;
      const unitPrice = itemUpdate.unitPrice !== undefined ? parseFloat(itemUpdate.unitPrice) : existingItem[0].unitPrice;
      
      itemUpdate.quantity = quantity;
      itemUpdate.unitPrice = unitPrice;
      itemUpdate.totalPrice = quantity * unitPrice;
    }

    if (itemUpdate.baseCost !== undefined || itemUpdate.markup !== undefined) {
      const baseCost = itemUpdate.baseCost !== undefined ? parseFloat(itemUpdate.baseCost) : existingItem[0].baseCost;
      const markup = itemUpdate.markup !== undefined ? parseFloat(itemUpdate.markup) : existingItem[0].markup;
      
      itemUpdate.baseCost = baseCost;
      itemUpdate.markup = markup;
      itemUpdate.marginAmount = itemUpdate.totalPrice - baseCost;
      itemUpdate.finalPrice = baseCost * (1 + markup / 100);
    }

    const result = await db.update(expense_items)
      .set(itemUpdate)
      .where(eq(expense_items.id, id))
      .returning();

    res.json({
      message: 'Expense item updated successfully',
      item: result[0]
    });

  } catch (error) {
    console.error('Update expense item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete expense item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if expense item exists
    const existingItem = await db.select()
      .from(expense_items)
      .where(eq(expense_items.id, id))
      .limit(1);

    if (existingItem.length === 0) {
      return res.status(404).json({ error: 'Expense item not found' });
    }

    // Check if expense is already approved
    const expenseStatus = await db.select({ status: expenses.status })
      .from(expenses)
      .where(eq(expenses.id, existingItem[0].expenseId))
      .limit(1);

    if (expenseStatus.length > 0 && expenseStatus[0].status === 'approved') {
      return res.status(400).json({ 
        error: 'Cannot delete items of approved expense' 
      });
    }

    await db.delete(expense_items)
      .where(eq(expense_items.id, id));

    res.json({ message: 'Expense item deleted successfully' });

  } catch (error) {
    console.error('Delete expense item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expense items by expense ID
router.get('/expense/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;

    const items = await db.select({
      // Expense item fields
      id: expense_items.id,
      vendorId: expense_items.vendorId,
      category: expense_items.category,
      subcategory: expense_items.subcategory,
      description: expense_items.description,
      quantity: expense_items.quantity,
      unitPrice: expense_items.unitPrice,
      totalPrice: expense_items.totalPrice,
      baseCost: expense_items.baseCost,
      markup: expense_items.markup,
      marginAmount: expense_items.marginAmount,
      finalPrice: expense_items.finalPrice,
      vendorItemCode: expense_items.vendorItemCode,
      vendorInvoice: expense_items.vendorInvoice,
      notes: expense_items.notes,
      createdAt: expense_items.createdAt,
      updatedAt: expense_items.updatedAt,
      // Vendor details
      vendorName: vendors.name,
      vendorCode: vendors.code,
      vendorType: vendors.type
    })
    .from(expense_items)
    .leftJoin(vendors, eq(expense_items.vendorId, vendors.id))
    .where(eq(expense_items.expenseId, expenseId))
    .orderBy(asc(expense_items.createdAt));

    // Calculate totals
    const totals = items.reduce((acc, item) => {
      acc.totalPrice += parseFloat(item.totalPrice);
      acc.totalBaseCost += parseFloat(item.baseCost || 0);
      acc.totalMargin += parseFloat(item.marginAmount || 0);
      acc.totalFinalPrice += parseFloat(item.finalPrice || 0);
      return acc;
    }, {
      totalPrice: 0,
      totalBaseCost: 0,
      totalMargin: 0,
      totalFinalPrice: 0
    });

    res.json({
      items,
      totals
    });

  } catch (error) {
    console.error('Get expense items by expense ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expense items statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Items by category
    const itemsByCategory = await db.select({
      category: expense_items.category,
      count: expense_items.id,
      totalAmount: expense_items.totalPrice,
      totalMargin: expense_items.marginAmount
    })
    .from(expense_items)
    .groupBy(expense_items.category);

    // Items by vendor
    const itemsByVendor = await db.select({
      vendorId: expense_items.vendorId,
      vendorName: vendors.name,
      count: expense_items.id,
      totalAmount: expense_items.totalPrice,
      totalMargin: expense_items.marginAmount
    })
    .from(expense_items)
    .leftJoin(vendors, eq(expense_items.vendorId, vendors.id))
    .where(expense_items.vendorId.isNotNull())
    .groupBy(expense_items.vendorId, vendors.name)
    .orderBy(desc(expense_items.totalPrice));

    // Margin analysis
    const marginAnalysis = await db.select({
      category: expense_items.category,
      avgMargin: expense_items.marginAmount,
      avgMarkup: expense_items.markup,
      totalItems: expense_items.id
    })
    .from(expense_items)
    .groupBy(expense_items.category);

    // Recent items
    const recentItems = await db.select({
      id: expense_items.id,
      description: expense_items.description,
      category: expense_items.category,
      totalPrice: expense_items.totalPrice,
      marginAmount: expense_items.marginAmount,
      vendorName: vendors.name,
      createdAt: expense_items.createdAt
    })
    .from(expense_items)
    .leftJoin(vendors, eq(expense_items.vendorId, vendors.id))
    .orderBy(desc(expense_items.createdAt))
    .limit(10);

    res.json({
      itemsByCategory,
      itemsByVendor,
      marginAnalysis,
      recentItems
    });

  } catch (error) {
    console.error('Get expense items stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
