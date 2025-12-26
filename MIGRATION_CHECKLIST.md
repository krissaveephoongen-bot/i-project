# Frontend/Backend Split Migration Checklist

Complete this checklist to successfully separate the monorepo into two independent repositories.

## Phase 1: Preparation

- [ ] Read `SEPARATION_PLAN.md`
- [ ] Read `SPLIT_SETUP.md`
- [ ] Create GitHub repos:
  - [ ] `ticket-apw` (frontend) - already exists
  - [ ] `ticket-apw-backend` (NEW)
- [ ] Backup current monorepo: `git clone https://github.com/krissaveephoongen-bot/project-mgnt backup-monorepo`

## Phase 2: Backend Repository Setup

### Create Backend Repo Structure

```bash
cd ~/ticket-apw-backend
```

Copy directories:
- [ ] `server/` → `./server/`
- [ ] `api/` → `./api/`
- [ ] `database/` → `./database/`
- [ ] `prisma/` → `./prisma/`
- [ ] `tests/integration/` (backend tests only)

Copy files:
- [ ] `add-users.js`
- [ ] `prisma-query-tool.js`
- [ ] `Dockerfile.api` → `./Dockerfile`
- [ ] `docker-compose.yml`
- [ ] `.dockerignore`
- [ ] `.gitignore`
- [ ] `tsconfig.json`
- [ ] `BACKEND_README.md` → `./README.md`

### Backend Configuration Files

- [ ] Create `package.json` (use BACKEND_PACKAGE.json template)
- [ ] Create `vercel.json` (use BACKEND_VERCEL.json template)
- [ ] Create `.env.example`:
  ```env
  DATABASE_URL=postgresql://...
  JWT_SECRET=your-secret-key-here
  REDIS_URL=redis://localhost:6379
  NODE_ENV=development
  PORT=5000
  VERCEL_ENV=development
  ```
- [ ] Create `.github/workflows/deploy.yml` (if using CI/CD)

### Backend Git Setup

```bash
cd ~/ticket-apw-backend
git add .
git commit -m "Initial commit: Backend separation from monorepo"
git push origin main
```

- [ ] Initial commit pushed
- [ ] Backend repo is public/accessible

## Phase 3: Frontend Repository Cleanup

### Update Frontend package.json

- [ ] Replace `package.json` with FRONTEND_PACKAGE.json
- [ ] Verify only frontend dependencies are listed
- [ ] Remove backend scripts

### Remove Backend Files from Frontend

```bash
cd ~/project-mgnt
```

Delete directories:
- [ ] `server/`
- [ ] `api/`
- [ ] `database/`
- [ ] `prisma/`
- [ ] `tests/integration/` (keep frontend tests)

Delete files:
- [ ] `add-users.js`
- [ ] `prisma-query-tool.js`
- [ ] `Dockerfile`
- [ ] `Dockerfile.api`
- [ ] `docker-compose.yml`
- [ ] `.env` (create new frontend-only version)

### Update Frontend Configuration

- [ ] Create `.env.example.frontend` or update `.env.example`
- [ ] Rename `FRONTEND_README.md` → `README.md`
- [ ] Update `vercel.json` to remove backend rewrites (optional)

### Update Frontend API Services

Update all API service files to use `VITE_API_URL`:

- [ ] `admin-console/utils/api.js` - Updated ✓
- [ ] `src/admin-console/utils/api.js` - Updated ✓
- [ ] `services/taskService.js` - Updated ✓
- [ ] `services/teamService.js` - Updated ✓
- [ ] `services/resourceService.js` - Updated ✓
- [ ] `services/expenseService.js` - Updated ✓
- [ ] `services/dashboardService.js` - Updated ✓

Check for other services using old API URLs:
```bash
grep -r "localhost:5001" src/ services/
grep -r "localhost:3000" src/ services/
```

- [ ] No remaining hardcoded backend URLs

### Frontend Git Setup

```bash
cd ~/project-mgnt
git add .
git commit -m "Remove backend files: Frontend separation"
git push origin main
```

- [ ] Frontend cleanup committed
- [ ] Changes pushed to frontend repo

## Phase 4: Local Testing

### Terminal 1: Start Backend

```bash
cd ~/ticket-apw-backend
npm install
cp .env.example .env
# Edit .env with your database URL
npm run dev
```

- [ ] Backend starts without errors
- [ ] Health check passes: `curl http://localhost:5000/health`

### Terminal 2: Start Frontend

```bash
cd ~/project-mgnt
npm install
echo "VITE_API_URL=http://localhost:5000" > .env.local
npm run dev
```

- [ ] Frontend starts without errors
- [ ] Opens at `http://localhost:5173`
- [ ] No CORS errors in console
- [ ] Can login successfully
- [ ] Can call API endpoints

### Test API Connectivity

- [ ] Login works
- [ ] Load projects works
- [ ] Create task works
- [ ] Update user profile works
- [ ] No 404 errors for API calls

## Phase 5: Update CORS Configuration

Edit `server/app.js` in backend repo:

```javascript
const allowedOrigins = [
  'http://localhost:5173',           // Local frontend
  'http://127.0.0.1:5173',
  // Update with your production domain after deployment
  // 'https://ticket-apw.vercel.app',
  /\.vercel\.app$/,                  // All Vercel apps
];
```

- [ ] CORS origins updated in backend
- [ ] Frontend origin added to allowedOrigins

## Phase 6: Vercel Deployment

### Deploy Backend

```bash
cd ~/ticket-apw-backend
vercel login
vercel deploy --prod
```

- [ ] Backend deployed to Vercel
- [ ] Note the URL: `https://ticket-apw-backend.vercel.app` (or your custom domain)
- [ ] Test health check: `curl https://ticket-apw-backend.vercel.app/health`

### Set Backend Environment Variables in Vercel

In **Vercel Dashboard** → Backend Project → Settings → Environment Variables:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Secret key (32+ characters)
- [ ] `REDIS_URL` - Redis connection (if used)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `CORS_ORIGIN` - Frontend URL (optional, if using single CORS origin)

- [ ] All environment variables saved
- [ ] Redeploy backend after setting env vars

### Deploy Frontend

```bash
cd ~/project-mgnt
vercel deploy --prod
```

- [ ] Frontend deployed to Vercel
- [ ] Note the URL: `https://ticket-apw.vercel.app` (or your custom domain)

### Set Frontend Environment Variables in Vercel

In **Vercel Dashboard** → Frontend Project → Settings → Environment Variables:

- [ ] `VITE_API_URL` - Backend URL: `https://ticket-apw-backend.vercel.app`

- [ ] Environment variables saved
- [ ] Redeploy frontend after setting env vars

### Test Production

- [ ] Visit frontend: `https://ticket-apw.vercel.app`
- [ ] Login works
- [ ] Can view projects
- [ ] Can create tasks
- [ ] No API errors in console
- [ ] Check DevTools Network tab - all API calls go to backend URL

## Phase 7: Update CORS for Production

Edit `server/app.js` in backend repo, add production domain:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ticket-apw.vercel.app',    // Add production domain
  /\.vercel\.app$/,
];
```

- [ ] Production frontend URL added to CORS
- [ ] Commit and push: `git commit -am "Update CORS for production"`
- [ ] Redeploy backend with updated CORS

## Phase 8: Documentation & Cleanup

### Update Documentation

- [ ] README.md in frontend points to backend repo
- [ ] README.md in backend points to frontend repo
- [ ] Links to both repos are correct
- [ ] SPLIT_SETUP.md is in frontend repo for reference

### Archive Monorepo (Optional)

- [ ] Create backup of original monorepo
- [ ] Archive old repo on GitHub (set to private)
- [ ] Update issue tracker to point to new repos

### Update Related Documentation

- [ ] Wiki/confluence updated
- [ ] CI/CD pipelines updated (if any)
- [ ] Deployment documentation updated
- [ ] Team notified of new repo structure

## Phase 9: Team Handoff

- [ ] Development team trained on new structure
- [ ] New repo access granted to all team members
- [ ] Git workflow documented
- [ ] API documentation shared with frontend team
- [ ] Backend deployment guide shared

## Verification Checklist

- [ ] Backend repo created and accessible
- [ ] Frontend repo cleaned up and pushed
- [ ] Both repos have proper documentation
- [ ] Local development works with separate services
- [ ] Production deployment works end-to-end
- [ ] CORS properly configured
- [ ] Environment variables set correctly
- [ ] No hardcoded backend URLs in frontend
- [ ] API calls use VITE_API_URL
- [ ] Database migrations work
- [ ] JWT authentication works
- [ ] All tests pass locally
- [ ] Team can clone and run both repos

## Rollback Plan (If Needed)

If something goes wrong:

1. Revert GitHub pushes:
   ```bash
   git reset --hard <previous-commit>
   git push --force origin main
   ```

2. Restore from backup monorepo:
   ```bash
   git clone ~/backup-monorepo
   ```

3. Notify team of rollback

## Next Steps After Migration

1. **Monitor deployments**: Check both Vercel projects for errors
2. **Performance testing**: Ensure API calls work with separate backends
3. **User testing**: Have QA test all major flows
4. **Documentation**: Update team wiki/docs with new process
5. **Automation**: Update CI/CD to handle two repos (if applicable)
6. **Future improvements**:
   - API documentation (OpenAPI/Swagger)
   - Docker Compose for local development (both services)
   - GitHub Actions for automated testing
   - Database backup strategy
   - Monitoring and logging setup

## Support

- **Frontend issues**: Check frontend repo issues
- **Backend issues**: Check backend repo issues
- **Integration issues**: Check both repos, CORS configuration
- **Deployment issues**: Check Vercel dashboard, environment variables

---

**Status**: Begin Migration
**Last Updated**: [Date]
**Owner**: [Your Name]
