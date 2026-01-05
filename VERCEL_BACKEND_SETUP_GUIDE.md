# Vercel Backend Setup - Detailed Guide

Deploy Express backend as separate Vercel project alongside your frontend.

---

## Architecture

```
Your GitHub Repository
├── Frontend Code (src/, vite.config.ts, package.json)
└── Backend Code (server/, vercel-backend.json)

↓ Deploy to Vercel ↓

Frontend Project: https://ticket-apw.vercel.app
Backend Project: https://ticket-apw-api.vercel.app
```

---

## Prerequisites

- Vercel account (free)
- GitHub repository connected to Vercel
- PostgreSQL database (Supabase, Railway, etc.)
- Vercel CLI installed locally

---

## Step 1: Install Vercel CLI

### Windows
```powershell
npm install -g vercel
```

### macOS/Linux
```bash
npm install -g vercel
```

### Verify
```bash
vercel --version
```

---

## Step 2: Authenticate with Vercel

```bash
vercel login
```

Opens browser for authentication.

Verify:
```bash
vercel whoami
```

---

## Step 3: Create Backend Vercel Configuration

Create `vercel-backend.json` in project root:

```json
{
  "buildCommand": "npm install",
  "outputDirectory": "server",
  "framework": "express",
  "nodeVersion": "20.x"
}
```

---

## Step 4: Update Vercel.json for Backend Routes

Create/update `vercel.json` in project root:

```json
{
  "version": 2,
  "name": "ticket-apw-api",
  "builds": [
    {
      "src": "server/app.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb",
        "includeFiles": "server/**"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server/app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Step 5: Verify Server Configuration

Ensure `server/app.js` is properly configured:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
import projectRoutes from './routes/project-routes.js';
import taskRoutes from './routes/task-routes.js';
import userRoutes from './routes/user-routes.js';
import authRoutes from './routes/auth-routes.js';

app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

---

## Step 6: Create Separate Backend Vercel Project (CLI Method)

### Navigate to Project
```bash
cd c:\Users\Jakgrits\project-mgnt
```

### Deploy Backend Project
```bash
vercel deploy --prod --name=ticket-apw-api
```

When prompted:
- **Scope**: Your Vercel account
- **Found existing project**: Say `No` to create new
- **Project name**: `ticket-apw-api`
- **Framework**: `Other`
- **Root directory**: `.`
- **Build command**: `npm install`
- **Output directory**: Leave blank

Wait for deployment to complete.

**Your backend URL will be**: `https://ticket-apw-api.vercel.app`

---

## Step 7: Set Environment Variables (Backend)

### Using Vercel CLI
```bash
vercel env add DATABASE_URL --name=ticket-apw-api
# Paste your PostgreSQL URL when prompted

vercel env add JWT_SECRET --name=ticket-apw-api
# Generate and paste: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

vercel env add CORS_ORIGIN --name=ticket-apw-api
# https://ticket-apw.vercel.app

vercel env add NODE_ENV --name=ticket-apw-api
# production
```

### Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select **ticket-apw-api** project
3. **Settings** → **Environment Variables**
4. Add each variable (see table below)
5. **Redeploy** project

#### Variables to Add

| Name | Value | Example |
|------|-------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Random 32-char hex | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRY` | Token expiry | `7d` |
| `BCRYPT_ROUNDS` | Hash rounds | `10` |
| `CORS_ORIGIN` | Frontend URL | `https://ticket-apw.vercel.app` |
| `NODE_ENV` | Environment | `production` |

---

## Step 8: Get Your Database Connection String

### From Supabase
1. Go to https://supabase.com
2. Select your project
3. **Settings** → **Database**
4. Copy **Connection string** (Session)
5. Replace `[YOUR-PASSWORD]` with actual password

Example:
```
postgresql://postgres:your-password@db.abcd1234.supabase.co:5432/postgres
```

### From Railway
1. Go to https://railway.app
2. Select your project
3. Select **PostgreSQL** service
4. **Connect** tab
5. Copy connection string

---

## Step 9: Generate JWT Secret

Run this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Use this value for `JWT_SECRET`.

---

## Step 10: Redeploy Backend with Env Vars

After setting environment variables, redeploy:

```bash
vercel deploy --prod --name=ticket-apw-api
```

Or use dashboard:
1. Select **ticket-apw-api** project
2. **Deployments** tab
3. Click latest deployment
4. **Redeploy**

---

## Step 11: Update Frontend API Config

Edit `src/lib/api-config.ts`:

```typescript
export const getApiBaseUrl = (): string => {
  const envUrl = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
    (typeof window !== 'undefined' && window.__API_URL__);

  if (envUrl) return envUrl;

  if (isDevelopment) {
    return 'http://localhost:3001/api';
  }
  
  // Production: backend on separate Vercel project
  return 'https://ticket-apw-api.vercel.app/api';
};
```

---

## Step 12: Set Frontend Environment Variable

In Vercel for **ticket-apw** (frontend) project:

1. Go to https://vercel.com/dashboard
2. Select **ticket-apw** project
3. **Settings** → **Environment Variables**
4. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://ticket-apw-api.vercel.app`
5. **Save**
6. **Deployments** → **Redeploy** latest

---

## Step 13: Test Backend Health

```bash
curl https://ticket-apw-api.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

---

## Step 14: Test Integration

1. Go to https://ticket-apw.vercel.app
2. Open DevTools (F12)
3. **Network** tab
4. Try logging in or making any API call
5. Verify:
   - API calls go to `ticket-apw-api.vercel.app`
   - Response status is 200
   - No CORS errors in Console

---

## Managing Both Projects

### View Backend Logs
```bash
vercel logs --prod --name=ticket-apw-api
```

### View Frontend Logs
```bash
vercel logs --prod
```

### Redeploy Backend
```bash
vercel deploy --prod --name=ticket-apw-api
```

### Redeploy Frontend
```bash
vercel deploy --prod
```

### Update Backend Environment Variable
```bash
vercel env add VAR_NAME --name=ticket-apw-api
```

---

## Local Development

### Run Frontend & Backend Together
```bash
npm run dev:all
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3001`

### Frontend Only
```bash
npm run dev
```

### Backend Only
```bash
npm run dev:server
```

---

## Troubleshooting

### Backend Returns 404

**Check logs:**
```bash
vercel logs --prod --name=ticket-apw-api
```

**Common issues:**
- Routes not imported in `server/app.js`
- Database connection string incorrect
- Environment variables not set

**Fix:**
```bash
vercel env list --name=ticket-apw-api
# Verify all variables are set

vercel deploy --prod --name=ticket-apw-api
# Redeploy
```

### CORS Error in Browser

**Error:** `Access to XMLHttpRequest ... has been blocked by CORS policy`

**Fix:**
1. Verify `CORS_ORIGIN` is set to: `https://ticket-apw.vercel.app`
2. Check `server/app.js` has: `app.use(cors())`
3. Redeploy backend

```bash
vercel env add CORS_ORIGIN https://ticket-apw.vercel.app --name=ticket-apw-api
vercel deploy --prod --name=ticket-apw-api
```

### Database Connection Fails

**Error:** `ECONNREFUSED` or `connect ETIMEDOUT`

**Fix:**
1. Verify `DATABASE_URL` is correct
   ```bash
   vercel env list --name=ticket-apw-api
   ```

2. For Supabase, add Vercel IP to firewall:
   - Go to Project Settings → Network
   - Add `0.0.0.0/0` (allow all, or specific Vercel IPs)

3. Test connection locally:
   ```bash
   psql "your-database-url"
   ```

### Frontend Can't Find Backend

**Check:**
1. `VITE_API_URL` is set in frontend environment
2. Frontend is redeployed after setting variable
3. Backend URL is correct: `https://ticket-apw-api.vercel.app`

**DevTools check:**
- Network tab → filter "api"
- Verify URLs start with `ticket-apw-api.vercel.app`

---

## Deployment Checklist

- [ ] `vercel.json` created with backend config
- [ ] `vercel login` completed
- [ ] Backend Vercel project created: `vercel deploy --prod --name=ticket-apw-api`
- [ ] All 6 environment variables set on backend
- [ ] Backend URL: `https://ticket-apw-api.vercel.app/api/health` works
- [ ] Frontend `VITE_API_URL` set on Vercel
- [ ] Frontend redeployed
- [ ] Frontend loads without errors
- [ ] API calls in DevTools go to backend domain
- [ ] Test API endpoint works end-to-end

---

## Git Workflow

All code stays in one repository. Vercel deploys both projects from same repo:

```bash
# Make changes
git add .
git commit -m "Update API routes"
git push origin main

# Both projects auto-deploy
# Frontend: https://ticket-apw.vercel.app
# Backend: https://ticket-apw-api.vercel.app
```

---

## Monitoring

### Real-time Logs
```bash
vercel logs --follow --name=ticket-apw-api
```

### View All Deployments
```bash
vercel list --name=ticket-apw-api
```

### Rollback to Previous Version
```bash
vercel rollback --name=ticket-apw-api
```

---

## Cost

- **Free tier**: Both projects, unlimited deployments
- **Pro ($20/month)**: Advanced features (not needed for MVP)
- **Enterprise**: Custom pricing

---

## What's Next

1. ✅ Deploy backend to Vercel
2. ✅ Deploy frontend to Vercel
3. ✅ Test integration
4. Setup API documentation (Swagger/OpenAPI)
5. Configure error tracking (Sentry)
6. Setup database backups
7. Monitor performance

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy backend
vercel deploy --prod --name=ticket-apw-api

# Deploy frontend
vercel deploy --prod

# View backend logs
vercel logs --prod --name=ticket-apw-api

# Set environment variable
vercel env add DATABASE_URL --name=ticket-apw-api

# List environment variables
vercel env list --name=ticket-apw-api

# View backend status
vercel inspect https://ticket-apw-api.vercel.app

# Redeploy backend
vercel redeploy --name=ticket-apw-api --prod
```

---

**Need help?** Check Vercel docs: https://vercel.com/docs
