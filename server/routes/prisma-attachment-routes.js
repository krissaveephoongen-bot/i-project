const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Helper function for error handling
const handleError = (res, error, statusCode = 500) => {
  console.error('API Error:', error);
  res.status(statusCode).json({
    error: error.message || 'Internal Server Error',
    status: statusCode
  });
};

/**
 * GET /api/prisma/attachments
 * Get all attachments with optional filters
 */
router.get('/attachments', async (req, res) => {
  try {
    const { costId, skip = 0, take = 10 } = req.query;

    const where = {};
    if (costId) where.costId = costId;

    const [attachments, total] = await Promise.all([
      prisma.attachment.findMany({
        where,
        include: { cost: { select: { id: true, description: true } } },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(take)
      }),
      prisma.attachment.count({ where })
    ]);

    res.json({
      data: attachments,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/attachments/:id
 * Get a specific attachment
 */
router.get('/attachments/:id', async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
      include: { cost: true }
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    res.json({ data: attachment });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/attachments
 * Upload a new attachment for a cost
 */
router.post('/attachments', upload.single('file'), async (req, res) => {
  try {
    const { costId } = req.body;

    if (!costId) {
      return res.status(400).json({ error: 'Missing costId' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify cost exists
    const cost = await prisma.cost.findUnique({ where: { id: costId } });
    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        costId,
        filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype
      },
      include: { cost: { select: { id: true, description: true } } }
    });

    res.status(201).json({
      data: attachment,
      message: 'Attachment uploaded successfully'
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    handleError(res, error);
  }
});

/**
 * DELETE /api/prisma/attachments/:id
 * Delete an attachment
 */
router.delete('/attachments/:id', async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id }
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete file from storage
    const fs = require('fs');
    const filePath = path.join(__dirname, '../../public', attachment.url);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting file:', err);
      }
    });

    // Delete from database
    const deleted = await prisma.attachment.delete({
      where: { id: req.params.id }
    });

    res.json({ data: deleted, message: 'Attachment deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/costs/:costId/attachments
 * Get all attachments for a specific cost
 */
router.get('/costs/:costId/attachments', async (req, res) => {
  try {
    const { costId } = req.params;

    // Verify cost exists
    const cost = await prisma.cost.findUnique({ where: { id: costId } });
    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    const attachments = await prisma.attachment.findMany({
      where: { costId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: attachments });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/costs/:costId/attachments
 * Upload attachment for a cost
 */
router.post('/costs/:costId/attachments', upload.single('file'), async (req, res) => {
  try {
    const { costId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify cost exists
    const cost = await prisma.cost.findUnique({ where: { id: costId } });
    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    const attachment = await prisma.attachment.create({
      data: {
        costId,
        filename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

    res.status(201).json({
      data: attachment,
      message: 'Attachment uploaded successfully'
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    handleError(res, error);
  }
});

module.exports = router;
