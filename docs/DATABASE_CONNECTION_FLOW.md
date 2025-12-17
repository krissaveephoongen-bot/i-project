# ระบบการเชื่อมต่อฐานข้อมูล - Connection Flow Diagram

## 1. Architecture Overview (ภาพรวมสถาปัตยกรรม)

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend (React 18)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           DatabaseStatus Component                       │   │
│  │  - Auto-refresh every 30 seconds                         │   │
│  │  - Shows connection status (✓ or ✗)                      │   │
│  │  - Tooltip with detailed info                            │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │         useDatabaseStatus Hook (React)                  │   │
│  │  - Fetches /api/health/db/status                        │   │
│  │  - Manages loading, error, and refresh states           │   │
│  │  - Auto-cleanup on unmount                              │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │     databaseService.ts (TypeScript Service)             │   │
│  │  - getHealthCheck()                                      │   │
│  │  - testSimpleConnection()                                │   │
│  │  - getConnectionStatus()                                 │   │
│  │  - fetchWithTimeout() with 10s timeout                   │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │ HTTP Fetch                             │
└─────────────────────────┼──────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────┐
│                    Express.js Server (Node.js)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Routes: server/health-routes.js             │   │
│  │                                                           │   │
│  │  GET /api/health/db                                      │   │
│  │    → Full health check (3 retries)                       │   │
│  │                                                           │   │
│  │  GET /api/health/db/simple                               │   │
│  │    → Simple connection test (2 retries)                  │   │
│  │                                                           │   │
│  │  GET /api/health/db/status                               │   │
│  │    → Current status (no retries)                          │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │   neon-connection.js (Database Module)                  │   │
│  │                                                           │   │
│  │  • createDatabasePool()                                   │   │
│  │    ├─ Singleton pattern                                   │   │
│  │    └─ Max 20 connections                                  │   │
│  │                                                           │   │
│  │  • testConnection(retryCount, maxRetries)                │   │
│  │    ├─ Execute: SELECT NOW()                              │   │
│  │    ├─ Exponential backoff (2^n seconds)                   │   │
│  │    └─ Max delay: 30 seconds                               │   │
│  │                                                           │   │
│  │  • getConnectionStatus()                                  │   │
│  │    └─ Returns live status object                          │   │
│  │                                                           │   │
│  │  • healthCheck()                                          │   │
│  │    ├─ Test connection                                     │   │
│  │    ├─ Query: SELECT NOW(), version()                      │   │
│  │    └─ Return: status + version info                       │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │ PostgreSQL Driver (pg)                 │
└─────────────────────────┼──────────────────────────────────────┘
                          │ TCP + SSL/TLS
┌─────────────────────────▼──────────────────────────────────────┐
│              Neon PostgreSQL (Serverless)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  • Endpoint: ep-muddy-cherry-ah612m1a-pooler.c-3...             │
│  • SSL: Required (sslmode=require)                               │
│  • Channel binding: Required                                     │
│  • Pool connections: 20 max                                      │
│  • Version: PostgreSQL 17.7                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Request/Response Flow (ขั้นตอนการร้องขอ/การตอบกลับ)

### Scenario 1: DatabaseStatus Component Loads
```
Timeline:
┌─────────────────────────────────────────────────────────────┐
│ 1. Component mounts                                           │
│    └─ useDatabaseStatus() hook initializes                  │
│       └─ setLoading(true)                                   │
│                                                              │
│ 2. Effect hook triggers                                      │
│    └─ fetchStatus() called                                  │
│       └─ fetch('/api/health/db/status')                     │
│          └─ Request sent to Express server                  │
│                                                              │
│ 3. Server receives request                                  │
│    └─ health-routes.js handler                              │
│       └─ getConnectionStatus() called                       │
│          └─ Returns cached status object                    │
│                                                              │
│ 4. Response returned                                         │
│    └─ { success: true, status: "connected", data: {...} }   │
│       └─ setStatus(data)                                    │
│       └─ setLoading(false)                                  │
│                                                              │
│ 5. Component renders with status                             │
│    └─ Badge with ✓ icon (green) or ✗ icon (orange)           │
│                                                              │
│ 6. Auto-refresh interval starts                              │
│    └─ 30,000ms interval (configurable)                       │
│       └─ Steps 2-5 repeat automatically                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Timing: 50-200ms per request (from frontend to response)
```

### Scenario 2: Manual Health Check
```
Timeline:
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Health Check" button                        │
│    └─ handleHealthCheck() called                            │
│       └─ setLoadingHealthCheck(true)                        │
│                                                              │
│ 2. getHealthCheck() API call                                │
│    └─ fetch('/api/health/db')                               │
│       └─ Request sent                                       │
│                                                              │
│ 3. Server processes full health check                       │
│    └─ healthCheck() in neon-connection.js                   │
│       ├─ testConnection(0, 3) - 3 retries                   │
│       │  ├─ Attempt 1: Failed? → Wait 1s                    │
│       │  ├─ Attempt 2: Failed? → Wait 2s                    │
│       │  └─ Attempt 3: Failed? → Wait 4s                    │
│       │                                                      │
│       └─ If successful:                                     │
│          ├─ Query: SELECT NOW(), version()                  │
│          └─ Return: { status: "healthy", data: {...} }      │
│                                                              │
│ 4. Response with detailed info                              │
│    ├─ currentTime: "2025-12-15T10:30:00Z"                   │
│    ├─ postgresVersion: "PostgreSQL 17.7..."                 │
│    └─ connectionStatus: { ... }                             │
│                                                              │
│ 5. Display results in DatabaseStatusPage                    │
│    └─ setHealthCheckResult(result)                          │
│    └─ Show green/red card based on status                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Timing: 200-1000ms+ (depends on retries needed)
```

### Scenario 3: Connection Retry Flow
```
Timeline with Exponential Backoff:
┌─────────────────────────────────────────────────────────────┐
│ Initial Connection Attempt (t=0ms)                          │
│ └─ pool.connect() + query                                   │
│    └─ ❌ FAILED (Network timeout)                            │
│                                                              │
│ Retry 1 (t=1000ms, wait 1 second)                           │
│ └─ pool.connect() + query                                   │
│    └─ ❌ FAILED (SSL error)                                  │
│    └─ console.error('attempt 1/5')                          │
│                                                              │
│ Retry 2 (t=3000ms, wait 2 seconds)                          │
│ └─ pool.connect() + query                                   │
│    └─ ❌ FAILED (Connection refused)                         │
│    └─ console.error('attempt 2/5')                          │
│                                                              │
│ Retry 3 (t=7000ms, wait 4 seconds)                          │
│ └─ pool.connect() + query                                   │
│    └─ ✅ SUCCESS!                                            │
│    └─ connectionStatus.connected = true                      │
│    └─ connectionStatus.retryCount = 3                        │
│                                                              │
│ Total time: 7000ms (7 seconds)                               │
│ Exponential delays: 1s + 2s + 4s = 7s                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Status States (สถานะต่างๆ)

### Connection Status States:
```
┌────────────────────────────────────────────────────────────┐
│                    CONNECTED ✓                              │
├────────────────────────────────────────────────────────────┤
│ Icon Color: 🟢 Green (#52c41a)                              │
│ Message: "เชื่อมต่อแล้ว" (Connected)                        │
│ Properties:                                                 │
│   • connected: true                                         │
│   • lastConnectionAttempt: 2025-12-15T10:30:00.000Z         │
│   • lastSuccessfulConnection: 2025-12-15T10:30:00.000Z      │
│   • lastError: null                                         │
│   • retryCount: 0                                           │
│   • connectionDuration: 145ms                               │
│   • provider: "neon-postgresql"                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    DISCONNECTED ⚠️                           │
├────────────────────────────────────────────────────────────┤
│ Icon Color: 🟠 Orange (#faad14)                              │
│ Message: "ไม่เชื่อมต่อ" (Disconnected)                      │
│ Properties:                                                 │
│   • connected: false                                        │
│   • lastConnectionAttempt: 2025-12-15T10:28:30.000Z         │
│   • lastSuccessfulConnection: 2025-12-15T10:25:00.000Z      │
│   • lastError: "ECONNREFUSED: Connection refused"           │
│   • retryCount: 5                                           │
│   • connectionDuration: null                                │
│   • provider: "neon-postgresql"                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    ERROR ❌                                  │
├────────────────────────────────────────────────────────────┤
│ Icon Color: 🔴 Red (#ff4d4f)                                 │
│ Message: "ไม่สามารถเชื่อมต่อ" (Cannot connect)              │
│ Properties:                                                 │
│   • connected: false                                        │
│   • lastConnectionAttempt: 2025-12-15T10:29:00.000Z         │
│   • lastError: "Invalid SSL certificate"                    │
│   • retryCount: 3+                                          │
│   • Requires manual intervention                            │
└────────────────────────────────────────────────────────────┘
```

---

## 4. API Response Examples

### Health Check - Success Response
```json
{
  "success": true,
  "message": "Database connection is healthy",
  "data": {
    "status": "healthy",
    "database": "postgresql",
    "provider": "neon",
    "currentTime": "2025-12-15T10:30:45.123Z",
    "postgresVersion": "PostgreSQL 17.7 (178558d) on aarch64-unknown-linux-gnu, compiled by gcc (Debian 12.2.0-14+deb12u1) 12.2.0, 64-bit",
    "connectionStatus": {
      "connected": true,
      "lastConnectionAttempt": "2025-12-15T10:30:45.123Z",
      "lastError": null,
      "retryCount": 0,
      "lastSuccessfulConnection": "2025-12-15T10:30:45.123Z",
      "connectionDuration": 156,
      "provider": "neon-postgresql"
    }
  }
}
```

### Health Check - Failure Response (503 Service Unavailable)
```json
{
  "success": false,
  "message": "Database connection is unhealthy",
  "error": "ETIMEDOUT: Connection timeout",
  "data": {
    "status": "unhealthy",
    "database": "postgresql",
    "provider": "neon",
    "error": "Connection attempt timed out after 5000ms",
    "connectionStatus": {
      "connected": false,
      "lastConnectionAttempt": "2025-12-15T10:29:00.000Z",
      "lastError": "ETIMEDOUT: Connection timeout",
      "retryCount": 3,
      "lastSuccessfulConnection": "2025-12-15T10:25:00.000Z",
      "connectionDuration": null,
      "provider": "neon-postgresql"
    }
  }
}
```

### Status Check - Response
```json
{
  "success": true,
  "status": "connected",
  "data": {
    "connected": true,
    "lastConnectionAttempt": "2025-12-15T10:30:45.123Z",
    "lastError": null,
    "retryCount": 0,
    "lastSuccessfulConnection": "2025-12-15T10:30:45.123Z",
    "connectionDuration": 156,
    "provider": "neon-postgresql"
  }
}
```

---

## 5. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Request to /api/health/db/status                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────▼──────────────┐
           │   Try to get status      │
           └───────────┬──────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
      ✓ SUCCESS                   ✗ ERROR
         │                            │
         ▼                            ▼
    return {                    return {
      success: true,              success: false,
      status: "connected",        message: "Failed...",
      data: {...}                 error: error.message
    }                           }
         │                            │
         └─────────────┬──────────────┘
                       │
            ┌──────────▼───────────┐
            │ HTTP Response (200)   │
            └──────────────────────┘
                       │
            ┌──────────▼───────────┐
            │ Frontend receives     │
            │ setStatus(data)       │
            │ setError(null)        │
            └──────────────────────┘

Error Paths:
─────────────────────────────────────────────────────────────
1. Network Error (fetch fails)
   └─ catch block in fetchStatus()
      └─ setError(error.message)
      └─ setStatus(null)

2. Server Error (500)
   └─ response.json() parses error
   └─ if (!data.success) setError()

3. Timeout (10 seconds)
   └─ AbortController triggers
   └─ catch block handles abort
      └─ setError("Request timeout")

4. Connection Exception
   └─ neon-connection.js catches
   └─ Returns unhealthy status
      └─ HTTP 503 response
```

---

## 6. Performance Metrics

### Typical Response Times:

| Operation | Min | Typical | Max |
|-----------|-----|---------|-----|
| Status Check (no retry) | 50ms | 100ms | 150ms |
| Simple Test (2 retries max) | 100ms | 300ms | 5000ms |
| Health Check (3 retries max) | 200ms | 500ms | 9000ms |
| Auto-refresh cycle | - | 30s | 60s (configurable) |
| Exponential backoff | 1s | 2s | 30s |

### Connection Pool Metrics:
- **Max connections**: 20
- **Idle timeout**: 30 seconds
- **Connection timeout**: 5 seconds
- **Max uses per connection**: 7500

---

## 7. Monitoring Checklist

```
Daily Monitoring:
─────────────────────────────────────────────────────────────
□ Check frontend DatabaseStatus indicator (should be ✓)
□ Monitor server console for connection errors
□ Review API response times (should be <200ms)
□ Check retry count (should be 0 for healthy state)
□ Verify lastSuccessfulConnection timestamp is recent

Troubleshooting:
─────────────────────────────────────────────────────────────
□ Run: npm run db:test
□ Check: curl http://localhost:5000/api/health/db
□ Verify: DATABASE_URL environment variable is set
□ Test: Direct PostgreSQL connection
□ Review: Server logs for SSL/TLS errors
□ Check: Network connectivity to Neon endpoint
```

---

**Status**: ✅ All systems operational
**Last Verified**: 2025-12-15 10:30:00
**Database**: PostgreSQL 17.7 on Neon
**Connection**: Healthy
