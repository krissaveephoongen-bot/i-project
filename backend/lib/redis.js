import { createClient } from 'redis';

let redis = null;

export async function initRedis() {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('⚠️ REDIS_URL not set, Redis will be skipped');
    return null;
  }

  try {
    redis = createClient({ url: redisUrl });
    
    redis.on('error', (err) => {
      console.error('Redis error:', err);
    });
    
    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    await redis.connect();
    return redis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    return null;
  }
}

export function getRedis() {
  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

// Redis helper functions
export async function cacheSet(key, value, ttlSeconds = 3600) {
  const client = getRedis();
  if (!client) return null;
  
  try {
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } else {
      await client.set(key, JSON.stringify(value));
    }
    return value;
  } catch (error) {
    console.error(`Error setting cache key ${key}:`, error);
    return null;
  }
}

export async function cacheGet(key) {
  const client = getRedis();
  if (!client) return null;
  
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting cache key ${key}:`, error);
    return null;
  }
}

export async function cacheDel(key) {
  const client = getRedis();
  if (!client) return null;
  
  try {
    return await client.del(key);
  } catch (error) {
    console.error(`Error deleting cache key ${key}:`, error);
    return null;
  }
}

export async function cacheFlush() {
  const client = getRedis();
  if (!client) return null;
  
  try {
    return await client.flushDb();
  } catch (error) {
    console.error('Error flushing cache:', error);
    return null;
  }
}
