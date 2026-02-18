# Redis Integration - Visual Guide

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/App)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP Request (REST API)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express Backend (3001)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Route Handler                                           │  │
│  │                                                           │  │
│  │  1. Check cache: cacheGet('user:123')                   │  │
│  │      ↓ MISS → fetch database                            │  │
│  │      ↓ HIT  → return cached value                       │  │
│  │  2. Update cache: cacheSet('user:123', data, 3600)     │  │
│  │  3. Return response to client                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│        ▲                              │                          │
│        │                              ▼                          │
│        │                   ┌──────────────────┐                 │
│        │                   │  Cache Helper    │                 │
│        │                   │  (lib/redis.js)  │                 │
│        └───────────────────┤                  │                 │
│                            └─────────┬────────┘                 │
└────────────────────────────────────────┼──────────────────────┘
                                         │
                            Network (HTTPS/TLS)
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Redis Server (Cloud)                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  In-Memory Data Store                                   │   │
│  │                                                          │   │
│  │  key: "user:123"       → value: {id, name, email...}  │   │
│  │  key: "user:456"       → value: {...}                 │   │
│  │  key: "project:789"    → value: {...}                 │   │
│  │  key: "dashboard:kpi"  → value: {...}                 │   │
│  │  ...                                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  TTL Expiration: Keys auto-delete after timeout                │
└─────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
                    Database Connection (Optional Fallback)
                                    │
┌─────────────────────────────────────────────────────────────────┐
│               PostgreSQL Database (if cache miss)                │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow - Cache Hit

```
Client Request
      │
      ▼
    Express Handler
      │
      ├─→ cacheGet('user:123')
      │        │
      │        ▼
      │    ✅ FOUND in Redis
      │        │
      │        └─→ Return cached data (~1-2ms)
      │
      ▼
   Client Response ⚡ FAST
```

## Data Flow - Cache Miss

```
Client Request
      │
      ▼
    Express Handler
      │
      ├─→ cacheGet('user:123')
      │        │
      │        ▼
      │    ❌ NOT FOUND in Redis
      │        │
      │        ▼
      │    Query Database (~100-500ms)
      │        │
      │        ▼
      │    cacheSet('user:123', data, 3600)
      │        │
      │        └─→ Stored in Redis for 1 hour
      │
      ▼
   Client Response (first request slower)
```

## File Organization

```
backend/
├── lib/
│   ├── redis.js                    ← Core Redis client
│   ├── redis.d.ts                  ← TypeScript definitions
│   ├── cache-helper.js             ← High-level helpers
│   └── cache-helper.d.ts           ← TypeScript definitions
│
├── routes/
│   ├── redis-routes.js             ← Cache API endpoints
│   └── [other routes]
│
├── app.js                          ← Updated with Redis init
└── test-redis.mjs                  ← Connection test

Project Root/
├── REDIS_SETUP.md                  ← Detailed guide
├── REDIS_ENV_SETUP.md              ← Quick setup
├── REDIS_API_DOCS.md               ← API reference
├── REDIS_IMPLEMENTATION_EXAMPLES.md ← Code examples
├── REDIS_QUICK_CHECKLIST.md        ← Setup checklist
└── [other documentation]
```

## Setup Timeline

```
STEP 1: Add REDIS_URL to backend/.env
┌────────────────────────┐
│   Open backend/.env    │
│   Add REDIS_URL line   │
│   Save file            │
└────────────────────────┘
         ⏱️  2 min

STEP 2: Test Connection
┌────────────────────────┐
│   cd backend           │
│   node test-redis.mjs  │
│   Verify "✨ All tests" │
└────────────────────────┘
         ⏱️  1 min

STEP 3: Start Backend
┌────────────────────────┐
│   npm run dev:backend  │
│   See "✅ Redis        │
│   connected"           │
└────────────────────────┘
         ⏱️  1 min

STEP 4: Test Endpoints
┌────────────────────────┐
│   curl /api/cache/...  │
│   Verify responses     │
│   All working ✓        │
└────────────────────────┘
         ⏱️  2 min

TOTAL: ~6 minutes ⚡
```

## API Endpoint Flow

```
Request Flow for Cache Operations:

┌─────────────────┐
│  Client Request │
└────────┬────────┘
         │
         ▼
    ┌────────────────────────────────────┐
    │  Express Route Handler             │
    │  (redis-routes.js)                 │
    └────────┬───────────────────────────┘
             │
      ┌──────┴──────────────┬──────────────┬──────────────┐
      │                     │              │              │
      ▼                     ▼              ▼              ▼
   GET /health        POST /set      GET /get/:key   DELETE /delete
   (check Redis)      (store)        (retrieve)      (delete)
      │                     │              │              │
      ├─→ redis.ping()      ├─→ setEx()   ├─→ get()      ├─→ del()
      │                     │              │              │
      └─→ Return status     └─→ Store      └─→ Parse      └─→ Delete
                               in Redis         JSON         key
         │                     │              │              │
         └─────────────────────┴──────────────┴──────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Send Response      │
                    │  (JSON)             │
                    └─────────┬───────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │ Client Recv  │
                        └──────────────┘
```

## Cache Key Naming Strategy

```
Pattern: resource_type:resource_id:optional_variant

Examples:
┌─────────────────────────────────────┐
│ SINGLE RESOURCES                    │
├─────────────────────────────────────┤
│ user:123                            │
│ project:456                         │
│ team:789                            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ HIERARCHICAL DATA                   │
├─────────────────────────────────────┤
│ project:456:tasks                   │
│ project:456:team                    │
│ team:789:members                    │
│ team:789:performance                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ USER-SPECIFIC DATA                  │
├─────────────────────────────────────┤
│ dashboard:kpi:user-123              │
│ dashboard:project:user-123          │
│ preferences:user-123                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ GLOBAL/SHARED DATA                  │
├─────────────────────────────────────┤
│ config:app                          │
│ filters:options                     │
│ settings:general                    │
└─────────────────────────────────────┘
```

## TTL Strategy

```
Data Type               │  TTL     │  Reason
────────────────────────┼──────────┼────────────────────────
User profiles           │  3600s   │ Stable, update rarely
                        │  (1h)    │
────────────────────────┼──────────┼────────────────────────
Project info            │  3600s   │ Changes occasionally
                        │  (1h)    │
────────────────────────┼──────────┼────────────────────────
Dashboard metrics       │  300s    │ Updates frequently
                        │  (5m)    │
────────────────────────┼──────────┼────────────────────────
Real-time KPIs          │  60s     │ Changes every minute
                        │  (1m)    │
────────────────────────┼──────────┼────────────────────────
Configuration           │  86400s  │ Rarely changes
                        │  (24h)   │
────────────────────────┼──────────┼────────────────────────
Session data            │  86400s  │ Daily refresh
                        │  (24h)   │
```

## Performance Comparison

```
WITHOUT CACHE:
────────────────────────────────────────
Request
  ├─→ Database Query    (~100-500ms)
  ├─→ Process Result    (~10-50ms)
  ├─→ Serialize JSON    (~5-10ms)
  └─→ Send Response     (~1-5ms)
    = Total: 116-565ms ⚠️  SLOW

WITH CACHE (HIT):
────────────────────────────────────────
Request
  ├─→ Redis Lookup      (~1-2ms)
  ├─→ Parse JSON        (~1ms)
  ├─→ Send Response     (~1-5ms)
    = Total: 3-8ms ⚡ FAST (99.5% improvement!)

WITH CACHE (MISS):
────────────────────────────────────────
Request
  ├─→ Redis Lookup      (~1ms)
  ├─→ Database Query    (~100-500ms)
  ├─→ Cache Write       (~2-5ms)
  ├─→ Send Response     (~1-5ms)
    = Total: 104-511ms (Similar to no cache)
    But next request: 3-8ms ✅
```

## Integration Steps

```
STEP 1: Choose Endpoint to Cache
┌──────────────────────────────────────┐
│ Example: GET /api/users/:id          │
└──────────────────────────────────────┘

STEP 2: Identify Cache Key Pattern
┌──────────────────────────────────────┐
│ Key: `user:${id}`                    │
│ TTL: 3600 (1 hour)                   │
└──────────────────────────────────────┘

STEP 3: Add Cache Check
┌──────────────────────────────────────┐
│ const user = await cacheGet(key)     │
│ if (!user) {                         │
│   user = await db.users.find(id)     │
│   await cacheSet(key, user, 3600)    │
│ }                                    │
└──────────────────────────────────────┘

STEP 4: Add Cache Invalidation
┌──────────────────────────────────────┐
│ In PUT/DELETE routes:                │
│ await cacheDel(key)                  │
│ // Now next GET will fetch fresh     │
└──────────────────────────────────────┘

STEP 5: Test
┌──────────────────────────────────────┐
│ ✓ GET returns cached data            │
│ ✓ PUT returns fresh data             │
│ ✓ Next GET uses fresh cache          │
└──────────────────────────────────────┘
```

## Health Check Status

```
HEALTHY REDIS:
┌────────────────────────────────────────┐
│ GET /api/cache/health                  │
│                                        │
│ {                                      │
│   "status": "ok",      ✅ GOOD        │
│   "message": "Redis connected",        │
│   "ping": "PONG"                       │
│ }                                      │
└────────────────────────────────────────┘

REDIS UNAVAILABLE:
┌────────────────────────────────────────┐
│ GET /api/cache/health                  │
│                                        │
│ {                                      │
│   "status": "error",   ❌ BAD         │
│   "message": "Redis not initialized"   │
│ }                                      │
│                                        │
│ Action: Check .env, restart backend    │
└────────────────────────────────────────┘
```

---

💡 **Key Takeaway**: Redis reduces database load by ~99.5% for cached data!
