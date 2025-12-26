# Environment Variables - Quick Setup

## 30 Second Setup

### Frontend
```bash
cd ~/ticket-apw
cp .env.local.example .env.local
# Edit: Change VITE_API_URL to your backend URL
```

### Backend
```bash
cd ~/ticket-apw-backend
cp .env.backend.example .env
# Edit: Set DATABASE_URL, JWT_SECRET, etc.
```

---

## Frontend (.env.local)

```env
# REQUIRED
VITE_API_URL=http://localhost:5000

# OPTIONAL
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ANALYTICS_ID=
NODE_ENV=development
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

---

## Backend (.env) - REQUIRED ONLY

```env
# Environment
NODE_ENV=development
PORT=5000

# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:password@localhost:5432/ticket_apw

# Secrets (REQUIRED - use openssl rand -base64 32)
JWT_SECRET=your_random_32_char_key_here
SESSION_SECRET=another_random_32_char_key

# CORS (REQUIRED)
CORS_ORIGIN=http://localhost:5173

# Admin (REQUIRED for setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Change@123
ADMIN_NAME="Admin User"
```

---

## Backend (.env) - OPTIONAL

```env
# Redis (caching)
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=true
ENABLE_API_DOCS=true
ENABLE_RATE_LIMITING=true
```

---

## For Local Development

### 1. Generate Secrets
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

### 2. Create Database
```bash
# macOS
brew install postgresql
brew services start postgresql
createdb ticket_apw

# Docker
docker-compose up -d

# Windows
# Download from postgresql.org
```

### 3. Test Connection
```bash
psql postgresql://postgres:password@localhost:5432/ticket_apw

# Or
npm run db:test
```

### 4. Start Services
```bash
# Terminal 1: Backend
cd ~/ticket-apw-backend
npm run dev
# → http://localhost:5000

# Terminal 2: Frontend
cd ~/ticket-apw
npm run dev
# → http://localhost:5173
```

---

## For Production (Vercel)

### Backend Deployment

1. **Deploy to Vercel**
   ```bash
   cd ~/ticket-apw-backend
   vercel deploy --prod
   ```

2. **Set Environment Variables** (Vercel Dashboard)
   ```
   DATABASE_URL = [production database connection]
   JWT_SECRET = [strong random key]
   SESSION_SECRET = [strong random key]
   NODE_ENV = production
   PORT = 5000
   CORS_ORIGIN = https://ticket-apw.vercel.app
   ADMIN_EMAIL = your@email.com
   ADMIN_PASSWORD = strong_password
   ```

3. **Redeploy**
   ```bash
   vercel deploy --prod
   ```

4. **Note Backend URL**: `https://ticket-apw-backend.vercel.app`

### Frontend Deployment

1. **Set Environment Variables** (Vercel Dashboard)
   ```
   VITE_API_URL = https://ticket-apw-backend.vercel.app
   VITE_ENABLE_ANALYTICS = true
   VITE_ENABLE_DEBUG = false
   ```

2. **Deploy**
   ```bash
   cd ~/ticket-apw
   vercel deploy --prod
   ```

---

## Common .gitignore Entries

```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.production

# Secrets
secrets/
*.pem
*.key
```

---

## Database Providers (for production)

| Provider | Free Tier | Setup Time |
|----------|-----------|-----------|
| Neon | 3GB storage | 2 min |
| Railway | $5/month | 5 min |
| Vercel Postgres | Paid | 5 min |
| Supabase | 500MB | 5 min |
| PlanetScale | Limited | 5 min |

**Recommended**: Neon (most generous free tier)

---

## Vercel Dashboard Links

- **Frontend Project**: https://vercel.com/projects/ticket-apw
  - Settings → Environment Variables
  - Add: `VITE_API_URL`

- **Backend Project**: https://vercel.com/projects/ticket-apw-backend
  - Settings → Environment Variables
  - Add: `DATABASE_URL`, `JWT_SECRET`, etc.

---

## Testing Env Variables Work

### Frontend
```bash
# Should see: http://localhost:5000
npm run dev
# Check DevTools → Console: API calls should go to correct URL
```

### Backend
```bash
# Should start without errors
npm run dev
# Check: 🚀 Server running on http://localhost:5000
```

### Both Together
```bash
# Frontend at http://localhost:5173
# Backend at http://localhost:5000
# Should login successfully
# Should load projects
# No CORS errors
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `.env.local.example` | Frontend template |
| `.env.local` | Frontend runtime (you create) |
| `.env.backend.example` | Backend template |
| `.env` | Backend runtime (you create) |
| `ENV_SETUP_GUIDE.md` | Detailed guide |
| `ENV_QUICK_SETUP.md` | This file |

---

## Troubleshooting Env Variables

| Problem | Solution |
|---------|----------|
| `Cannot find module` | Restart: `npm run dev` |
| `CORS error` | Check `CORS_ORIGIN` in backend `.env` |
| `Database connection failed` | Verify `DATABASE_URL` |
| `JWT error` | Regenerate `JWT_SECRET`: `openssl rand -base64 32` |
| `API calls fail` | Check `VITE_API_URL` in frontend `.env.local` |

---

## Remember

✅ Never commit `.env` files  
✅ Always use `.env.example` as template  
✅ Generate random secrets for production  
✅ Use 32+ character secrets  
✅ Different secrets for dev and prod  
✅ Don't share secrets in chat/email  

---

**Quick Links**:
- Detailed Guide: `ENV_SETUP_GUIDE.md`
- Backend Template: `.env.backend.example`
- Frontend Template: `.env.local.example`
