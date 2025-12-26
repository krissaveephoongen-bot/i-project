# Git Commands for Repository Separation

Complete commands to execute the frontend/backend separation.

## Initial Setup

### Backup Current Monorepo
```bash
cd ~
git clone https://github.com/krissaveephoongen-bot/project-mgnt.git project-mgnt-backup
```

### Clone Both Repositories
```bash
# Frontend (existing)
git clone https://github.com/krissaveephoongen-bot/ticket-apw.git ticket-apw
cd ticket-apw
git status

# Backend (new - create on GitHub first)
cd ~
git clone https://github.com/krissaveephoongen-bot/ticket-apw-backend.git ticket-apw-backend
cd ticket-apw-backend
git status
```

## Backend Repository Initialization

Copy files from original monorepo to backend repo:

```bash
# Change to backend repo
cd ~/ticket-apw-backend

# Copy directories from project-mgnt
cp -r ~/project-mgnt/server ./
cp -r ~/project-mgnt/api ./
cp -r ~/project-mgnt/database ./
cp -r ~/project-mgnt/prisma ./

# Copy individual files
cp ~/project-mgnt/add-users.js ./
cp ~/project-mgnt/prisma-query-tool.js ./
cp ~/project-mgnt/.dockerignore ./
cp ~/project-mgnt/.gitignore ./
cp ~/project-mgnt/tsconfig.json ./tsconfig.backend.json
cp ~/project-mgnt/docker-compose.yml ./
cp ~/project-mgnt/Dockerfile.api ./Dockerfile

# Create configuration files
# Copy content from BACKEND_PACKAGE.json to package.json
# Copy content from BACKEND_VERCEL.json to vercel.json
# Copy content from .env template

# Add all files to git
git add .
git status

# Review changes
git diff --cached

# Commit
git commit -m "Initial commit: Separate backend from monorepo

- Copy server, api, database, and prisma directories
- Add backend-specific package.json
- Add backend-specific vercel.json
- Add Docker configuration
- Configure for independent deployment"

# Push to GitHub
git push origin main

# Verify push
git log --oneline -5
```

## Frontend Repository Cleanup

Remove backend files and update frontend:

```bash
# Change to frontend repo
cd ~/ticket-apw

# Update from project-mgnt if needed
git pull origin main

# Remove backend directories
rm -rf server/
rm -rf api/
rm -rf database/
rm -rf prisma/

# Remove backend files
rm -f add-users.js
rm -f prisma-query-tool.js
rm -f Dockerfile
rm -f Dockerfile.api
rm -f docker-compose.yml

# Stage deletions
git add -A

# Update package.json with frontend-only version
# Edit or replace package.json with FRONTEND_PACKAGE.json content

# Update .env files
rm -f .env
cp .env.example.frontend .env.local

# Add changes
git add .
git status

# Review changes
git diff --cached | head -100

# Commit
git commit -m "Separate frontend repository from monorepo

BREAKING CHANGE: Backend is now in separate repository

Removed:
- server/ (moved to ticket-apw-backend)
- api/ (moved to ticket-apw-backend)
- database/ (moved to ticket-apw-backend)
- prisma/ (moved to ticket-apw-backend)
- Backend dependencies from package.json
- Docker configurations (use backend repo instead)

Updated:
- package.json - frontend dependencies only
- API services to use VITE_API_URL environment variable
- Environment configuration for separate backend

Related:
- Backend repo: https://github.com/krissaveephoongen-bot/ticket-apw-backend
- Frontend now connects to external API via VITE_API_URL env var
- CORS handled by backend server configuration"

# Push to GitHub
git push origin main

# Verify push
git log --oneline -5
```

## Verify Repositories Are Separate

### Backend Repo
```bash
cd ~/ticket-apw-backend

# Verify backend files exist
ls -la server/
ls -la api/
ls -la prisma/

# Check package.json for backend dependencies
cat package.json | grep -A 20 '"dependencies"'

# Check Git history
git log --oneline
```

### Frontend Repo
```bash
cd ~/ticket-apw

# Verify frontend structure
ls -la src/
ls -la components/

# Verify backend files are removed
[ ! -d server ] && echo "✓ server/ removed" || echo "✗ server/ still exists"
[ ! -d api ] && echo "✓ api/ removed" || echo "✗ api/ still exists"
[ ! -d prisma ] && echo "✓ prisma/ removed" || echo "✗ prisma/ still exists"

# Check package.json for frontend dependencies only
cat package.json | grep -A 30 '"dependencies"'

# Check Git history
git log --oneline
```

## Install Dependencies

### Backend
```bash
cd ~/ticket-apw-backend
npm install

# Verify installation
npm list | head -20
npm run prisma:generate
```

### Frontend
```bash
cd ~/ticket-apw
npm install

# Verify installation
npm list | head -20
npm run build --dry-run
```

## Local Testing

### Terminal 1: Start Backend
```bash
cd ~/ticket-apw-backend

# Create .env file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgresql://user:password@localhost:5432/ticket_apw

# Start server
npm run dev

# Expected output:
# 🚀 Server running on http://localhost:5000
# ✓ Database connected
```

### Terminal 2: Start Frontend
```bash
cd ~/ticket-apw

# Create .env.local
echo "VITE_API_URL=http://localhost:5000" > .env.local

# Start frontend
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### Test Connection
```bash
# Terminal 3: Test backend health
curl http://localhost:5000/health
# Expected: {"status":"ok"}

# Test API connectivity
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/projects
```

## Deploy to Vercel

### Deploy Backend
```bash
cd ~/ticket-apw-backend

# Install Vercel CLI if needed
npm install -g vercel

# Login to Vercel
vercel login
# Follow prompts to authenticate

# Deploy to production
vercel deploy --prod

# Output will show:
# 🔗 Produced .vercel/project.json
# ✓ Production: https://ticket-apw-backend.vercel.app
```

### Set Backend Environment Variables
```
Vercel Dashboard (https://vercel.com/dashboard)
→ ticket-apw-backend project
→ Settings → Environment Variables
→ Add:
  - DATABASE_URL: postgresql://...
  - JWT_SECRET: your-secret-key
  - NODE_ENV: production
  - REDIS_URL: (if using)

→ Deployments → Redeploy latest
```

### Deploy Frontend
```bash
cd ~/ticket-apw

# Deploy to production
vercel deploy --prod

# Output will show:
# 🔗 Produced .vercel/project.json
# ✓ Production: https://ticket-apw.vercel.app
```

### Set Frontend Environment Variables
```
Vercel Dashboard
→ ticket-apw project
→ Settings → Environment Variables
→ Add:
  - VITE_API_URL: https://ticket-apw-backend.vercel.app

→ Deployments → Redeploy latest
```

## Update CORS in Backend

After frontend is deployed:

```bash
cd ~/ticket-apw-backend

# Edit server/app.js
# Update allowedOrigins array to include production frontend:

# Before:
const allowedOrigins = [
  'http://localhost:5173',
  /\.vercel\.app$/,
];

# After:
const allowedOrigins = [
  'http://localhost:5173',           # Local dev
  'https://ticket-apw.vercel.app',   # Production frontend
  /\.vercel\.app$/,                  # All Vercel apps
];

# Commit changes
git add server/app.js
git commit -m "Update CORS for production frontend domain"

# Push to GitHub
git push origin main

# Redeploy backend in Vercel
vercel deploy --prod
```

## Verify Production Deployment

```bash
# Test backend
curl https://ticket-apw-backend.vercel.app/health
# Expected: {"status":"ok"}

# Test frontend (in browser)
# Navigate to https://ticket-apw.vercel.app
# Should load without errors
# Check DevTools → Network → see API calls go to backend URL
```

## Ongoing Repository Management

### Update Frontend
```bash
cd ~/ticket-apw
git status
git add .
git commit -m "Your commit message"
git push origin main
# Auto-deploys to Vercel
```

### Update Backend
```bash
cd ~/ticket-apw-backend
git status
git add .
git commit -m "Your commit message"
git push origin main
# Auto-deploys to Vercel
```

### Create Feature Branches
```bash
# Frontend feature
cd ~/ticket-apw
git checkout -b feature/new-component
# ... make changes ...
git add .
git commit -m "Add new component"
git push origin feature/new-component
# Create Pull Request on GitHub

# Backend feature
cd ~/ticket-apw-backend
git checkout -b feature/new-endpoint
# ... make changes ...
git add .
git commit -m "Add new API endpoint"
git push origin feature/new-endpoint
# Create Pull Request on GitHub
```

## Useful Git Status Checks

### Check Backend Repo
```bash
cd ~/ticket-apw-backend
git status                 # Current state
git log --oneline -10      # Recent commits
git branch -a              # All branches
git remote -v              # Remote URLs
```

### Check Frontend Repo
```bash
cd ~/ticket-apw
git status
git log --oneline -10
git branch -a
git remote -v
```

## If You Need to Rollback

### Revert Backend Commit
```bash
cd ~/ticket-apw-backend
git log --oneline
git revert <commit-hash>
# or
git reset --hard <commit-hash>
git push origin main
```

### Revert Frontend Commit
```bash
cd ~/ticket-apw
git log --oneline
git revert <commit-hash>
# or
git reset --hard <commit-hash>
git push origin main
```

## Summary of Git Workflow

```
1. Create backend repo on GitHub
2. Clone both repos locally
3. Copy files to backend repo
4. Commit and push backend repo
5. Remove files from frontend repo
6. Commit and push frontend repo
7. Install dependencies in both
8. Test locally with both running
9. Deploy backend to Vercel
10. Deploy frontend to Vercel
11. Test production endpoints
12. Done!
```

---

**Key Points**:
- Each repo is independent
- Frontend connects to backend via `VITE_API_URL`
- Changes to either repo trigger separate Vercel deployments
- Always test locally before pushing to GitHub
- Use feature branches for new features
- Keep commit messages clear and descriptive
