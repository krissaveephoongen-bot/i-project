# Separate Backend Deployment Setup

## Architecture Overview

- **Frontend**: Deployed to Vercel (React + Vite at `https://ticket-apw.vercel.app`)
- **Backend**: Deployed to Fly.io or Railway (Express server)
- **Database**: PostgreSQL (shared, or managed service like Supabase/Railway)

## Local Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Setup
Create `.env` file in project root:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (use your local PostgreSQL or Supabase)
DATABASE_URL=postgresql://user:password@localhost:5432/ticket_apw

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10

# Frontend URL (for CORS)
CORS_ORIGIN=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### Step 3: Run Development Environment

**Option A: Run Both Servers Together**
```bash
npm run dev:all
```

**Option B: Run Separately (in different terminals)**
```bash
# Terminal 1 - Frontend (Vite on port 5173)
npm run dev

# Terminal 2 - Backend (Express on port 3001)
npm run dev:server
```

Frontend will automatically point to `http://localhost:3001/api` in development.

---

## Production Deployment

### Backend Deployment (Fly.io Example)

#### 1. Create Fly.io Account & App
```bash
npm install -g flyctl
flyctl auth login
flyctl launch
```

#### 2. Create `fly.toml`
```toml
app = "ticket-apw-api"

[build]
  builder = "heroku"

[[services]]
  protocol = "tcp"
  internal_port = 3001
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true
  
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

#### 3. Set Environment Variables on Fly.io
```bash
flyctl secrets set \
  DATABASE_URL="postgres://..." \
  JWT_SECRET="your_secret" \
  CORS_ORIGIN="https://ticket-apw.vercel.app" \
  NODE_ENV=production
```

#### 4. Deploy Backend
```bash
flyctl deploy
```

Your API will be available at: `https://ticket-apw-api.fly.dev/api`

### Frontend Deployment (Vercel)

#### 1. Add Environment Variable
In Vercel dashboard, set:
- `VITE_API_URL=https://ticket-apw-api.fly.dev`

#### 2. Update API Config (Already Done)
The `src/lib/api-config.ts` now points to the separate backend.

#### 3. Deploy Frontend
```bash
npm run build
# Push to GitHub, Vercel auto-deploys
```

---

## Testing the Setup

### Local Testing
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test with API client
npm run test
```

### Production Testing
```bash
curl https://ticket-apw-api.fly.dev/api/health
```

---

## Database Migrations

Run migrations on the backend server:

**Local:**
```bash
npm run migrate:dev
```

**Production (Fly.io):**
```bash
flyctl ssh console
npm run migrate:prod
```

---

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check server logs: `npm run dev:server`

### API 404 Errors
- Verify backend is running on port 3001
- Check `src/lib/api-config.ts` API URL is correct
- Test with curl: `curl http://localhost:3001/api/health`

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running locally
- Use `psql` to test connection:
  ```bash
  psql $DATABASE_URL
  ```

---

## Next Steps

1. Update server route handlers to include proper error handling and validation
2. Set up API logging/monitoring (e.g., Sentry, DataDog)
3. Configure database backups (if using external service)
4. Set up CI/CD pipeline for automated tests
5. Add API documentation (Swagger/OpenAPI)
