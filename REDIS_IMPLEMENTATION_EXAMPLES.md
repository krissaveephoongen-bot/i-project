# Redis Implementation Examples

## Complete Examples for Common Use Cases

### 1. Caching User Lookups

```javascript
// backend/routes/user-routes.js
import express from 'express';
import { getOrFetch, invalidateCache } from '../lib/cache-helper.js';
import { db } from '../lib/db.js';

const router = express.Router();

// GET user by ID (cached)
router.get('/:id', async (req, res) => {
  try {
    const user = await getOrFetch('users', req.params.id, 
      () => db.users.findById(req.params.id),
      3600 // Cache for 1 hour
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user (invalidate cache)
router.put('/:id', async (req, res) => {
  try {
    const user = await db.users.update(req.params.id, req.body);
    
    // Invalidate cache after update
    await invalidateCache('users', req.params.id);
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE user (invalidate cache)
router.delete('/:id', async (req, res) => {
  try {
    await db.users.delete(req.params.id);
    
    // Invalidate cache after delete
    await invalidateCache('users', req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 2. Caching Project Dashboard Data

```javascript
// backend/routes/dashboard-routes.js
import express from 'express';
import { cacheGet, cacheSet } from '../lib/redis.js';
import { db } from '../lib/db.js';

const router = express.Router();

// GET dashboard KPIs (cached, 5 minute TTL)
router.get('/kpi/:userId', async (req, res) => {
  const cacheKey = `dashboard:kpi:${req.params.userId}`;
  
  try {
    // Check cache first
    let kpi = await cacheGet(cacheKey);
    
    if (!kpi) {
      // Fetch from database
      kpi = await db.dashboards.getKPIs(req.params.userId);
      
      // Cache for 5 minutes (more frequent updates needed)
      await cacheSet(cacheKey, kpi, 300);
    }
    
    res.json(kpi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET team performance (cached, 1 hour)
router.get('/performance/:teamId', async (req, res) => {
  const cacheKey = `dashboard:performance:${req.params.teamId}`;
  
  try {
    let performance = await cacheGet(cacheKey);
    
    if (!performance) {
      performance = await db.dashboards.getPerformance(req.params.teamId);
      await cacheSet(cacheKey, performance, 3600);
    }
    
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 3. Caching with Response Compression

```javascript
// backend/routes/reports-routes.js
import express from 'express';
import { cacheGet, cacheSet } from '../lib/redis.js';
import { generateReport } from '../services/report-service.js';

const router = express.Router();

// GET expensive report (cached, 30 minute TTL)
router.get('/executive/:projectId', async (req, res) => {
  const cacheKey = `report:executive:${req.params.projectId}`;
  
  try {
    let report = await cacheGet(cacheKey);
    
    if (!report) {
      // This might take 5+ seconds to generate
      report = await generateReport(req.params.projectId);
      
      // Cache for 30 minutes
      await cacheSet(cacheKey, report, 1800);
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 4. Cache Warming (Pre-populate Cache)

```javascript
// backend/services/cache-warmer.js
import { cacheSet } from '../lib/redis.js';
import { db } from '../lib/db.js';

/**
 * Warm cache with frequently accessed data
 * Call this on server startup or periodically
 */
export async function warmCache() {
  console.log('🔥 Warming cache...');
  
  try {
    // Cache all active projects
    const projects = await db.projects.findAllActive();
    for (const project of projects) {
      await cacheSet(`project:${project.id}`, project, 3600);
    }
    console.log(`✅ Cached ${projects.length} projects`);
    
    // Cache all teams
    const teams = await db.teams.findAll();
    for (const team of teams) {
      await cacheSet(`team:${team.id}`, team, 3600);
    }
    console.log(`✅ Cached ${teams.length} teams`);
    
    // Cache filter options (used by all clients)
    const filterOptions = await db.filters.getOptions();
    await cacheSet('filters:options', filterOptions, 86400); // 24 hours
    console.log('✅ Cached filter options');
    
  } catch (error) {
    console.error('Error warming cache:', error);
  }
}

// In app.js, call after server starts:
// import { warmCache } from './services/cache-warmer.js';
// warmCache();
```

### 5. Cached Aggregations and Aggregations

```javascript
// backend/routes/analytics-routes.js
import express from 'express';
import { cacheGet, cacheSet } from '../lib/redis.js';
import { db } from '../lib/db.js';

const router = express.Router();

// GET project statistics (cached, 1 hour)
router.get('/projects/stats', async (req, res) => {
  const cacheKey = 'analytics:projects:stats';
  
  try {
    let stats = await cacheGet(cacheKey);
    
    if (!stats) {
      // Expensive aggregation query
      stats = await db.projects.getStatistics();
      await cacheSet(cacheKey, stats, 3600);
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET team utilization (cached, 30 minutes)
router.get('/team/utilization', async (req, res) => {
  const cacheKey = 'analytics:team:utilization';
  
  try {
    let utilization = await cacheGet(cacheKey);
    
    if (!utilization) {
      utilization = await db.teams.calculateUtilization();
      await cacheSet(cacheKey, utilization, 1800);
    }
    
    res.json(utilization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 6. Invalidating Related Caches

```javascript
// backend/services/cache-invalidation.js
import { cacheDel } from '../lib/redis.js';

/**
 * When a project is updated, invalidate related caches
 */
export async function invalidateProjectCaches(projectId) {
  const keys = [
    `project:${projectId}`,
    `project:${projectId}:tasks`,
    `project:${projectId}:team`,
    `analytics:projects:stats`,
    `dashboard:kpi:*`, // Would need pattern-based deletion
  ];
  
  for (const key of keys) {
    try {
      await cacheDel(key);
      console.log(`🗑️ Invalidated: ${key}`);
    } catch (error) {
      console.warn(`Error invalidating ${key}:`, error);
    }
  }
}

/**
 * When a user is updated, invalidate their caches
 */
export async function invalidateUserCaches(userId) {
  const keys = [
    `users:${userId}`,
    `dashboard:kpi:${userId}`,
    `user:${userId}:permissions`,
  ];
  
  for (const key of keys) {
    await cacheDel(key);
  }
}
```

### 7. Cache with Session Data

```javascript
// backend/services/session-cache.js
import { cacheSet, cacheGet, cacheDel } from '../lib/redis.js';

/**
 * Cache user session with custom TTL (24 hours)
 */
export async function cacheUserSession(userId, sessionData) {
  const key = `session:${userId}`;
  const ttl = 86400; // 24 hours
  await cacheSet(key, sessionData, ttl);
}

/**
 * Get cached user session
 */
export async function getUserSession(userId) {
  const key = `session:${userId}`;
  return await cacheGet(key);
}

/**
 * Clear user session on logout
 */
export async function clearUserSession(userId) {
  const key = `session:${userId}`;
  await cacheDel(key);
}
```

## Best Practices Summary

### Cache Keys
```javascript
// Good - namespaced and hierarchical
`user:${id}`
`project:${id}:tasks`
`team:${id}:members`
`dashboard:kpi:${userId}`

// Avoid - unclear or colliding
`data`
`myKey`
`temp`
```

### TTL Guidelines
```javascript
3600      // 1 hour  - stable data (users, projects)
1800      // 30 mins - dashboard data
300       // 5 mins  - KPIs, metrics
60        // 1 min   - real-time data
86400     // 24 hours- configuration, filters
0         // Never expire (use with caution)
```

### Invalidation
```javascript
// On CREATE - no cache to invalidate
// On UPDATE - invalidate specific item and aggregations
// ON DELETE - invalidate specific item and lists

router.put('/api/projects/:id', async (req, res) => {
  const project = await db.projects.update(req.params.id, req.body);
  await invalidateCache('projects', req.params.id);
  res.json(project);
});
```

## Testing Your Implementation

```javascript
// test-cache.mjs
import { cacheGet, cacheSet, cacheDel } from './backend/lib/redis.js';

async function test() {
  // Set
  await cacheSet('test:user:1', { name: 'John', id: 1 }, 3600);
  console.log('✅ Set cache');
  
  // Get
  const user = await cacheGet('test:user:1');
  console.log('✅ Retrieved:', user);
  
  // Delete
  await cacheDel('test:user:1');
  console.log('✅ Deleted cache');
}

test().catch(console.error);
```

Ready to implement! 🚀
