# Redis Environment Setup

## Step 1: Add REDIS_URL to backend/.env

Open `backend/.env` and add:

```env
REDIS_URL=redis://default:IfyS29shfDvjqoFwh2oJqmI9xJFlDkXi@redis-17723.c292.ap-southeast-1-1.ec2.cloud.redislabs.com:17723
```

## Step 2: Test Connection

```bash
cd backend
node test-redis.mjs
```

## Step 3: Start Backend

```bash
npm run dev:backend
```

## Step 4: Test Endpoints

```bash
# Check health
curl http://localhost:3001/api/cache/health

# Set cache
curl -X POST http://localhost:3001/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key":"test","value":{"hello":"world"},"ttl":3600}'

# Get cache
curl http://localhost:3001/api/cache/get/test

# Delete cache
curl -X DELETE http://localhost:3001/api/cache/delete/test
```

Done!
