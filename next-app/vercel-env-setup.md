# Vercel Environment Variables Setup

## Required Environment Variables for Vercel Deploy

### 1. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://rllhsiguqezuzltsjntp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbGhzaWd1cWV6dXpsdHNqbnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjQ2MjMsImV4cCI6MjA4MzU0MDYyM30.1Ds-cOil4ki9fUMBAU1JxoDQQECy4GAb_w-r1zuylD8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbGhzaWd1cWV6dXpsdHNqbnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk2NDYyMywiZXhwIjoyMDgzNTQwNjIzfQ.tDxwFVbC8vyL6SF-DudeEBNfPciCcaAlImSWOwToofU
```

### 2. Redis Configuration
```
REDIS_URL=redis://default:IfyS29shfDvjqoFwh2oJqmI9xJFlDkXi@redis-17723.c292.ap-southeast-1-1.ec2.cloud.redislabs.com:17723
```

### 3. JWT Configuration
```
JWT_SECRET=RNhJHmJdVlpPk9JAsJTB5HF/gFO9QncATl1nq89QDFw=
NEXTAUTH_SECRET=RNhJHmJdVlpPk9JAsJTB5HF/gFO9QncATl1nq89QDFw=
```

### 4. API Configuration
```
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

## Setup Steps:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with the exact name and value above
3. Select Environment: Production (and Preview if needed)
4. Click "Save"
5. Redeploy your application

## Redis Usage Examples:

### Test Redis Connection:
```bash
curl https://your-app.vercel.app/api/redis/health
```

### Store Data in Redis:
```bash
curl -X POST https://your-app.vercel.app/api/redis \
  -H "Content-Type: application/json" \
  -d '{"key": "test", "value": "Hello Redis!", "ttl": 3600}'
```

### Retrieve Data from Redis:
```bash
curl https://your-app.vercel.app/api/redis?key=test
```

### Delete Data from Redis:
```bash
curl -X DELETE https://your-app.vercel.app/api/redis?key=test
```

## Redis Usage in Code:

```typescript
import redis from '@/lib/redis';

// Store data
await redis.set('user:123', JSON.stringify(userData), { EX: 3600 });

// Retrieve data
const cachedUser = await redis.get('user:123');
const userData = cachedUser ? JSON.parse(cachedUser) : null;

// Delete data
await redis.del('user:123');

// Check if key exists
const exists = await redis.exists('user:123');
```

## Redis Monitoring:

- Redis Memory Usage: 30 MB limit
- Connection: Automatic reconnection
- TTL: Set expiration times to prevent memory bloat
- Health Check: `/api/redis/health` endpoint

## Performance Tips:

1. **Cache frequently accessed data** (projects, users, tasks)
2. **Set appropriate TTL** (1-24 hours depending on data)
3. **Use JSON serialization** for complex objects
4. **Monitor memory usage** to stay within 30MB limit
5. **Use Redis for session storage** instead of JWT for better security
