# Deployment Fix Guide - Frontend/Backend Separation

## Issues Fixed

### 1. ✅ Backend Import Path Corrections
All backend routes now use correct relative imports:
- Changed: `from '../../lib/db.js'` → `from '../lib/db.js'`
- Changed: `from '../../lib/schema.js'` → `from '../lib/schema.js'`

**Files Updated:**
- `backend/routes/project-routes.js`
- `backend/routes/auth-routes.js`
- `backend/routes/user-routes.js`
- `backend/routes/task-routes.js`
- `backend/routes/analytics-routes.js`
- `backend/routes/expenses-routes.js`
- `backend/routes/reports-routes.js`
- `backend/routes/search-routes.js`
- `backend/routes/teams-routes.js`
- `backend/routes/timesheets-routes.js`

### 2. ✅ Backend Vercel Configuration Fixed
**File: `backend/vercel.json`**
- Updated routes to specifically handle `/api/*` paths
- Added production environment variable configuration

### 3. ✅ Frontend Vercel Configuration Enhanced
**File: `frontend/vercel.json`**
- Added explicit build command: `npm run build`
- Added output directory: `dist`
- Added cache control headers for static assets
- Improved SPA routing for asset serving

### 4. ✅ Root Vercel Configuration Created
**File: `vercel.json` (new)**
- Created monorepo-aware configuration
- Routes `/api/*` to backend
- Routes static assets and SPA fallback to frontend
- Sets up proper build environment

## Deployment Steps

### Prerequisites
```bash
# Install dependencies for all modules
npm run install:all
```

### Local Testing (Before Deployment)
```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev:frontend
```

**Expected Results:**
- Backend runs on port 3001
- Frontend runs on port 5173
- Frontend can connect to backend via `http://localhost:3001/api`

### Build Verification
```bash
# Build both
npm run build:frontend
npm run build:backend

# Check frontend dist output exists
ls frontend/dist/
```

### Deployment to Vercel

#### Option 1: Using Git Push (Recommended)
```bash
git add .
git commit -m "fix: correct import paths and vercel configuration for frontend/backend separation"
git push origin main
```

Vercel will automatically detect changes and redeploy.

#### Option 2: Manual Vercel CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Post-Deployment Testing

#### Backend Health Check
```bash
curl https://ticket-apw-api.vercel.app/api/health
# Expected: {"status":"ok","message":"Server is running"}
```

#### Frontend Loading
Visit: https://ticket-apw.vercel.app
- Check browser console for errors
- Verify page loads and displays

#### API Connectivity
```bash
# Should return array of projects
curl -H "Authorization: Bearer YOUR_TOKEN" https://ticket-apw-api.vercel.app/api/projects
```

## Environment Variables Required

### Backend (Vercel Project Settings)
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:5432/dbname
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=https://ticket-apw.vercel.app
```

### Frontend (Vercel Project Settings)
```
VITE_API_URL=https://ticket-apw-api.vercel.app/api
NODE_ENV=production
```

## Architecture Diagram

```
Client (Browser)
    ↓
https://ticket-apw.vercel.app (Frontend - React/Vite)
    ├→ Loads React app (SPA)
    └→ API calls to:
        https://ticket-apw-api.vercel.app/api/* (Backend - Express)
            ├→ /api/health
            ├→ /api/projects
            ├→ /api/users
            ├→ /api/tasks
            ├→ /api/auth
            └→ ... other routes
```

## Troubleshooting

### Issue: 404 on Frontend Assets
**Cause:** Build output not in correct location
**Fix:** Verify `frontend/dist/` contains:
- `index.html`
- `assets/` folder with JS/CSS files

### Issue: CORS Errors in Browser Console
**Cause:** Frontend origin not whitelisted
**Fix:** Update backend `CORS_ORIGIN` environment variable to match frontend URL

### Issue: 404 on API Endpoints
**Cause:** Backend routes not matching
**Fix:** Verify `vercel.json` routes configuration correctly maps `/api/*` to backend

### Issue: Failed Module Loads
**Cause:** Wrong import paths or missing build
**Fix:** 
1. Run `npm run install:all` to ensure all deps installed
2. Verify import paths are correct (should use `../` not `../../`)
3. Run local build test: `npm run build:frontend && npm run build:backend`

## Verification Checklist

- [ ] All import paths fixed in backend routes
- [ ] Backend vercel.json updated
- [ ] Frontend vercel.json enhanced
- [ ] Root vercel.json created
- [ ] Environment variables set in Vercel dashboard
- [ ] Frontend builds successfully locally
- [ ] Backend routes load without errors
- [ ] Frontend loads without console errors
- [ ] API health check returns 200
- [ ] Frontend can fetch data from API

## Next Steps

1. Commit all changes
2. Push to main branch
3. Monitor Vercel deployment logs
4. Run post-deployment tests
5. Check production URLs work correctly

---

**Configuration Changed:** 2026-01-05
**Backend Version:** 1.0.0
**Frontend Version:** 1.0.0
