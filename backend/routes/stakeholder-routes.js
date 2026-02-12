// backend/routes/stakeholder-routes.js
import express from 'express';
import { db } from '../lib/db.js';
import { contacts, teamStructure, users, projects, clients } from '../lib/schema.js';
import { eq, and, or, desc } from 'drizzle-orm';

const router = express.Router();

// Get all contacts for a project
router.get('/projects/:projectId/contacts', async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectContacts = await db.select({
      contactId: contacts.id,
      contactName: contacts.name,
      position: contacts.position,
      email: contacts.email,
      phone: contacts.phone,
      department: contacts.department,
      type: contacts.type,
      isKeyPerson: contacts.isKeyPerson,
      notes: contacts.notes,
      clientId: contacts.clientId,
      clientName: clients.name,
      createdAt: contacts.createdAt
    })
    .from(contacts)
    .leftJoin(clients, eq(contacts.clientId, clients.id))
    .where(eq(contacts.projectId, projectId))
    .orderBy(contacts.isKeyPerson, desc(contacts.createdAt));

    res.json(projectContacts);

  } catch (error) {
    console.error('Get project contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contacts for a client
router.get('/clients/:clientId/contacts', async (req, res) => {
  try {
    const { clientId } = req.params;

    const clientContacts = await db.select({
      contactId: contacts.id,
      contactName: contacts.name,
      position: contacts.position,
      email: contacts.email,
      phone: contacts.phone,
      department: contacts.department,
      type: contacts.type,
      isKeyPerson: contacts.isKeyPerson,
      notes: contacts.notes,
      createdAt: contacts.createdAt
    })
    .from(contacts)
    .where(eq(contacts.clientId, clientId))
    .orderBy(contacts.isKeyPerson, desc(contacts.createdAt));

    res.json(clientContacts);

  } catch (error) {
    console.error('Get client contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new contact
router.post('/contacts', async (req, res) => {
  try {
    const {
      name,
      position,
      email,
      phone,
      department,
      type,
      clientId,
      projectId,
      isKeyPerson,
      notes
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const newContact = await db.insert(contacts).values({
      name,
      position,
      email,
      phone,
      department,
      type,
      clientId,
      projectId,
      isKeyPerson: isKeyPerson || false,
      notes
    }).returning();

    res.status(201).json(newContact[0]);

  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact
router.put('/contacts/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const updateData = req.body;

    const updatedContact = await db.update(contacts)
      .set(updateData)
      .where(eq(contacts.id, contactId))
      .returning();

    if (updatedContact.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(updatedContact[0]);

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/contacts/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;

    const deletedContact = await db.delete(contacts)
      .where(eq(contacts.id, contactId))
      .returning();

    if (deletedContact.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get team structure for a project
router.get('/projects/:projectId/team', async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectTeam = await db.select({
      teamId: teamStructure.id,
      role: teamStructure.role,
      level: teamStructure.level,
      responsibilities: teamStructure.responsibilities,
      startDate: teamStructure.startDate,
      endDate: teamStructure.endDate,
      isActive: teamStructure.isActive,
      parentId: teamStructure.parentId,
      userId: teamStructure.userId,
      userName: users.name,
      userEmail: users.email,
      userPosition: users.position,
      userAvatar: users.avatar,
      createdAt: teamStructure.createdAt
    })
    .from(teamStructure)
    .leftJoin(users, eq(teamStructure.userId, users.id))
    .where(and(
      eq(teamStructure.projectId, projectId),
      eq(teamStructure.isActive, true)
    ))
    .orderBy(teamStructure.level, teamStructure.role);

    res.json(projectTeam);

  } catch (error) {
    console.error('Get project team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add team member
router.post('/projects/:projectId/team', async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      userId,
      role,
      level,
      parentId,
      responsibilities,
      startDate
    } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }

    const newTeamMember = await db.insert(teamStructure).values({
      projectId,
      userId,
      role,
      level: level || 3,
      parentId,
      responsibilities,
      startDate: startDate ? new Date(startDate) : new Date()
    }).returning();

    res.status(201).json(newTeamMember[0]);

  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update team member
router.put('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const updateData = req.body;

    const updatedTeamMember = await db.update(teamStructure)
      .set(updateData)
      .where(eq(teamStructure.id, teamId))
      .returning();

    if (updatedTeamMember.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(updatedTeamMember[0]);

  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove team member (set inactive)
router.put('/team/:teamId/deactivate', async (req, res) => {
  try {
    const { teamId } = req.params;

    const deactivatedMember = await db.update(teamStructure)
      .set({ 
        isActive: false,
        endDate: new Date()
      })
      .where(eq(teamStructure.id, teamId))
      .returning();

    if (deactivatedMember.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json({ message: 'Team member deactivated successfully' });

  } catch (error) {
    console.error('Deactivate team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
