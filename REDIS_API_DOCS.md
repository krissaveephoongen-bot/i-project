# Redis Cache API Documentation

Base URL: `http://localhost:3001/api/cache`

## Endpoints

### 1. Health Check
Check Redis connection status.

**Request**
```
GET /health
```

**Response (200 OK)**
```json
{
  "status": "ok",
  "message": "Redis connected",
  "ping": "PONG"
}
```

**Response (500 Error)**
```json
{
  "status": "error",
  "message": "Redis not initialized"
}
```

**cURL Example**
```bash
curl http://localhost:3001/api/cache/health
```

---

### 2. Set Cache Value
Store a value in cache with optional TTL.

**Request**
```
POST /set
Content-Type: application/json
```

**Body**
```json
{
  "key": "string (required)",
  "value": "any (required)",
  "ttl": "number (optional, in seconds, default: 3600)"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "key": "myKey",
  "message": "Value cached successfully"
}
```

**Response (400 Bad Request)**
```json
{
  "error": "key and value are required"
}
```

**cURL Examples**

With default 1-hour TTL:
```bash
curl -X POST http://localhost:3001/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key":"user:123","value":{"id":123,"name":"John","email":"john@example.com"}}'
```

With custom 10-minute TTL:
```bash
curl -X POST http://localhost:3001/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key":"dashboard:kpi","value":{"total":1000,"active":50},"ttl":600}'
```

No expiration (use carefully):
```bash
curl -X POST http://localhost:3001/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key":"config","value":{"version":"1.0.0"},"ttl":null}'
```

---

### 3. Get Cache Value
Retrieve a value from cache.

**Request**
```
GET /get/:key
```

**URL Parameters**
- `key` - Cache key to retrieve

**Response (200 OK)**
```json
{
  "key": "myKey",
  "value": {
    "id": 123,
    "name": "John"
  }
}
```

**Response (404 Not Found)**
```json
{
  "error": "Key not found"
}
```

**cURL Examples**

```bash
# Get user cache
curl http://localhost:3001/api/cache/get/user:123

# Get dashboard KPI
curl http://localhost:3001/api/cache/get/dashboard:kpi

# Get config
curl http://localhost:3001/api/cache/get/config
```

---

### 4. Delete Cache Value
Remove a value from cache.

**Request**
```
DELETE /delete/:key
```

**URL Parameters**
- `key` - Cache key to delete

**Response (200 OK - Key Deleted)**
```json
{
  "success": true,
  "key": "myKey",
  "message": "Key deleted"
}
```

**Response (200 OK - Key Not Found)**
```json
{
  "success": false,
  "key": "myKey",
  "message": "Key not found"
}
```

**cURL Examples**

```bash
# Delete user cache
curl -X DELETE http://localhost:3001/api/cache/delete/user:123

# Delete dashboard cache
curl -X DELETE http://localhost:3001/api/cache/delete/dashboard:kpi

# Delete multiple keys
curl -X DELETE http://localhost:3001/api/cache/delete/project:456
curl -X DELETE http://localhost:3001/api/cache/delete/project:789
```

---

### 5. Flush All Cache
Clear all cached data (use with caution in production).

**Request**
```
POST /flush
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Cache flushed"
}
```

**cURL Example**

```bash
curl -X POST http://localhost:3001/api/cache/flush
```

**⚠️ Warning**: This clears all cache. Use only for:
- Testing/debugging
- Cache corruption recovery
- Full refresh requirement

---

## Request/Response Examples

### Example 1: User Data Caching

**Request: Set user in cache**
```bash
curl -X POST http://localhost:3001/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user:john-doe",
    "value": {
      "id": "john-doe",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "manager",
      "department": "Engineering"
    },
    "ttl": 3600
  }'
```

**Response**
```json
{
  "success": true,
  "key": "user:john-doe",
  "message": "Value cached successfully"
}
```

**Request: Retrieve user from cache**
```bash
curl http://localhost:3001/api/cache/get/user:john-doe
```

**Response**
```json
{
  "key": "user:john-doe",
  "value": {
    "id": "john-doe",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "manager",
    "department": "Engineering"
  }
}
```

---

### Example 2: Project Dashboard Caching

**Request: Set dashboard metrics**
```bash
curl -X POST http://localhost:3001/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{
    "key": "dashboard:project:proj-123",
    "value": {
      "projectId": "proj-123",
      "projectName": "Website Redesign",
      "status": "in_progress",
      "progress": 65,
      "budget": {
        "allocated": 50000,
        "spent": 32500,
        "remaining": 17500
      },
      "team": {
        "total": 8,
        "allocated": 6,
        "available": 2
      },
      "timeline": {
        "startDate": "2024-01-15",
        "endDate": "2024-06-30",
        "daysRemaining": 163
      }
    },
    "ttl": 300
  }'
```

**Response**
```json
{
  "success": true,
  "key": "dashboard:project:proj-123",
  "message": "Value cached successfully"
}
```

---

### Example 3: Cached List Data

**Request: Cache filter options**
```bash
curl -X POST http://localhost:3001/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{
    "key": "filters:options",
    "value": {
      "statuses": ["todo", "in_progress", "completed"],
      "priorities": ["low", "medium", "high"],
      "categories": ["Development", "Testing", "Documentation"],
      "teams": [
        {"id": "team-1", "name": "Frontend"},
        {"id": "team-2", "name": "Backend"},
        {"id": "team-3", "name": "QA"}
      ]
    },
    "ttl": 86400
  }'
```

---

## Error Handling

### Common Errors

**400 - Bad Request**
```json
{
  "error": "key and value are required"
}
```
**Cause**: Missing required fields in POST request

**404 - Not Found**
```json
{
  "error": "Key not found"
}
```
**Cause**: Key doesn't exist or has expired

**500 - Internal Server Error**
```json
{
  "error": "Redis connection failed"
}
```
**Cause**: Redis server unavailable or connection issue

---

## Best Practices

### 1. Key Naming Convention
```
Resource:ID
team:123
user:john-doe
project:proj-456
dashboard:kpi:user-789
report:executive:2024-02
```

### 2. TTL Selection
```
3600      // 1 hour   - User profiles, stable data
1800      // 30 mins  - Dashboard metrics
300       // 5 mins   - Real-time metrics
60        // 1 min    - High-frequency data
86400     // 24 hours - Configuration, rarely changes
null      // Forever  - Avoid in production
```

### 3. Cache Invalidation
Always delete related caches when data changes:
```bash
# After updating user
DELETE /delete/user:123

# After updating project
DELETE /delete/project:456
DELETE /delete/dashboard:project:456
```

### 4. Monitoring Cache Health
```bash
# Regular health checks
curl http://localhost:3001/api/cache/health

# Check key exists
curl http://localhost:3001/api/cache/get/user:123
# Returns 404 if expired/deleted

# Monitor size
# Note: Current API doesn't show size, use redis-cli
redis-cli DBSize
```

---

## Integration with Application

### In Node.js/Express
```javascript
import axios from 'axios';

async function setCache(key, value, ttl = 3600) {
  try {
    const response = await axios.post('http://localhost:3001/api/cache/set', {
      key,
      value,
      ttl
    });
    return response.data;
  } catch (error) {
    console.error('Cache set error:', error.message);
  }
}

async function getCache(key) {
  try {
    const response = await axios.get(`http://localhost:3001/api/cache/get/${key}`);
    return response.data.value;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Cache get error:', error.message);
  }
}
```

### In Frontend (React/Next.js)
```javascript
import axios from 'axios';

// Set cache via API call
async function cacheUserData(user) {
  await fetch('/api/cache/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: `user:${user.id}`,
      value: user,
      ttl: 3600
    })
  });
}

// Get cache via API call
async function getCachedUser(userId) {
  const response = await fetch(`/api/cache/get/user:${userId}`);
  if (response.ok) {
    const data = await response.json();
    return data.value;
  }
  return null;
}
```

---

## Performance Metrics

Expected response times:
- **Health check**: < 1ms
- **Cache hit (get)**: 1-5ms
- **Cache miss (set)**: 2-10ms
- **Delete**: 1-5ms
- **Flush**: 10-100ms (depends on data size)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 Error | Redis not initialized, check REDIS_URL |
| Key not found | TTL expired or never set, retry POST /set |
| Slow response | Check Redis server performance |
| Connection refused | Redis server down, restart it |

---

Last Updated: 2024
