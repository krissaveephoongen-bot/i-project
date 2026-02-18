import express from 'express';
import { cacheSet, cacheGet, cacheDel, cacheFlush, getRedis } from '../lib/redis.js';

const router = express.Router();

// Test Redis connection
router.get('/health', async (req, res) => {
  try {
    const redis = getRedis();
    if (!redis) {
      return res.status(500).json({ status: 'error', message: 'Redis not initialized' });
    }
    
    const pong = await redis.ping();
    res.json({ status: 'ok', message: 'Redis connected', ping: pong });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Set a cache value
router.post('/set', async (req, res) => {
  try {
    const { key, value, ttl } = req.body;
    
    if (!key || !value) {
      return res.status(400).json({ error: 'key and value are required' });
    }
    
    const result = await cacheSet(key, value, ttl || 3600);
    res.json({ 
      success: !!result, 
      key, 
      message: result ? 'Value cached successfully' : 'Failed to cache value' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a cache value
router.get('/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await cacheGet(key);
    
    if (value === null) {
      return res.status(404).json({ error: 'Key not found' });
    }
    
    res.json({ key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a cache value
router.delete('/delete/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await cacheDel(key);
    res.json({ 
      success: result > 0, 
      key, 
      message: result > 0 ? 'Key deleted' : 'Key not found' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Flush all cache
router.post('/flush', async (req, res) => {
  try {
    await cacheFlush();
    res.json({ success: true, message: 'Cache flushed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
