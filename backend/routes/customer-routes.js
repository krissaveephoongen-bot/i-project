import express from 'express';
import { db } from '../lib/db.js';
import { clients } from '../lib/schema.js';
import { eq, desc } from 'drizzle-orm';

const router = express.Router();

// Shape customer object for frontend
const mapClientToCustomer = (client) => ({
  id: client.id,
  name: client.name,
  email: client.email,
  phone: client.phone,
  address: client.address,
  taxId: client.taxId,
  notes: client.notes,
  created_at: client.createdAt,
  updated_at: client.updatedAt,
});

// GET /api/customers - list customers
router.get('/', async (req, res) => {
  try {
    const rows = await db.select().from(clients).orderBy(desc(clients.createdAt));
    res.json({
      success: true,
      data: rows.map(mapClientToCustomer),
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

// GET /api/customers/:id - get single customer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: mapClientToCustomer(rows[0]),
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer' });
  }
});

// POST /api/customers - create customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, taxId, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    const [inserted] = await db
      .insert(clients)
      .values({
        name: name.trim(),
        email: email || null,
        phone: phone || null,
        address: address || null,
        taxId: taxId || null,
        notes: notes || null,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: mapClientToCustomer(inserted),
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, message: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id - update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, taxId, notes } = req.body;

    const [updated] = await db
      .update(clients)
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(taxId !== undefined ? { taxId } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: mapClientToCustomer(updated),
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer' });
  }
});

// DELETE /api/customers/:id - delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db.delete(clients).where(eq(clients.id, id)).returning();

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, message: 'Failed to delete customer' });
  }
});

export default router;

