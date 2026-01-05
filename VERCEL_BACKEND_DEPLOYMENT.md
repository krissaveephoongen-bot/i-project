# Deploy Separate Backend Server to Vercel

Deploy your Express backend as a separate Vercel project.

**Architecture:**
```
Frontend: https://ticket-apw.vercel.app (React + Vite)
Backend: https://ticket-apw-api.vercel.app (Express server)
Database: PostgreSQL (Supabase/Railway)
```

---

## Step 1: Create Backend Vercel Config

Create `vercel-backend.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".",
  "framework": "express"
}
```

Or use `vercel.json` with explicit API routes.

---

## Step 2: Prepare Backend for Vercel

Vercel uses serverless functions for Node.js. Convert Express to Vercel-compatible format:

### Option A: Use Express with Vercel (Recommended)

Create `api/index.js`:

```javascript
import app from '../server/app.js';

export default app;
```

Create `vercel.json`:

```json
{
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Option B: Keep Server as-is

Vercel will auto-detect `server/app.js` and deploy it.

---

## Step 3: Update API Config

Update `src/lib/api-config.ts`:

```typescript
export const getApiBaseUrl = (): string => {
  const envUrl = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
    (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) ||
    (typeof window !== 'undefined' && window.__API_URL__);

  if (envUrl) return envUrl;

  if (isDevelopment) {
    return 'http://localhost:3001/api';
  }
  
  // Production: separate backend on Vercel
  if (typeof window !== 'undefined') {
    return 'https://ticket-apw-api.vercel.app/api';
  }
  return '/api';
};
```

---

## Step 4: Create Separate Vercel Project for Backend

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Create separate backend project
cd c:\Users\Jakgrits\project-mgnt
vercel --prod --name=ticket-apw-api
```

When prompted:
- **Project name**: `ticket-apw-api`
- **Framework**: `Other`
- **Root directory**: `.`

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. **Add New** → **Project**
3. Import from GitHub (your repository)
4. **Project Name**: `ticket-apw-api`
5. **Framework**: `Other`
6. **Build Command**: `npm install`
7. **Output Directory**: `.`
8. **Environment Variables**: (next step)

---

## Step 5: Set Environment Variables on Vercel Backend

In Vercel Dashboard for `ticket-apw-api` project:

**Settings** → **Environment Variables**

Add:
- `DATABASE_URL` = `postgresql://...` (your database URL)
- `JWT_SECRET` = Random secret (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `JWT_EXPIRY` = `7d`
- `BCRYPT_ROUNDS` = `10`
- `CORS_ORIGIN` = `https://ticket-apw.vercel.app`
- `NODE_ENV` = `production`

---

## Step 6: Update Frontend Vercel Project

For `ticket-apw` (frontend) project:

**Settings** → **Environment Variables**

Add/Update:
- `VITE_API_URL` = `https://ticket-apw-api.vercel.app`

---

## Step 7: Deploy

### Deploy Backend
```bash
vercel --prod --name=ticket-apw-api
```

### Deploy Frontend (auto on git push)
```bash
git push origin main
```

Or manually:
```bash
vercel --prod
```

---

## Step 8: Verify Deployment

### Test Backend Health
```bash
curl https://ticket-apw-api.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

### Check Frontend
Go to https://ticket-apw.vercel.app

Open DevTools → Network tab → verify API calls go to `ticket-apw-api.vercel.app`

---

## Managing Two Vercel Projects

### Frontend Project Commands
```bash
# Deploy frontend
vercel --prod

# View logs
vercel logs --prod
```

### Backend Project Commands
```bash
# Deploy backend
vercel --prod --name=ticket-apw-api

# View logs
vercel logs --prod --name=ticket-apw-api
```

Or use Vercel Dashboard for both.

---

## Full Vercel.json for Backend

```json
{
  "name": "ticket-apw-api",
  "version": 2,
  "public": true,
  "env": {
    "NODE_ENV": "production"
  },
  "builds": [
    {
      "src": "server/app.js",
      "use": "@vercel/node",
      "config": {
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
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

---

## Update Package.json Scripts

Ensure these scripts exist:

```json
{
  "scripts": {
    "start": "node server/app.js",
    "dev": "vite",
    "dev:server": "node server/app.js",
    "build": "vite build",
    "test": "npm run test:unit && npm run test:integration"
  }
}
```

---

## Troubleshooting

### Backend Returns 404
- Check `vercel logs --prod --name=ticket-apw-api`
- Verify routes in `server/routes/*.js`
- Check environment variables are set

### CORS Errors
- Verify `CORS_ORIGIN` is set to frontend URL exactly
- Check `server/app.js` has `cors()` middleware
- Restart backend

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Check database accepts Vercel IPs
- For Supabase: ensure firewall rule allows Vercel

### Frontend Can't Find Backend
- Check `VITE_API_URL` in frontend environment
- Verify backend URL format: `https://ticket-apw-api.vercel.app`
- Open DevTools → Console for errors

---

## Git Workflow

### Push Both Projects
```bash
# Make changes
git add .
git commit -m "Update backend and frontend"
git push origin main

# Both auto-deploy to Vercel
```

### Different Branches
Keep everything in one repo, both auto-deploy on git push.

---

## Monitor Both Projects

### Vercel Dashboard
- Frontend: https://vercel.com/dashboard?filter=ticket-apw
- Backend: https://vercel.com/dashboard?filter=ticket-apw-api

### Logs
```bash
# Frontend logs
vercel logs

# Backend logs
vercel logs --name=ticket-apw-api
```

---

## Cost on Vercel

- **Free tier**: Includes both projects, unlimited deployments
- **Pro**: $20/month (if you need Pro features)
- No charges for API calls between your projects

---

## Next Steps

1. ✅ Create backend Vercel config
2. ✅ Create second Vercel project for backend
3. ✅ Set environment variables
4. ✅ Deploy to both projects
5. ✅ Test integration
6. Setup monitoring/logging
7. Configure auto-deploy on git push

---

## Quick Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy backend as separate project
vercel --prod --name=ticket-apw-api

# Deploy frontend
vercel --prod

# View backend logs
vercel logs --prod --name=ticket-apw-api

# Set environment variable
vercel env add DATABASE_URL --name=ticket-apw-api
```

---

See **VERCEL_BACKEND_SETUP_GUIDE.md** for detailed setup.
