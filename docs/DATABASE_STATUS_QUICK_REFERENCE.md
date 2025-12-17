# Database Connection Status - Quick Reference (คำอ้างอิงด่วน)

## ⚡ Quick Check Commands

```bash
# 1. Test database connection
npm run db:test

# 2. Check health status (Full)
curl http://localhost:5000/api/health/db

# 3. Check simple status
curl http://localhost:5000/api/health/db/simple

# 4. Check current status
curl http://localhost:5000/api/health/db/status
```

---

## 📍 Component Locations

| Component | Location | Type |
|-----------|----------|------|
| **Frontend Status Widget** | `src/components/DatabaseStatus.tsx` | React Component |
| **Status Page** | `src/pages/DatabaseStatusPage.tsx` | React Page |
| **React Hook** | `src/hooks/useDatabaseStatus.ts` | Custom Hook |
| **API Service** | `src/services/databaseService.ts` | TypeScript |
| **Backend Routes** | `server/health-routes.js` | Express Routes |
| **Connection Module** | `database/neon-connection.js` | Node.js Module |

---

## 🔌 API Endpoints Summary

```
GET /api/health/db
├─ Purpose: Full health check (3 retries)
├─ Response: 200 or 503
├─ Time: 200-1000ms
└─ Includes: Status, version, connection details

GET /api/health/db/simple
├─ Purpose: Quick connection test (2 retries)
├─ Response: 200 or 503
├─ Time: 50-500ms
└─ Includes: Simple success/failure

GET /api/health/db/status
├─ Purpose: Current status (no retries)
├─ Response: 200 (always succeeds)
├─ Time: 50-150ms
└─ Includes: Cached connection status
```

---

## 🟢 Status Indicators

### Connected (เชื่อมต่อแล้ว)
```
Icon: ✅ CheckCircleOutlined
Color: Green (#52c41a)
Message: "เชื่อมต่อแล้ว"
Props: connected: true, retryCount: 0
```

### Disconnected (ไม่เชื่อมต่อ)
```
Icon: ⚠️ ExclamationCircleOutlined
Color: Orange (#faad14)
Message: "ไม่เชื่อมต่อ"
Props: connected: false, retryCount > 0
```

### Error (ข้อผิดพลาด)
```
Icon: ❌ CloseCircleOutlined
Color: Red (#ff4d4f)
Message: "ไม่สามารถเชื่อมต่อ"
Props: error message present
```

---

## 🔄 Retry Strategy

| Type | Max Retries | Delays | Total Time |
|------|------------|--------|-----------|
| Health Check | 3 | 1s, 2s, 4s | ~7s max |
| Simple Test | 2 | 1s, 2s | ~3s max |
| Manual Test | 5 | 1s, 2s, 4s, 8s, 16s | ~31s max |

Formula: `delay = min(2^retryCount, 30) seconds`

---

## 📊 Connection Status Object

```typescript
interface ConnectionStatus {
  connected: boolean;                    // ✓ or ✗
  lastConnectionAttempt?: string;       // ISO timestamp
  lastError?: string;                   // Error message
  retryCount?: number;                  // Attempt count
  lastSuccessfulConnection?: string;    // ISO timestamp
  connectionDuration?: number;          // Milliseconds
  provider?: string;                    // "neon-postgresql"
}
```

---

## 🎯 Usage Examples

### React Component
```typescript
import { useDatabaseStatus } from '../hooks/useDatabaseStatus';

export function MyComponent() {
  const { status, loading, error, refetch } = useDatabaseStatus(30000);
  
  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error} />;
  
  return (
    <div>
      <p>Status: {status?.connected ? '✓' : '✗'}</p>
      <p>Provider: {status?.provider}</p>
      <p>Duration: {status?.connectionDuration}ms</p>
      <Button onClick={refetch}>Refresh</Button>
    </div>
  );
}
```

### Direct API Call
```typescript
const response = await fetch('/api/health/db/status');
const data = await response.json();

if (data.success && data.data.connected) {
  console.log('Database is connected');
} else {
  console.log('Database is not connected');
}
```

---

## ⚙️ Configuration

### Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### Connection Pool Settings
```javascript
{
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // 30 seconds
  connectionTimeoutMillis: 5000, // 5 seconds
  maxUses: 7500              // Max uses per connection
}
```

### Auto-refresh Interval
```typescript
// Default: 30000ms (30 seconds)
const { status } = useDatabaseStatus(30000);

// Custom: 10000ms (10 seconds)
const { status } = useDatabaseStatus(10000);

// Disable: Infinity
const { status } = useDatabaseStatus(Infinity);
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"

**Step 1**: Verify environment variable
```bash
echo $DATABASE_URL
```

**Step 2**: Test direct connection
```bash
npm run db:test
```

**Step 3**: Check server health
```bash
curl http://localhost:5000/api/health/db
```

**Step 4**: View server logs
```bash
# Look for error messages in console
# Check: connection timeout, SSL errors, auth failures
```

---

### Issue: "Connection times out"

**Causes**:
- Network connectivity issue
- Neon endpoint unreachable
- Firewall blocking port 5432

**Solutions**:
1. Check internet connection
2. Verify DATABASE_URL is correct
3. Test Neon endpoint: `psql $DATABASE_URL`
4. Check firewall settings

---

### Issue: "SSL certificate verification failed"

**Cause**: SSL configuration mismatch

**Solution**: Verify SSL settings in neon-connection.js
```javascript
ssl: {
  require: true,
  rejectUnauthorized: false  // For Neon compatibility
}
```

---

### Issue: "Too many connections"

**Cause**: Connection pool exhausted

**Solutions**:
1. Increase max connections in pool config
2. Check for connection leaks
3. Reduce idleTimeoutMillis
4. Review open connections in database

```bash
# Check open connections (PostgreSQL)
SELECT count(*) FROM pg_stat_activity;
```

---

## 📈 Performance Tips

### Optimize Refresh Rate
```typescript
// Production: 60 seconds
useDatabaseStatus(60000)

// Development: 10 seconds
useDatabaseStatus(10000)

// Monitoring: 5 seconds
useDatabaseStatus(5000)
```

### Reduce Network Calls
```typescript
// Use status endpoint (fastest)
/api/health/db/status        // ~100ms

// Avoid full health check unless needed
/api/health/db               // ~500-1000ms
```

### Monitor Metrics
```typescript
const { status } = useDatabaseStatus();

// Check if connection is degrading
if (status?.retryCount > 2) {
  // Alert administrator
  console.warn('High retry count detected');
}
```

---

## 📋 Checklist for Deployment

```
Pre-deployment:
☐ DATABASE_URL is set correctly
☐ Neon endpoint is accessible
☐ SSL certificates are valid
☐ Connection pool settings are appropriate
☐ Auto-refresh interval is configured
☐ Error boundaries are in place

Post-deployment:
☐ Test /api/health/db endpoint
☐ Monitor connection status in UI
☐ Check server logs for errors
☐ Verify response times are acceptable
☐ Test failover/reconnection behavior
☐ Monitor connection pool metrics
```

---

## 🔗 Related Files

```
Frontend:
├── src/components/DatabaseStatus.tsx
├── src/pages/DatabaseStatusPage.tsx
├── src/hooks/useDatabaseStatus.ts
└── src/services/databaseService.ts

Backend:
├── server/health-routes.js
├── database/neon-connection.js
└── scripts/test-connection.ts

Config:
├── .env (DATABASE_URL)
├── drizzle.config.ts
└── docker-compose.yml (for local testing)
```

---

## 💡 Key Points

✅ **Always-on monitoring**: DatabaseStatus component auto-refreshes every 30s

✅ **Exponential backoff**: Retry strategy prevents overwhelming the database

✅ **Caching**: Connection status is cached for instant UI updates

✅ **Graceful degradation**: App continues even if database is temporarily unavailable

✅ **SSL secure**: All connections require SSL/TLS

✅ **Timeout protection**: 10-second timeout prevents hanging requests

---

## 📞 Support

For issues, check:
1. Browser console (F12) for client-side errors
2. Server logs for backend errors
3. Network tab for API response details
4. DATABASE_URL configuration
5. Neon dashboard for service status

---

**Status**: ✅ Operational
**Last Updated**: 2025-12-15
**Database**: PostgreSQL 17.7 (Neon)
**Version**: 2.0.0
