# Painai: Integration Guide กับ Neon PostgreSQL

คู่มือการเปลี่ยนจาก Trickle Database เป็น Neon PostgreSQL สำหรับโปรเจค Painai

## 📋 สรุปการเปลี่ยนแปลง

| Aspect | Trickle Database | Neon PostgreSQL |
|--------|------------------|-----------------|
| **Type** | No-code Cloud DB | Server-based PostgreSQL |
| **Connection** | JavaScript API | HTTP/REST or Direct |
| **Setup** | No setup required | Database setup required |
| **Query Language** | Proprietary API | SQL |
| **Scaling** | Limited | Enterprise-level |
| **Cost** | Platform dependent | Pay-per-usage |
| **Control** | Limited | Full control |

## 🏗️ Architecture Options

### Option 1: Supabase Hosting (แนะนำ)
**ข้อดี:**
- ใช้งานง่าย ไม่ต้อง setup server
- Built-in REST API
- Authentication พร้อมใช้
- Real-time subscriptions

**ข้อเสีย:**
- ต้องใช้ Supabase service
- มีค่าใช้จ่าย

### Option 2: Direct Neon Connection + Proxy Server
**ข้อดี:**
- ใช้ Neon ตรงๆ
- Control สูงสุด
- Performance ดีที่สุด

**ข้อเสีย:**
- ต้องสร้าง proxy server
- ซับซ้อนกว่า

### Option 3: Neon + Vercel Functions/Netlify Functions
**ข้อดี:**
- Serverless deployment
- Cost-effective
- Easy deployment

**ข้อเสีย:**
- Cold start issues
- Limited execution time

## 🚀 การติดตั้งและใช้งาน

### Phase 1: Database Setup

#### 1.1 ใช้ Supabase (แนะนำสำหรับเริ่มต้น)

```bash
# 1. สร้าง Supabase project
# ไปที่ https://supabase.com และสร้างโปรเจคใหม่

# 2. Import schema
# - ไปที่ SQL Editor ใน Supabase
# - Copy เนื้อหาจาก database/neon-schema.sql
# - Run ใน SQL Editor

# 3. เปิดใช้งาน Row Level Security (RLS)
# Enable RLS สำหรับทุก table ในโปรเจค

# 4. ตั้งค่า Authentication (ถ้าต้องการ)
# เปิด Authentication และตั้งค่า providers
```

#### 1.2 ใช้ Neon โดยตรง

```bash
# 1. สร้าง Neon project
# ไปที่ https://neon.tech และสร้างโปรเจคใหม่

# 2. สร้าง proxy server (Node.js/Express)
# - ใช้ไฟล์ server/proxy-server.js ที่ให้มา
# - ติดตั้ง dependencies: npm install pg cors dotenv
# - ตั้งค่า environment variables

# 3. Run server
npm start
```

### Phase 2: Frontend Integration

#### 2.1 Update Database Configuration

```javascript
// แก้ไขไฟล์ database/database-config.js
const SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL', // ใส่ Supabase project URL
  anonKey: 'YOUR_SUPABASE_ANON_KEY' // ใส่ Supabase anon key
};
```

#### 2.2 Add Database Scripts to HTML

เพิ่มในไฟล์ HTML ทุกไฟล์ก่อน `</body>`:

```html
<!-- สำหรับ Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="database/database-config.js"></script>
<script src="database/trickle-api-wrapper.js"></script>

<!-- สำหรับ Neon with proxy -->
<script src="database/database-config.js"></script>
<script src="database/trickle-api-wrapper.js"></script>
```

#### 2.3 Initialize Database

เพิ่มในไฟล์ JavaScript หลัก:

```javascript
// ในไฟล์ app.js หรือไฟล์หลัก
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize database connection
    if (typeof initializeDatabase === 'function') {
        await initializeDatabase();
        
        const status = getConnectionStatus();
        console.log('Database status:', status);
        
        if (!status.connected) {
            console.warn('Database not connected, using fallback data');
        }
    }
});
```

### Phase 3: Migration

#### 3.1 Export Data from Trickle (ถ้ามี)

```javascript
// รันใน browser console หรือสร้างไฟล์ export-data.js
const tables = ['project', 'task', 'user', 'customer', 'worklog', 'expense'];
const allData = {};

for (const table of tables) {
    try {
        const result = await trickleListObjects(table, 1000, true);
        allData[table] = result.items;
        console.log(`Exported ${result.items.length} records from ${table}`);
    } catch (error) {
        console.error(`Failed to export ${table}:`, error);
    }
}

// Download เป็น JSON
const dataStr = JSON.stringify(allData, null, 2);
const dataBlob = new Blob([dataStr], {type: 'application/json'});
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'trickle-export.json';
link.click();
```

#### 3.2 Import Data to PostgreSQL

```javascript
// สำหรับ Supabase
async function importDataToSupabase(data) {
    for (const [table, records] of Object.entries(data)) {
        for (const record of records) {
            try {
                await trickleCreateObject(table, record.objectData);
                console.log(`Imported record to ${table}`);
            } catch (error) {
                console.error(`Failed to import to ${table}:`, error);
            }
        }
    }
}

// สำหรับ Neon (ผ่าน proxy)
async function importDataToNeon(data) {
    // ใช้ proxy server endpoints
    for (const [table, records] of Object.entries(data)) {
        for (const record of records) {
            try {
                await fetch('/api/migrate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table,
                        data: record.objectData
                    })
                });
            } catch (error) {
                console.error(`Failed to import to ${table}:`, error);
            }
        }
    }
}
```

### Phase 4: Testing

#### 4.1 Connection Test

```javascript
// สร้างไฟล์ test-connection.html
<script>
async function testDatabaseConnection() {
    console.log('Testing database connection...');
    
    try {
        // Test list objects
        const projects = await trickleListObjects('project', 5);
        console.log('✅ List objects test passed:', projects.items.length, 'projects');
        
        // Test create object
        const testProject = {
            Name: 'Test Project',
            Description: 'Connection test project',
            Status: 'active'
        };
        
        const created = await trickleCreateObject('project', testProject);
        console.log('✅ Create object test passed:', created.objectId);
        
        // Test update object
        const updated = await trickleUpdateObject('project', created.objectId, {
            Name: 'Updated Test Project'
        });
        console.log('✅ Update object test passed:', updated.objectData.Name);
        
        // Test get object
        const retrieved = await trickleGetObject('project', created.objectId);
        console.log('✅ Get object test passed:', retrieved.objectData.Name);
        
        // Test delete object
        await trickleDeleteObject('project', created.objectId);
        console.log('✅ Delete object test passed');
        
        console.log('🎉 All database tests passed!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
    }
}

// Run test
testDatabaseConnection();
</script>
```

## 🔧 Configuration Files

### Environment Variables (.env)

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Neon Configuration (for proxy)
NEON_CONNECTION_STRING=postgresql://neondb_owner:password@ep-muddy-cherry-ah612m1a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Package.json (สำหรับ proxy server)

```json
{
  "name": "painai-proxy-server",
  "version": "1.0.0",
  "description": "Proxy server for Painai PostgreSQL integration",
  "main": "server/proxy-server.js",
  "scripts": {
    "start": "node server/proxy-server.js",
    "dev": "nodemon server/proxy-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 📊 Performance Considerations

### 1. Query Optimization

```sql
-- สร้าง indexes สำหรับ performance
CREATE INDEX CONCURRENTLY idx_projects_status_active 
ON projects(status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_tasks_project_status 
ON tasks(project_id, status);

CREATE INDEX CONCURRENTLY idx_worklogs_user_date 
ON worklogs(user_id, date DESC);

-- Partial indexes สำหรับ deleted records
CREATE INDEX CONCURRENTLY idx_projects_not_deleted 
ON projects(created_at) WHERE is_deleted = false;
```

### 2. Caching Strategy

```javascript
// เพิ่ม caching layer
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function cachedQuery(table, query, ttl = CACHE_TTL) {
    const cacheKey = `${table}_${JSON.stringify(query)}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }
    
    const result = await trickleListObjects(table, query.limit || 50);
    cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
    });
    
    return result;
}
```

### 3. Batch Operations

```javascript
// Bulk insert สำหรับข้อมูลจำนวนมาก
async function bulkInsert(table, records) {
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const promises = batch.map(record => 
            trickleCreateObject(table, record).catch(console.error)
        );
        
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
        
        console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(records.length/batchSize)}`);
    }
    
    return results;
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Failed

```javascript
// Check connection
const status = getConnectionStatus();
if (!status.connected) {
    console.error('Database connection failed:', status.error);
    
    // Fallback to local storage
    const localData = localStorage.getItem('fallback_data');
    if (localData) {
        console.log('Using fallback data from localStorage');
        return JSON.parse(localData);
    }
}
```

#### 2. Schema Mismatch

```javascript
// Data transformation
function transformTrickleToPostgreSQL(table, trickleData) {
    const transformations = {
        'StartDate': (date) => date ? new Date(date).toISOString() : null,
        'EndDate': (date) => date ? new Date(date).toISOString() : null,
        'Budget': (amount) => parseFloat(amount) || 0
    };
    
    const transformed = { ...trickleData };
    Object.keys(transformations).forEach(field => {
        if (transformed[field] !== undefined) {
            transformed[field] = transformations[field](transformed[field]);
        }
    });
    
    return transformed;
}
```

#### 3. Authentication Issues

```javascript
// Simple authentication check
async function checkAuth() {
    const userToken = localStorage.getItem('auth_token');
    if (!userToken) {
        console.warn('No authentication token found');
        return false;
    }
    
    // Verify token with your auth service
    // This is a placeholder - implement actual auth check
    return true;
}
```

## 📈 Monitoring and Analytics

### Database Monitoring

```javascript
// Performance monitoring
const perfMetrics = {
    queries: [],
    errors: [],
    timing: []
};

async function monitoredQuery(queryFn, label) {
    const start = Date.now();
    try {
        const result = await queryFn();
        const duration = Date.now() - start;
        
        perfMetrics.queries.push({ label, duration, timestamp: Date.now() });
        perfMetrics.timing.push(duration);
        
        return result;
    } catch (error) {
        perfMetrics.errors.push({ label, error: error.message, timestamp: Date.now() });
        throw error;
    }
}

// Usage
const projects = await monitoredQuery(
    () => trickleListObjects('project', 50),
    'get_projects'
);

console.log('Average query time:', 
    perfMetrics.timing.reduce((a, b) => a + b) / perfMetrics.timing.length,
    'ms'
);
```

## 🔒 Security Considerations

### 1. Environment Variables

```bash
# Never commit sensitive data
echo "NEON_CONNECTION_STRING=postgresql://..." >> .env
echo "SUPABASE_SERVICE_KEY=..." >> .env
echo ".env" >> .gitignore
```

### 2. Input Validation

```javascript
function validateInput(data, schema) {
    const errors = [];
    
    schema.requiredFields.forEach(field => {
        if (!data[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    });
    
    // Add more validation as needed
    return errors;
}
```

### 3. Rate Limiting

```javascript
const rateLimiter = {
    requests: new Map(),
    limit: 100, // requests per minute
    window: 60000 // 1 minute
};

function checkRateLimit(userId) {
    const now = Date.now();
    const userRequests = rateLimiter.requests.get(userId) || [];
    
    // Remove old requests
    const validRequests = userRequests.filter(
        time => now - time < rateLimiter.window
    );
    
    if (validRequests.length >= rateLimiter.limit) {
        throw new Error('Rate limit exceeded');
    }
    
    validRequests.push(now);
    rateLimiter.requests.set(userId, validRequests);
}
```

## 🎯 Next Steps

1. **Choose Integration Method**: Supabase (ง่าย) หรือ Neon Proxy (ควบคุมได้มาก)
2. **Setup Database**: Import schema และตั้งค่า
3. **Update Frontend**: เพิ่ม database scripts
4. **Test Connection**: รัน database tests
5. **Migrate Data**: ย้ายข้อมูลจาก Trickle
6. **Monitor Performance**: ติดตามและปรับปรุง
7. **Production Deployment**: Deploy ขึ้น production

## 📞 Support

หากต้องการความช่วยเหลือเพิ่มเติม สามารถติดต่อได้ที่:
- Documentation: อ่านคู่มือใน `/trickle/notes/`
- Migration Issues: ใช้ `MigrationTool` ที่ให้มา
- Performance Issues: ใช้ monitoring tools
- Custom Requirements: ปรับแต่ง wrapper functions

---

**หมายเหตุ**: การเปลี่ยนจาก Trickle เป็น PostgreSQL ต้องการการทดสอบอย่างละเอียด กรุณาทำการ backup ข้อมูลเดิมก่อนเริ่ม migration