# Redis Cheat Sheet

Quick reference for Redis integration in your project.

## 🚀 Quick Start (3 minutes)

```bash
# 1. Add to backend/.env
REDIS_URL=redis://default:...@...

# 2. Test connection
cd backend && node test-redis.mjs

# 3. Start backend
npm run dev:backend

# 4. Verify health
curl http://localhost:3001/api/cache/health
```

## 💻 Code Quick Reference

### Basic Functions
```javascript
// Store value
import { cacheSet } from '../lib/redis.js';
await cacheSet('key', value, 3600);

// Retrieve value
import { cacheGet } from '../lib/redis.js';
const value = await cacheGet('key');

// Delete key
import { cacheDel } from '../lib/redis.js';
await cacheDel('key');

// Clear all
import { cacheFlush } from '../lib/redis.js';
await cacheFlush();
```

### Recommended Usage
```javascript
// Cache with fallback
import { getOrFetch, invalidateCache } from '../lib/cache-helper.js';

const data = await getOrFetch('namespace', id, 
  () => db.fetch(id),
  3600
);

// Invalidate after update
await invalidateCache('namespace', id);
```

## 🔌 API Endpoints

```
GET    /api/cache/health              ← Check if working
POST   /api/cache/set                 ← Store value
GET    /api/cache/get/:key            ← Get value
DELETE /api/cache/delete/:key         ← Delete value
POST   /api/cache/flush               ← Clear all
```

## 📋 Common Patterns

### Pattern 1: User Caching
```javascript
const user = await getOrFetch('users', userId,
  () => db.users.findById(userId),
  3600  // 1 hour
);
```

### Pattern 2: Dashboard Data
```javascript
const metrics = await getOrFetch('dashboard:metrics', userId,
  () => calculateMetrics(userId),
  300  // 5 minutes
);
```

### Pattern 3: Cache Invalidation
```javascript
// After update
await db.users.update(id, data);
await invalidateCache('users', id);
```

## ⏱️ TTL Quick Reference

| Data Type | TTL | Reason |
|-----------|-----|--------|
| User profiles | 3600s | Stable data |
| Projects | 3600s | Changes rarely |
| Dashboard KPI | 300s | Updates frequently |
| Metrics | 60s | Real-time data |
| Config | 86400s | Never changes |

## 🧪 Testing Commands

```bash
# Test connection
curl http://localhost:3001/api/cache/health

# Set value
curl -X POST http://localhost:3001/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key":"test","value":{"a":1},"ttl":3600}'

# Get value
curl http://localhost:3001/api/cache/get/test

# Delete value
curl -X DELETE http://localhost:3001/api/cache/delete/test

# Clear all
curl -X POST http://localhost:3001/api/cache/flush
```

## 📁 File Locations

```
Core Files:
  backend/lib/redis.js              ← Main client
  backend/lib/cache-helper.js       ← High-level API
  backend/routes/redis-routes.js    ← API endpoints

Test:
  backend/test-redis.mjs            ← Run tests

Docs:
  REDIS_DOCUMENTATION_INDEX.md      ← Start here
  REDIS_SETUP.md                    ← Full guide
  REDIS_API_DOCS.md                 ← API reference
```

## 🔍 Debugging

```bash
# Check if Redis is running
curl http://localhost:3001/api/cache/health

# Get detailed error
node test-redis.mjs

# Check key exists
curl http://localhost:3001/api/cache/get/mykey
# 200 = exists, 404 = not found

# View app logs
npm run dev:backend
# Look for "✅ Redis connected"
```

## ⚙️ Configuration

### In backend/.env
```env
REDIS_URL=redis://default:password@host:port
```

### Optional: Custom TTL
```javascript
// Default 3600s (1 hour)
await cacheSet('key', value);

// Custom 5 minutes
await cacheSet('key', value, 300);

// No expiration (careful!)
await cacheSet('key', value, null);
```

## 🎯 Integration Steps

```
1. Find slow endpoint
   ↓
2. Identify cache key pattern
   key = `resource:${id}`
   ↓
3. Add cache check
   let data = await cacheGet(key)
   if (!data) {
     data = await db.fetch()
     await cacheSet(key, data, ttl)
   }
   ↓
4. Add invalidation
   // On update/delete
   await cacheDel(key)
   ↓
5. Test
   curl /api/cache/get/key
```

## 💡 Tips & Tricks

### Always use namespaces
```javascript
// Good
`user:${id}`
`project:${id}:tasks`

// Bad
`data`
`temp`
```

### Batch cache operations
```javascript
const keys = ['user:1', 'user:2', 'user:3'];
for (const key of keys) {
  await cacheDel(key);
}
```

### Monitor cache hits
```javascript
// Track cache performance
let hits = 0, misses = 0;
const data = await cacheGet(key);
data ? hits++ : misses++;
```

### Warm cache on startup
```javascript
// Pre-populate frequently used data
async function warmCache() {
  const users = await db.users.findAll();
  for (const user of users) {
    await cacheSet(`user:${user.id}`, user, 3600);
  }
}
```

## ⚡ Performance Targets

- Cache hit: < 5ms
- Cache miss: 100-500ms
- Network overhead: 1-2ms
- Improvement: 99%+ for cached requests

## 🛑 Common Mistakes

```javascript
// ❌ Wrong: Not using namespace
await cacheSet('data', value);

// ✅ Correct: Using namespace
await cacheSet('user:123', value);

// ❌ Wrong: Caching without TTL
await cacheSet('key', value);

// ✅ Correct: Always set TTL
await cacheSet('key', value, 3600);

// ❌ Wrong: Forgetting invalidation
await db.update(id, data);  // No cache clear!

// ✅ Correct: Invalidate after update
await db.update(id, data);
await invalidateCache('resource', id);
```

## 📚 Documentation Quick Links

| Need | Document |
|------|----------|
| 5-min setup | REDIS_ENV_SETUP.md |
| Verify setup | REDIS_QUICK_CHECKLIST.md |
| API details | REDIS_API_DOCS.md |
| Code examples | REDIS_IMPLEMENTATION_EXAMPLES.md |
| Visual learning | REDIS_VISUAL_GUIDE.md |
| Full guide | REDIS_SETUP.md |
| Quick lookup | This file (REDIS_CHEAT_SHEET.md) |

## 🆘 Troubleshooting

| Error | Fix |
|-------|-----|
| REDIS_URL not set | Add to backend/.env |
| Connection refused | Check Redis server |
| test-redis fails | Run with error details |
| Endpoint 500 error | Check Redis connection |
| Cache miss always | Check TTL, key pattern |

## 📞 Support Resources

```
Setup Issue?     → REDIS_SETUP_SUMMARY.txt
Need API detail? → REDIS_API_DOCS.md
Want examples?   → REDIS_IMPLEMENTATION_EXAMPLES.md
Learn visually?  → REDIS_VISUAL_GUIDE.md
Quick help?      → This file!
```

## ✅ Checklist Before Production

- [ ] REDIS_URL added
- [ ] test-redis.mjs passes
- [ ] Backend starts with "✅ Redis connected"
- [ ] Health endpoint works
- [ ] Caching integrated in 3+ endpoints
- [ ] Cache invalidation working
- [ ] Tests passing
- [ ] Monitoring in place

---

**Pro Tip**: Use `getOrFetch()` from cache-helper.js - it handles everything automatically!

**Quick Reference**: This file is your cheat sheet. Bookmark it! 📌

---

For detailed info, see [REDIS_DOCUMENTATION_INDEX.md](./REDIS_DOCUMENTATION_INDEX.md)
