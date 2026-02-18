import { cacheGet, cacheSet } from './redis.js';

/**
 * Wrapper to cache API response with automatic key generation
 * @param {string} namespace - e.g., 'projects', 'users'
 * @param {string|number} id - entity id
 * @param {Function} fetchFn - async function to fetch data if not cached
 * @param {number} ttl - time to live in seconds (default: 1 hour)
 */
export async function getOrFetch(namespace, id, fetchFn, ttl = 3600) {
  const cacheKey = `${namespace}:${id}`;
  
  try {
    // Try to get from cache first
    const cached = await cacheGet(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return cached;
    }
  } catch (error) {
    console.warn(`Cache read error for ${cacheKey}:`, error);
  }

  try {
    // Fetch fresh data
    const data = await fetchFn();
    
    // Store in cache for future requests
    try {
      await cacheSet(cacheKey, data, ttl);
    } catch (error) {
      console.warn(`Cache write error for ${cacheKey}:`, error);
    }
    
    return data;
  } catch (error) {
    console.error(`Fetch error for ${cacheKey}:`, error);
    throw error;
  }
}

/**
 * Invalidate cache for an entity
 * @param {string} namespace - e.g., 'projects'
 * @param {string|number} id - entity id
 */
export async function invalidateCache(namespace, id) {
  const cacheKey = `${namespace}:${id}`;
  try {
    const { cacheDel } = await import('./redis.js');
    await cacheDel(cacheKey);
    console.log(`🗑️ Cache invalidated: ${cacheKey}`);
  } catch (error) {
    console.warn(`Error invalidating cache for ${cacheKey}:`, error);
  }
}

/**
 * Invalidate all cache for a namespace (e.g., all projects)
 * @param {string} namespace - e.g., 'projects'
 */
export async function invalidateNamespace(namespace) {
  console.log(`🗑️ Namespace invalidation needed for: ${namespace} (implement with Redis SCAN)`);
  // TODO: Implement pattern-based deletion using Redis SCAN
}
