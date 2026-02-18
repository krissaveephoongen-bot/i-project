# Redis Setup Guide

## Overview
Redis is now integrated into your project for caching frequently accessed data and improving performance.

## Installation & Configuration

### 1. Environment Variable
Add your Redis URL to `.env` in the backend folder:

```env
REDIS_URL=redis://default:IfyS29shfDvjqoFwh2oJqmI9xJFlDkXi@redis-17723.c292.ap-southeast-1-1.ec2.cloud.redislabs.com:17723
```

### 2. Package Installed
```bash
npm install redis
```

## Files Created

### Core Redis Service
- **`backend/lib/redis.js`** - Main Redis client and helper functions
  - `initRedis()` - Initialize connection
  - `cacheGet(key)` - Get value from cache
  - `cacheSet(key, value, ttlSeconds)` - Set value with TTL
  - `cacheDel(key)` - Delete key
  - `cacheFlush()` - Clear all cache

### Cache Helper
- **`backend/lib/cache-helper.js`** - High-level caching utilities
  - `getOrFetch(namespace, id, fetchFn, ttl)` - Cache with fallback fetch
  - `invalidateCache(namespace, id)` - Invalidate single key
  - `invalidateNamespace(namespace)` - Invalidate namespace patterns

### API Routes
- **`backend/routes/redis-routes.js`** - Cache management endpoints
  - `GET /api/cache/health` - Check Redis connection
  - `POST /api/cache/set` - Set cache value
  - `GET /api/cache/get/:key` - Get cache value
  - `DELETE /api/cache/delete/:key` - Delete cache value
  - `POST /api/cache/flush` - Clear all cache

## Usage Examples

### Basic Caching
```javascript
import { cacheGet, cacheSet, cacheDel } from '../lib/redis.js';

// Set cache
await cacheSet('user:123', { id: 123, name: 'John' }, 3600);

// Get cache
const user = await cacheGet('user:123');

// Delete cache
await cacheDel('user:123');
```

### High-Level API
```javascript
import { getOrFetch, invalidateCache } from '../lib/cache-helper.js';

// Auto-fetch and cache
const user = await getOrFetch('users', userId, 
  async () => {
    return await db.user.findById(userId);
  },
  3600 // 1 hour TTL
);

// Invalidate when data changes
await invalidateCache('users', userId);
```

### In Route Handlers
```javascript
import { cacheGet, cacheSet } from '../lib/redis.js';

router.get('/api/projects/:id', async (req, res) => {
  const cacheKey = `project:${req.params.id}`;
  
  // Try cache first
  let project = await cacheGet(cacheKey);
  
  if (!project) {
    // Fetch from database
    project = await db.project.findById(req.params.id);
    
    // Cache for 30 minutes
    await cacheSet(cacheKey, project, 1800);
  }
  
  res.json(project);
});
```

### Cache Invalidation on Updates
```javascript
import { cacheDel } from '../lib/redis.js';

router.put('/api/projects/:id', async (req, res) => {
  const project = await db.project.update(req.params.id, req.body);
  
  // Invalidate cache
  await cacheDel(`project:${req.params.id}`);
  
  res.json(project);
});
```

## API Endpoints

### Check Redis Health
```bash
curl http://localhost:3001/api/cache/health
```

Response:
```json
{
  "status": "ok",
  "message": "Redis connected",
  "ping": "PONG"
}
```

### Set Value
```bash
curl -X POST http://localhost:3001/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key": "myKey", "value": {"data": "test"}, "ttl": 3600}'
```

### Get Value
```bash
curl http://localhost:3001/api/cache/get/myKey
```

### Delete Value
```bash
curl -X DELETE http://localhost:3001/api/cache/delete/myKey
```

### Clear All Cache
```bash
curl -X POST http://localhost:3001/api/cache/flush
```

## Best Practices

1. **Use Namespaces**: Always prefix cache keys with namespace
   ```javascript
   `project:${id}` // Good
   `user:${id}` // Good
   `myKey` // Avoid
   ```

2. **Appropriate TTL**: Set TTL based on data freshness needs
   ```javascript
   3600   // 1 hour for stable data (users, projects)
   300    // 5 minutes for frequently changing data (dashboards)
   60     // 1 minute for real-time data (metrics)
   ```

3. **Invalidate on Changes**: Clear cache when data is modified
   ```javascript
   // After update/delete operations
   await cacheDel(`project:${id}`);
   ```

4. **Graceful Degradation**: Handle Redis being unavailable
   ```javascript
   const data = await cacheGet(key) || await fetchFromDatabase();
   ```

## Testing

### Start Backend with Redis
```bash
npm run dev:backend
```

### Test Connection
```bash
curl http://localhost:3001/api/cache/health
```

### Run Integration Tests
```bash
npm run test:integration
```

## Troubleshooting

### Redis Connection Failed
- Verify `REDIS_URL` is set correctly
- Check Redis server is running
- Ensure firewall allows connection to Redis host

### Cache Not Working
- Check Redis logs: `docker logs <redis-container>`
- Verify TTL is set (default: 3600 seconds)
- Check cache keys don't exceed Redis key size limit

### Memory Issues
- Monitor Redis memory: Use `redis-cli` → `INFO memory`
- Implement eviction policy: `maxmemory-policy allkeys-lru`
- Clear cache periodically: `POST /api/cache/flush`

## Production Considerations

1. **Persistence**: Enable AOF or RDB snapshots
2. **Monitoring**: Track hit/miss rates and memory usage
3. **Clustering**: Use Redis Cluster for high availability
4. **Security**: Use TLS and authentication
5. **Backup**: Regular backups of Redis data
