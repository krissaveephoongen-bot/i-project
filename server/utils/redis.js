const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });
    
    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.connected = false;
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('Redis client connected');
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
      this.connected = false;
    }
  }

  async get(key) {
    if (!this.connected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Redis get error:', err);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.connected) return false;
    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: ttlSeconds
      });
      return true;
    } catch (err) {
      console.error('Redis set error:', err);
      return false;
    }
  }

  async invalidate(prefix) {
    if (!this.connected) return false;
    try {
      const keys = await this.client.keys(`${prefix}:*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (err) {
      console.error('Redis invalidate error:', err);
      return false;
    }
  }
}

// Create a singleton instance
const redis = new RedisClient();

// Handle process termination
process.on('SIGINT', async () => {
  if (redis.connected) {
    await redis.client.quit();
  }
  process.exit();
});

module.exports = redis;
