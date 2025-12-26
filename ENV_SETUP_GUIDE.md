# Environment Variables Setup Guide

Complete guide for configuring environment variables for frontend and backend.

## Quick Setup

### Frontend
```bash
cp .env.local.example .env.local
# Edit .env.local and set VITE_API_URL
```

### Backend
```bash
cp .env.backend.example .env
# Edit .env and set all REQUIRED variables
```

---

## Frontend Environment Variables

### File: `.env.local`

Template: `.env.local.example`

### REQUIRED Variables

#### `VITE_API_URL`
Backend API URL
- **Local**: `http://localhost:5000`
- **Production**: `https://ticket-apw-backend.vercel.app`
- **Type**: Public (visible in browser)

```bash
# Local development
VITE_API_URL=http://localhost:5000

# Production
VITE_API_URL=https://ticket-apw-backend.vercel.app
```

### OPTIONAL Variables

#### `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
If using Supabase
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### `VITE_ANALYTICS_ID`
Analytics service ID
```bash
VITE_ANALYTICS_ID=GA-XXXXX # Google Analytics
# or
VITE_ANALYTICS_ID=MIXPANEL-TOKEN
```

#### `VITE_ENABLE_ANALYTICS`
Enable/disable analytics
```bash
VITE_ENABLE_ANALYTICS=false  # Development
VITE_ENABLE_ANALYTICS=true   # Production
```

#### `VITE_ENABLE_DEBUG`
Enable debug mode
```bash
VITE_ENABLE_DEBUG=true   # Development
VITE_ENABLE_DEBUG=false  # Production
```

### How to Set in Vercel

1. Go to Vercel Dashboard
2. Select project: `ticket-apw`
3. Go to: Settings → Environment Variables
4. Add each variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://ticket-apw-backend.vercel.app`
   - **Environments**: Production, Preview, Development

---

## Backend Environment Variables

### File: `.env`

Template: `.env.backend.example`

### REQUIRED Variables (Production)

#### `NODE_ENV`
Environment type
```bash
NODE_ENV=development  # Local
NODE_ENV=production   # Vercel
```

#### `PORT`
Server port
```bash
PORT=5000
```

#### `DATABASE_URL`
PostgreSQL connection string
```bash
# Local
DATABASE_URL=postgresql://postgres:password@localhost:5432/ticket_apw

# Vercel (use Neon/Railway connection string)
DATABASE_URL=postgresql://user:password@project.postgres.vercel.com:5432/database
```

**How to get DATABASE_URL**:
1. Create PostgreSQL database (Neon, Railway, or local)
2. Copy connection string
3. Format: `postgresql://username:password@host:port/database`

#### `JWT_SECRET`
Secret key for signing JWTs (minimum 32 characters)

**Generate secure key**:
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

Examples:
```bash
# Development (simple)
JWT_SECRET=dev_secret_key_change_in_production_minimum_32_chars

# Production (must be strong)
JWT_SECRET=aBcDeFgHiJkLmNoPqRsT1uVwXyZ2+a0= # Use generated key
```

#### `SESSION_SECRET`
Secret for session management (minimum 32 characters)

**Generate**: Same as JWT_SECRET
```bash
SESSION_SECRET=another_secure_random_string_minimum_32_chars
```

#### `CORS_ORIGIN`
Frontend URL for CORS
```bash
# Local
CORS_ORIGIN=http://localhost:5173

# Production
CORS_ORIGIN=https://ticket-apw.vercel.app

# Multiple origins
CORS_ORIGIN=http://localhost:5173,https://ticket-apw.vercel.app
```

### OPTIONAL Variables

#### `REDIS_URL`
Redis cache connection (optional, for caching/sessions)
```bash
# Local
REDIS_URL=redis://localhost:6379

# Production
REDIS_URL=redis://user:password@host:port
```

#### `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
Email configuration (if sending emails)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password
```

#### `SUPABASE_SERVICE_ROLE_KEY`
If using Supabase
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### How to Set in Vercel

1. Go to Vercel Dashboard
2. Select project: `ticket-apw-backend`
3. Go to: Settings → Environment Variables
4. Add variables:
   ```
   DATABASE_URL = postgresql://...
   JWT_SECRET = [generated key]
   SESSION_SECRET = [generated key]
   NODE_ENV = production
   PORT = 5000
   CORS_ORIGIN = https://ticket-apw.vercel.app
   ```
5. Re-deploy project after adding variables

---

## Development Environment Setup

### Step 1: Create .env Files

```bash
# Frontend
cd ~/ticket-apw
cp .env.local.example .env.local

# Backend
cd ~/ticket-apw-backend
cp .env.backend.example .env
```

### Step 2: Edit Frontend .env.local

```bash
# ~/ticket-apw/.env.local

VITE_API_URL=http://localhost:5000
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### Step 3: Edit Backend .env

```bash
# ~/ticket-apw-backend/.env

# Basic setup (minimum to run)
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/ticket_apw
JWT_SECRET=dev_secret_key_min_32_chars_for_development_only
SESSION_SECRET=dev_session_secret_min_32_chars_for_development
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Change@123
```

### Step 4: Start Services

```bash
# Terminal 1: Backend
cd ~/ticket-apw-backend
npm run dev

# Terminal 2: Frontend
cd ~/ticket-apw
npm run dev

# Open browser: http://localhost:5173
```

---

## Database Setup

### Create Local PostgreSQL Database

#### macOS
```bash
# Install PostgreSQL
brew install postgresql

# Start service
brew services start postgresql

# Create database
createdb ticket_apw

# Create user (optional)
createuser -P postgres
```

#### Windows
```bash
# Install from: https://www.postgresql.org/download/windows/
# During install, set password for 'postgres' user

# Command line:
createdb -U postgres ticket_apw
```

#### Docker
```bash
# Use docker-compose
docker-compose up -d

# Check connection
docker exec -it postgres psql -U postgres -c "CREATE DATABASE ticket_apw;"
```

### Verify Connection

```bash
# Test with psql
psql postgresql://postgres:password@localhost:5432/ticket_apw

# Or test from Node
npm run db:test
```

---

## Production Environment Setup

### Before Deploying to Vercel

#### Backend (ticket-apw-backend)

1. **Create database** (Neon, Railway, or Supabase)
   - Get `DATABASE_URL`
   - Format: `postgresql://user:password@host:port/database`

2. **Generate secrets**
   ```bash
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For SESSION_SECRET
   ```

3. **Set Vercel environment variables**:
   ```
   NODE_ENV = production
   PORT = 5000
   DATABASE_URL = [from database provider]
   JWT_SECRET = [generated key]
   SESSION_SECRET = [generated key]
   CORS_ORIGIN = https://ticket-apw.vercel.app
   ADMIN_EMAIL = your@email.com
   ADMIN_PASSWORD = strong_password
   ```

4. **Deploy**:
   ```bash
   vercel deploy --prod
   ```

5. **Note backend URL**: `ticket-apw-backend.vercel.app`

#### Frontend (ticket-apw)

1. **Set Vercel environment variables**:
   ```
   VITE_API_URL = https://ticket-apw-backend.vercel.app
   VITE_ENABLE_ANALYTICS = true
   VITE_ENABLE_DEBUG = false
   ```

2. **Deploy**:
   ```bash
   vercel deploy --prod
   ```

---

## Environment Variable Checklist

### Frontend (.env.local)
- [ ] `VITE_API_URL` set correctly
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in file
- [ ] File not committed to git

### Backend (.env)
- [ ] `NODE_ENV` set
- [ ] `DATABASE_URL` correct
- [ ] `JWT_SECRET` (32+ chars, random)
- [ ] `SESSION_SECRET` (32+ chars, random)
- [ ] `CORS_ORIGIN` set to frontend URL
- [ ] `ADMIN_EMAIL` and `ADMIN_PASSWORD` set
- [ ] `.env` in `.gitignore`
- [ ] File not committed to git

### Vercel - Backend Project
- [ ] All backend env vars set
- [ ] `DATABASE_URL` from production database
- [ ] `JWT_SECRET` production key
- [ ] `SESSION_SECRET` production key
- [ ] `CORS_ORIGIN` = frontend URL
- [ ] Redeployed after setting variables

### Vercel - Frontend Project
- [ ] `VITE_API_URL` = backend URL
- [ ] Redeployed after setting variables

---

## Troubleshooting

### "Cannot connect to database"
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:
1. Check PostgreSQL is running: `brew services list`
2. Verify `DATABASE_URL` is correct
3. Test connection: `psql postgresql://...`

### "JWT verification failed"
```
Error: jwt malformed
```

**Solution**:
1. Ensure `JWT_SECRET` is set in `.env`
2. Secret should be 32+ characters
3. Regenerate if needed: `openssl rand -base64 32`

### "API calls return 403 Forbidden"
```
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solution**:
1. Check `CORS_ORIGIN` in backend `.env`
2. Verify it matches frontend URL exactly
3. Restart backend after changing

### "Environment variable not loading"
```
Error: undefined value for VITE_API_URL
```

**Solution**:
1. Frontend: Check `.env.local` exists (not `.env`)
2. Restart dev server: `npm run dev`
3. Verify file has correct naming: `VITE_` prefix for frontend
4. Check `.env.local` is in `.gitignore`

---

## Security Best Practices

### Never Do This
❌ Commit `.env` file to git  
❌ Share secrets in chat/email  
❌ Use same secret in dev and prod  
❌ Store secrets in code  
❌ Push `.env` to GitHub  

### Always Do This
✅ Keep `.env` in `.gitignore`  
✅ Use `.env.example` template  
✅ Generate random secrets  
✅ Rotate secrets periodically  
✅ Use environment variables for secrets  
✅ Use different secrets per environment  

### Secret Rotation
Every 3-6 months (or if compromised):
```bash
# Generate new JWT_SECRET
openssl rand -base64 32

# Update in Vercel
# Redeploy backend
vercel deploy --prod
```

---

## Reference

### File Locations

| File | Purpose | Location |
|------|---------|----------|
| Frontend example | Template | `.env.local.example` |
| Frontend actual | Runtime | `.env.local` |
| Backend example | Template | `.env.backend.example` |
| Backend actual | Runtime | `.env` |

### Key Files to Add to .gitignore

```
.env
.env.local
.env.production
.env.*.local
*.pem
secrets/
```

### Vercel Configuration

**Frontend Project Settings**:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: Add VITE_* variables

**Backend Project Settings**:
- Framework Preset: Other
- Build Command: `npm run build` (if applicable)
- Start Command: `npm start`
- Environment Variables: Add all backend vars

---

## Next Steps

1. Copy example files:
   - `cp .env.local.example .env.local`
   - `cp .env.backend.example .env`

2. Edit files with your values

3. Start local development:
   - `npm run dev` (frontend)
   - `npm run dev` (backend)

4. Test connection:
   - Try logging in
   - Check DevTools Network tab

5. For production:
   - Follow "Production Environment Setup" section
   - Set all Vercel env vars
   - Deploy both repos

---

**Status**: Environment setup guide complete  
**Next**: Copy example files and configure for your setup
