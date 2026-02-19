import { createClient } from 'redis';

// Redis client configuration
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.error('Redis reconnection failed after 3 retries');
        return false;
      }
      return Math.min(retries * 50, 500);
    },
  },
});

// Connection event handlers
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Redis Client Connected');
});

client.on('ready', () => {
  console.log('Redis Client Ready');
});

client.on('end', () => {
  console.log('Redis Client Disconnected');
});

// Initialize connection
let isConnecting = false;
const connectRedis = async () => {
  if (isConnecting || client.isOpen) return;
  
  isConnecting = true;
  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  } finally {
    isConnecting = false;
  }
};

// Auto-connect on first use
const ensureConnected = async () => {
  if (!client.isOpen) {
    await connectRedis();
  }
  return client;
};

// Export Redis client with auto-connection
export default {
  getClient: () => ensureConnected(),
  client,
  // Helper methods with auto-connection
  async get(key: string) {
    const redis = await ensureConnected();
    return redis.get(key);
  },
  
  async set(key: string, value: string, options?: { EX?: number }) {
    const redis = await ensureConnected();
    if (options?.EX) {
      return redis.setEx(key, options.EX, value);
    }
    return redis.set(key, value);
  },
  
  async del(key: string) {
    const redis = await ensureConnected();
    return redis.del(key);
  },

  async delPattern(pattern: string) {
    const redis = await ensureConnected();
    const keys = await redis.keys(pattern);
    if (!keys.length) return 0;
    return redis.del(keys);
  },
  
  async exists(key: string) {
    const redis = await ensureConnected();
    return redis.exists(key);
  },
  
  async incr(key: string) {
    const redis = await ensureConnected();
    return redis.incr(key);
  },
  
  async expire(key: string, seconds: number) {
    const redis = await ensureConnected();
    return redis.expire(key, seconds);
  }
};
