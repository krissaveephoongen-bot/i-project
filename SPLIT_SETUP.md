# Setup Guide: Splitting Frontend and Backend

This guide will help you separate the monorepo into two independent repositories.

## Prerequisites

- Both repos cloned locally
- GitHub access
- Node.js 18+ installed

## Step 1: Create Backend Repository

### 1.1 Create on GitHub
- Go to github.com/krissaveephoongen-bot
- Create new repo: `ticket-apw-backend`
- Add description: "Backend API for Project Management System"
- Make it private
- Do NOT initialize with README (you'll push existing code)

### 1.2 Clone Backend Repo
```bash
cd ~
git clone https://github.com/krissaveephoongen-bot/ticket-apw-backend.git
cd ticket-apw-backend
```

## Step 2: Copy Backend Files to New Repo

Copy these directories:
```bash
# From: c:/Users/Jakgrits/project-mgnt
# To: ticket-apw-backend/

cp -r server/
cp -r api/
cp -r database/
cp -r prisma/
cp -r tests/integration/  (backend tests only)
```

Copy these files:
```bash
cp add-users.js .
cp prisma-query-tool.js .
cp Dockerfile.api Dockerfile
cp docker-compose.yml .
cp .dockerignore .
cp .env.example .
cp .gitignore .
cp tsconfig.json .
```

## Step 3: Create Backend Configuration Files

### 3.1 Create `package.json`
Copy from **BACKEND_PACKAGE.json** in current repo to `package.json`

### 3.2 Create `vercel.json`
Copy from **BACKEND_VERCEL.json** in current repo to `vercel.json`

### 3.3 Create `.env.example`
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ticket_apw

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Server
NODE_ENV=development
PORT=5000

# Vercel
VERCEL_ENV=development
```

### 3.4 Create `README.md` for Backend
```markdown
# ticket-apw-backend

Backend API for Project Management System

## Setup

1. Clone repo
2. Copy `.env.example` to `.env` and fill values
3. Install: `npm install`
4. Run: `npm run dev`

## API Endpoints

- GET `/health` - Health check
- POST `/api/auth/login` - Login
- GET `/api/projects` - List projects
- ... (document your routes)

## Deployment

### Vercel
```bash
vercel login
vercel deploy --prod
```

### Docker
```bash
docker build -t ticket-apw-backend .
docker run -p 5000:5000 ticket-apw-backend
```

## Environment Variables Required

See `.env.example`
```

## Step 4: Update Frontend Repo

### 4.1 Update `package.json`
Replace current `package.json` with **FRONTEND_PACKAGE.json**

### 4.2 Remove Backend Files from Frontend
```bash
# In frontend repo (project-mgnt), delete:
rm -rf server/
rm -rf api/
rm -rf database/
rm -rf prisma/
rm -rf add-users.js
rm -rf prisma-query-tool.js
rm -rf Dockerfile
rm -rf Dockerfile.api
rm -rf docker-compose.yml
```

### 4.3 Keep Frontend Files
- `src/` - React app
- `components/` - Components
- `hooks/` - React hooks
- `utils/` - Utilities
- `lib/` - Libraries
- `services/` - Services (update API URLs)
- `public/` - Static assets

### 4.4 Create `.env.example` for Frontend
```env
# API Configuration
VITE_API_URL=http://localhost:5000
# For production: https://api.yourdomain.com

# Optional: Analytics
VITE_ANALYTICS_ID=

# Supabase (if used)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 4.5 Update API Service
Update your API base URL in `services/api.js` or similar:

```javascript
// Before (assuming same server)
const API_URL = 'http://localhost:5000';

// After (separate backend)
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

// For production
export const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://ticket-apw-backend.vercel.app'; // Update with actual URL
  }
  return process.env.VITE_API_URL || 'http://localhost:5000';
};
```

## Step 5: Install Dependencies

```bash
# Backend
cd ~/ticket-apw-backend
npm install

# Frontend
cd ~/project-mgnt
npm install
```

## Step 6: Test Locally

### Terminal 1: Backend
```bash
cd ~/ticket-apw-backend
npm run dev
# Should start on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd ~/project-mgnt
npm run dev
# Should start on http://localhost:5173
```

Visit `http://localhost:5173` - should work with backend on separate port

## Step 7: Update CORS in Backend

In `server/app.js`, update allowed origins:

```javascript
const allowedOrigins = [
  'http://localhost:5173',    // Frontend local dev
  'http://127.0.0.1:5173',
  // Vercel deployment domains
  /\.vercel\.app$/,           // All Vercel apps
  // Add your production domain
  'https://yourdomain.com',
];
```

## Step 8: Deploy to Vercel

### Backend Deployment
```bash
cd ~/ticket-apw-backend
vercel login
vercel deploy --prod
# Note the URL: e.g., ticket-apw-backend.vercel.app
```

### Frontend Deployment
1. Update `VITE_API_URL` in frontend `.env.production`:
   ```env
   VITE_API_URL=https://ticket-apw-backend.vercel.app
   ```

2. Deploy frontend:
   ```bash
   cd ~/project-mgnt
   vercel deploy --prod
   ```

3. Update Vercel environment variables:
   - Go to project settings
   - Add `VITE_API_URL` for production

## Step 9: Git Setup

### Backend Repo
```bash
cd ~/ticket-apw-backend
git add .
git commit -m "Initial commit: Backend separation"
git push origin main
```

### Frontend Repo
```bash
cd ~/project-mgnt
git add .
git commit -m "Remove backend files: Frontend separation"
git push origin main
```

## Troubleshooting

### CORS Errors
- Check `server/app.js` allowed origins
- Include new frontend URL in allowedOrigins

### Database Connection Issues
- Verify DATABASE_URL in backend `.env`
- Test with: `npm run db:test`

### API Not Responding
- Check backend is running: `curl http://localhost:5000/health`
- Check frontend API URL: `echo $VITE_API_URL`

## Verification Checklist

- [ ] Backend repo created and pushed
- [ ] Frontend repo cleaned up and pushed
- [ ] Backend starts locally: `npm run dev`
- [ ] Frontend starts locally: `npm run dev`
- [ ] Frontend can call backend endpoints
- [ ] CORS allows frontend origin
- [ ] Database connects successfully
- [ ] Vercel projects created for both
- [ ] Environment variables set in Vercel
- [ ] Production deployment works

---

## Summary of Changes

| Item | Before | After |
|------|--------|-------|
| Repos | 1 monorepo | 2 separate repos |
| Frontend build | `npm run build` | `npm run build` |
| Backend start | `npm run server` | `npm run dev` |
| Dependencies | All mixed | Separated by type |
| Deployment | Single Vercel | 2 Vercel projects |
| API URL | Relative `/api` | Environment variable |

