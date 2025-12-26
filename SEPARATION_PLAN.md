# Separating Frontend and Backend

## Repository Structure

### Current: Monorepo
```
project-mgnt/
├── server/          ← Backend
├── api/             ← Serverless functions (Vercel)
├── src/             ← React frontend
├── package.json     ← Shared
└── vercel.json
```

### New: Separate Repos

#### 1. Frontend Repo (ticket-apw or keep current)
```
ticket-apw/
├── src/             ← React app
├── components/
├── hooks/
├── utils/
├── lib/
├── services/
├── public/
├── index.html
├── package.json     ← Frontend deps only
├── vite.config.ts
├── tsconfig.json
└── vercel.json      ← Points to backend API
```

#### 2. Backend Repo (ticket-apw-backend) - NEW
```
ticket-apw-backend/
├── server/          ← Express app
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── app.js
├── api/             ← Vercel serverless (optional)
├── database/        ← Migrations
├── prisma/          ← Schema
├── package.json     ← Backend deps only
├── .env.example
├── tsconfig.json
├── vercel.json      ← For Vercel deployment
└── Dockerfile       ← For Docker deployment
```

## Steps to Separate

### Phase 1: Create Backend Repo
1. Create new GitHub repo: `ticket-apw-backend`
2. Clone both repos locally
3. Copy backend files to new repo:
   - `server/` → `/server`
   - `api/` → `/api`
   - `database/` → `/database`
   - `prisma/` → `/prisma`
   - Backend scripts

### Phase 2: Create Backend package.json
- Keep only backend dependencies
- Add backend-specific scripts
- Update `postinstall` for Prisma

### Phase 3: Update Frontend
- Remove backend dependencies
- Update API base URL to separate backend
- Keep frontend-specific files

### Phase 4: Environment Variables
- Frontend `.env`: `VITE_API_URL=https://backend.vercel.app`
- Backend `.env`: Database, JWT, etc.

### Phase 5: Deploy
- Backend to Vercel (or Railway/Render)
- Frontend to Vercel
- Update CORS origins in backend

## Files to Move to Backend Repo

**Directories:**
- server/
- api/
- database/
- prisma/

**Files:**
- add-users.js
- prisma-query-tool.js
- Dockerfile.api
- docker-compose.yml (if backend-only)

## Files to Keep in Frontend Repo

**Directories:**
- src/
- components/
- hooks/
- utils/
- lib/
- services/
- public/
- admin-console/
- user-portal/

**Files:**
- index.html
- vite.config.ts
- tailwind.config.js
- package.json (frontend only)

## Shared Files (Duplicate)

These should exist in both repos with repo-specific adjustments:
- .gitignore
- .env.example
- tsconfig.json
- vercel.json
- Dockerfile (different for each)

## Next Steps

1. Should I create the backend package.json first?
2. Should I create GitHub-ready files (README, .gitignore)?
3. Do you want to split now or prepare files first?
