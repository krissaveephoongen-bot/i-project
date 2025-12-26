# Frontend/Backend Separation - Summary

All preparation work has been completed. The monorepo is ready to be split into two independent repositories.

## What's Been Done

### ✅ Frontend Updates (Current Repo - project-mgnt)

1. **package.json** - Replaced with frontend-only dependencies
   - Removed: Express, Prisma, database-related packages
   - Kept: React, Vite, UI libraries, HTTP clients

2. **Environment Variables**
   - Created `.env.example.frontend` with `VITE_API_URL` config
   - All API services updated to use environment variable

3. **API Service Updates** - Updated to use `VITE_API_URL`
   - ✓ `admin-console/utils/api.js`
   - ✓ `src/admin-console/utils/api.js`
   - ✓ `services/taskService.js`
   - ✓ `services/teamService.js`
   - ✓ `services/resourceService.js`
   - ✓ `services/expenseService.js`
   - ✓ `services/dashboardService.js`

4. **Documentation Created**
   - `FRONTEND_README.md` - Frontend setup guide
   - `FRONTEND_PACKAGE.json` - Template (for reference)

### ✅ Backend Preparation (To be created)

Files ready to copy to new `ticket-apw-backend` repo:

1. **Configuration Files Created**
   - `BACKEND_PACKAGE.json` - Backend-only dependencies
   - `BACKEND_VERCEL.json` - Vercel configuration for backend
   - `BACKEND_README.md` - Backend setup guide

2. **Setup Guides Created**
   - `SPLIT_SETUP.md` - Step-by-step separation guide
   - `SEPARATION_PLAN.md` - Architecture overview
   - `MIGRATION_CHECKLIST.md` - Complete checklist to follow

## Repository Structure After Split

```
Frontend Repo (current: project-mgnt → ticket-apw)
├── src/                      ← React application
├── components/
├── hooks/
├── services/                 ← UPDATED: Uses VITE_API_URL
├── admin-console/
├── user-portal/
├── public/
├── package.json              ← REPLACED: Frontend-only
├── vite.config.ts
├── .env.example.frontend     ← NEW
├── FRONTEND_README.md        ← NEW
└── (backend files removed)

Backend Repo (NEW: ticket-apw-backend)
├── server/                   ← Express application
├── api/                      ← Serverless functions
├── database/                 ← Database utilities
├── prisma/                   ← Schema & migrations
├── package.json              ← BACKEND_PACKAGE.json template
├── vercel.json               ← BACKEND_VERCEL.json template
├── .env.example              ← NEW
└── BACKEND_README.md         ← NEW
```

## Quick Start for Separation

### Step 1: Create Backend Repository
```bash
# Create new GitHub repo: ticket-apw-backend
git clone https://github.com/krissaveephoongen-bot/ticket-apw-backend.git
cd ticket-apw-backend
```

### Step 2: Copy Backend Files
Use `SPLIT_SETUP.md` to:
- Copy `server/`, `api/`, `database/`, `prisma/` directories
- Copy configuration files
- Use `BACKEND_PACKAGE.json` as `package.json`
- Use `BACKEND_VERCEL.json` as `vercel.json`

### Step 3: Install and Test Backend
```bash
npm install
cp .env.example .env
# Edit .env with your database URL
npm run dev
```

### Step 4: Update Frontend
```bash
cd ~/project-mgnt
npm install
cp .env.example.frontend .env.local
npm run dev
```

### Step 5: Test Locally
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`
- Should work together without CORS issues

### Step 6: Deploy Both to Vercel
See `SPLIT_SETUP.md` for detailed Vercel deployment steps.

## Key Configuration Changes

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000          # Local dev
# or
VITE_API_URL=https://ticket-apw-backend.vercel.app  # Production
```

### Backend (server/app.js - CORS)
```javascript
const allowedOrigins = [
  'http://localhost:5173',                 # Local frontend
  'https://ticket-apw.vercel.app',         # Production frontend
  /\.vercel\.app$/,                        # All Vercel apps
];
```

## Files to Read (In Order)

1. **SEPARATION_PLAN.md** - Understand the new architecture
2. **SPLIT_SETUP.md** - Step-by-step implementation guide
3. **MIGRATION_CHECKLIST.md** - Follow this to ensure nothing is missed
4. **FRONTEND_README.md** - Frontend-specific documentation
5. **BACKEND_README.md** - Backend-specific documentation

## API Integration

All API calls now use environment variables:

```javascript
// Old (hardcoded)
const API_BASE_URL = 'http://localhost:3000/api';

// New (environment-based)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## Deployment Overview

```
GitHub Push
    ↓
[Frontend Repo]  →  Vercel (ticket-apw.vercel.app)
    ↓
    VITE_API_URL=https://ticket-apw-backend.vercel.app

[Backend Repo]   →  Vercel (ticket-apw-backend.vercel.app)
    ↓
    DATABASE_URL=postgresql://...
    JWT_SECRET=...
```

## What's Still Needed

Before going live, you need to:

1. **Create `ticket-apw-backend` GitHub repo**
2. **Copy backend files to new repo** (use SPLIT_SETUP.md)
3. **Test locally** with both repos running
4. **Deploy backend to Vercel** and note the URL
5. **Set frontend VITE_API_URL** in Vercel
6. **Deploy frontend to Vercel**
7. **Update CORS** in backend with production frontend URL
8. **Test production** deployment end-to-end

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| API calls fail | Check `VITE_API_URL` env var and backend URL |
| CORS errors | Verify frontend URL in `server/app.js` allowedOrigins |
| Database errors | Check `DATABASE_URL` in backend `.env` |
| JWT failures | Ensure `JWT_SECRET` is same on backend and frontend |
| Port conflicts | Change `PORT` in backend `.env` |

## Environment Variables Checklist

### Frontend (.env.local)
- [ ] `VITE_API_URL` - Backend API URL

### Backend (.env)
- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `JWT_SECRET` - Secret for JWT signing (32+ chars)
- [ ] `NODE_ENV` - `development` or `production`
- [ ] `PORT` - Server port (default: 5000)
- [ ] `REDIS_URL` - Redis connection (optional)
- [ ] `CORS_ORIGIN` - Frontend URL (optional)

### Vercel - Frontend Project
- [ ] `VITE_API_URL` - Production backend URL

### Vercel - Backend Project
- [ ] `DATABASE_URL` - Production PostgreSQL
- [ ] `JWT_SECRET` - Production secret key
- [ ] `NODE_ENV` - `production`
- [ ] All other backend env vars

## Rollback

If needed, you can always:
1. Revert GitHub pushes
2. Restore from backup monorepo clone
3. Continue with monorepo structure

## Next Steps

1. Create `ticket-apw-backend` GitHub repository
2. Follow `SPLIT_SETUP.md` step-by-step
3. Run `MIGRATION_CHECKLIST.md` to track progress
4. Test locally before deploying to Vercel
5. Deploy backend first, then frontend
6. Monitor both Vercel projects for errors

## Support Files

| File | Purpose |
|------|---------|
| SEPARATION_PLAN.md | Architecture overview |
| SPLIT_SETUP.md | Detailed implementation steps |
| MIGRATION_CHECKLIST.md | Verification checklist |
| FRONTEND_README.md | Frontend development guide |
| BACKEND_README.md | Backend development guide |
| FRONTEND_PACKAGE.json | Frontend dependencies |
| BACKEND_PACKAGE.json | Backend dependencies |
| BACKEND_VERCEL.json | Backend Vercel config |

All these files are ready in the current repository for reference.

---

**Status**: Preparation Complete ✓
**Next Step**: Create GitHub repo & begin separation
**Estimated Time**: 2-3 hours to fully separate and test
