# ตรวจสอบการเชื่อมต่อฐานข้อมูล - Database Connection Status

## สถานะการเชื่อมต่อฐานข้อมูล

### 1. แนวทางระบบ (System Architecture)

#### องค์ประกอบหลัก:
- **ฐานข้อมูล**: Neon PostgreSQL (serverless)
- **Protocol**: PostgreSQL with SSL/TLS
- **Connection Pool**: pg (Node.js)
- **Configuration**: 
  - Max connections: 20
  - Idle timeout: 30 seconds
  - Connection timeout: 5 seconds
  - Max uses per connection: 7500

---

## 2. การตรวจสอบการเชื่อมต่อ (Connection Checking)

### API Endpoints

#### A. Health Check - ตรวจสอบสุขภาพฐานข้อมูล
```
GET /api/health/db
```
**Purpose**: ตรวจสอบสุขภาพฐานข้อมูลอย่างละเอียด

**Response**:
```json
{
  "success": true,
  "message": "Database connection is healthy",
  "data": {
    "status": "healthy|unhealthy|error",
    "database": "postgresql",
    "provider": "neon",
    "currentTime": "2025-12-15T10:30:00Z",
    "postgresVersion": "PostgreSQL 15.0 on x86_64...",
    "connectionStatus": {
      "connected": true,
      "lastConnectionAttempt": "2025-12-15T10:30:00.000Z",
      "lastError": null,
      "retryCount": 0,
      "lastSuccessfulConnection": "2025-12-15T10:30:00.000Z",
      "connectionDuration": 145,
      "provider": "neon-postgresql"
    }
  }
}
```

#### B. Simple Connection Test - ทดสอบการเชื่อมต่อแบบง่าย
```
GET /api/health/db/simple
```
**Purpose**: ทดสอบการเชื่อมต่อแบบง่าย ๆ (2 ครั้งสำหรับการลอง)

**Response**:
```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": "2025-12-15T10:30:00.000Z"
}
```

#### C. Connection Status - สถานะการเชื่อมต่อปัจจุบัน
```
GET /api/health/db/status
```
**Purpose**: ดึงสถานะการเชื่อมต่อปัจจุบัน (ไม่มีการลองใหม่)

**Response**:
```json
{
  "success": true,
  "status": "connected|disconnected",
  "data": {
    "connected": true,
    "lastConnectionAttempt": "2025-12-15T10:30:00.000Z",
    "lastError": null,
    "retryCount": 0,
    "lastSuccessfulConnection": "2025-12-15T10:30:00.000Z",
    "connectionDuration": 145,
    "provider": "neon-postgresql"
  }
}
```

---

## 3. Front-end Components (ส่วนประกอบส่วนหน้า)

### DatabaseStatus Component
**File**: `src/components/DatabaseStatus.tsx`

**Features**:
- แสดงสถานะการเชื่อมต่อแบบเรียลไทม์
- Auto-refresh ทุก 30 วินาที (ปรับแต่งได้)
- Tooltip แสดงข้อมูลละเอียด
  - สถานะการเชื่อมต่อ
  - ผู้ให้บริการ (Provider)
  - เวลาการเชื่อมต่อล่าสุด
  - ระยะเวลาการเชื่อมต่อ (ms)
  - จำนวนความพยายาม
  - ข้อผิดพลาดล่าสุด

**States**:
- ✓ Connected (สีเขียว - #52c41a)
- ✗ Disconnected (สีส้ม - #faad14)
- ❌ Error (สีแดง - #ff4d4f)

### DatabaseStatusPage
**File**: `src/pages/DatabaseStatusPage.tsx`

**Features**:
- หน้าตรวจสอบสถานะฐานข้อมูลแบบเต็มหน้า
- Card displays:
  - สถานะการเชื่อมต่อ
  - ผู้ให้บริการ
  - ระยะเวลาการเชื่อมต่อ
  - จำนวนความพยายาม
- Buttons:
  - Health Check - ทดสอบสุขภาพฐานข้อมูล
  - ทดสอบการเชื่อมต่อ - Simple connection test
  - รีเฟรช - ดึงข้อมูลล่าสุด
- ข้อมูลรายละเอียด:
  - เชื่อมต่อครั้งล่าสุด
  - พยายามครั้งล่าสุด
  - ข้อผิดพลาดล่าสุด
  - ผลลัพธ์ Health Check

---

## 4. React Hook

### useDatabaseStatus
**File**: `src/hooks/useDatabaseStatus.ts`

```typescript
const { status, loading, error, refetch } = useDatabaseStatus(refreshInterval);
```

**Parameters**:
- `refreshInterval`: เวลาในมิลลิวินาที (ค่าเริ่มต้น: 30000ms)

**Returns**:
- `status`: ConnectionStatus | null
- `loading`: boolean
- `error`: string | null
- `refetch`: () => void

**Auto-refresh**: ทำการดึงสถานะอัตโนมัติตามช่วงเวลาที่กำหนด

---

## 5. Backend Implementation

### Module: database/neon-connection.js

#### Key Functions:

1. **createDatabasePool()** - สร้าง singleton connection pool
2. **testConnection(retryCount, maxRetries)** - ทดสอบการเชื่อมต่อ
   - ใช้ exponential backoff retry
   - Delay: 2^retryCount seconds (สูงสุด 30 วินาที)
3. **getConnectionStatus()** - ดึงสถานะการเชื่อมต่อ
4. **executeQuery(query, params)** - ประมวลผล SQL query
5. **getClient()** - ดึง client สำหรับ transactions
6. **healthCheck()** - ทดสอบสุขภาพระบบ (3 ครั้งสำหรับการลอง)

#### Connection Status Tracking:
```javascript
{
  connected: boolean,
  lastConnectionAttempt: Date,
  lastError: string,
  retryCount: number,
  lastSuccessfulConnection: Date,
  connectionDuration: number,
  provider: "neon-postgresql"
}
```

---

## 6. Retry Strategy

### Exponential Backoff Configuration:
- **Health Check**: 3 retries (max delays: 1s, 2s, 4s)
- **Simple Test**: 2 retries (max delays: 1s, 2s)
- **Manual Test**: 5 retries (max delays: 1s, 2s, 4s, 8s, 16s)

### Formula: `delay = min(2^retryCount, 30) seconds`

---

## 7. Environment Configuration

### Required Environment Variables:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require&channel_binding=require
```

### SSL Configuration:
- `ssl.require`: true
- `ssl.rejectUnauthorized`: false (สำหรับ Neon compatibility)

---

## 8. Usage Examples

### Check Status in React Component:
```typescript
import { useDatabaseStatus } from '../hooks/useDatabaseStatus';

function MyComponent() {
  const { status, loading, error } = useDatabaseStatus(30000);
  
  if (loading) return <Spin />;
  if (error) return <p>Error: {error}</p>;
  
  return (
    <div>
      Status: {status?.connected ? '✓ Connected' : '✗ Disconnected'}
      Provider: {status?.provider}
      Duration: {status?.connectionDuration}ms
    </div>
  );
}
```

### Test Connection from Terminal:
```bash
# Simple test
npm run db:test

# Health check via API
curl http://localhost:5000/api/health/db

# Simple test via API
curl http://localhost:5000/api/health/db/simple

# Status check via API
curl http://localhost:5000/api/health/db/status
```

---

## 9. Monitoring & Logging

### Console Output:
- `✅ Database connection successful!`
- `❌ Database connection failed (attempt X/Y)`
- `🔄 Retrying in X seconds...`
- `✓ Health check passed`
- `⚠️ Database health check failed`
- `📊 Query executed in Xms`

### Log Levels:
- `console.log()` - Information
- `console.warn()` - Warnings
- `console.error()` - Errors

---

## 10. Troubleshooting

### Connection Issues:

1. **Check DATABASE_URL**:
   ```bash
   echo $DATABASE_URL
   ```

2. **Test Direct Connection**:
   ```bash
   npm run db:test
   ```

3. **Check API Health**:
   ```bash
   curl -X GET http://localhost:5000/api/health/db
   ```

4. **Monitor Status in Real-time**:
   - Open `/dashboard` to see DatabaseStatus component
   - Or visit dedicated database status page

5. **Check Server Logs**:
   - Look for connection errors
   - Check retry attempts
   - Monitor query execution time

### Common Issues:

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` | Check if database server is running |
| `ETIMEDOUT` | Check network connectivity |
| `SSL certificate problem` | Verify SSL configuration |
| `Too many connections` | Check connection pool settings |
| `Idle connection timeout` | Increase idleTimeoutMillis |

---

## 11. Performance Metrics

### Typical Connection Timings:
- **Initial connection**: 100-300ms
- **Query execution**: 10-50ms
- **Health check**: 200-500ms
- **Retry delay**: 1s → 2s → 4s → 8s → 16s

---

## 12. Related Files

| File | Purpose |
|------|---------|
| `database/neon-connection.js` | Connection pool & status |
| `server/health-routes.js` | API endpoints |
| `src/services/databaseService.ts` | Frontend service |
| `src/hooks/useDatabaseStatus.ts` | React hook |
| `src/components/DatabaseStatus.tsx` | Status widget |
| `src/pages/DatabaseStatusPage.tsx` | Status page |
| `drizzle.config.ts` | Database schema config |

---

**Last Updated**: 2025-12-15
**Version**: 2.0.0
