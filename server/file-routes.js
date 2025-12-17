/**
 * File Management Routes
 * Handles file upload, retrieval, and management
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
 * GET /files
 * Get all files for the authenticated user
 */
router.get('/files', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { entityType, entityId } = req.query;
    let query = `
      SELECT 
        id,
        name,
        size,
        type,
        url,
        upload_date,
        entity_type,
        entity_id,
        uploader_id,
        uploader_name
      FROM files
      WHERE uploader_id = $1 OR entity_type = 'public'
    `;
    const params = [req.user.id];
    let paramCount = 2;

    if (entityType) {
      query += ` AND entity_type = $${paramCount}`;
      params.push(entityType);
      paramCount++;
    }

    if (entityId) {
      query += ` AND entity_id = $${paramCount}`;
      params.push(entityId);
      paramCount++;
    }

    query += ` ORDER BY upload_date DESC LIMIT 100`;

    const result = await client.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch files',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /files
 * Upload a new file
 */
router.post('/files', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { name, size, type, url, entityType = 'general', entityId } = req.body;

    if (!name || !type || !url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, url'
      });
    }

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const uploadDate = new Date().toISOString();

    const result = await client.query(
      `INSERT INTO files (id, name, size, type, url, upload_date, entity_type, entity_id, uploader_id, uploader_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [fileId, name, size || 0, type, url, uploadDate, entityType, entityId, req.user.id, req.user.name]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /files/:fileId
 * Get a specific file
 */
router.get('/files/:fileId', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { fileId } = req.params;

    const result = await client.query(
      'SELECT * FROM files WHERE id = $1',
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error fetching file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch file',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * PUT /files/:fileId
 * Update file metadata
 */
router.put('/files/:fileId', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { fileId } = req.params;
    const { name, entityType, entityId } = req.body;

    const result = await client.query(
      `UPDATE files 
       SET name = COALESCE($1, name),
           entity_type = COALESCE($2, entity_type),
           entity_id = COALESCE($3, entity_id)
       WHERE id = $4
       RETURNING *`,
      [name, entityType, entityId, fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'File updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update file',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * DELETE /files/:fileId
 * Delete a file
 */
router.delete('/files/:fileId', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { fileId } = req.params;

    const result = await client.query(
      'DELETE FROM files WHERE id = $1 RETURNING id',
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /files/entity/:entityType/:entityId
 * Get all files for a specific entity
 */
router.get('/files/entity/:entityType/:entityId', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { entityType, entityId } = req.params;

    const result = await client.query(
      `SELECT * FROM files 
       WHERE entity_type = $1 AND entity_id = $2
       ORDER BY upload_date DESC`,
      [entityType, entityId]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching entity files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entity files',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
