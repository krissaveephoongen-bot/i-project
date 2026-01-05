# Vercel Backend Deployment - Quick Checklist

Complete these 15 steps to deploy backend to Vercel.

---

## ✅ Prerequisites (5 min)

- [ ] Vercel account created (https://vercel.app)
- [ ] GitHub repo connected to Vercel
- [ ] PostgreSQL database ready (Supabase/Railway)
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged in: `vercel login`

---

## ✅ Prepare Backend (2 min)

- [ ] `server/app.js` exists with Express app
- [ ] Routes exist: `server/routes/*.js`
- [ ] `vercel.json` created with backend config
- [ ] Environment variables documented

---

## ✅ Create Backend Project on Vercel (5 min)

```bash
cd c:\Users\Jakgrits\project-mgnt
vercel deploy --prod --name=ticket-apw-api
```

When prompted:
- Scope: Your account
- Project: Create new
- Name: `ticket-apw-api`
- Framework: `Other`
- Root: `.`
- Build: `npm install`

- [ ] Deployment successful
- [ ] Backend URL shown: `https://ticket-apw-api.vercel.app`

---

## ✅ Get Database URL (2 min)

From Supabase or Railway, get PostgreSQL connection string:

```
postgresql://user:password@host:5432/database
```

- [ ] Database URL obtained

---

## ✅ Generate JWT Secret (1 min)

Run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output (example: `a1b2c3d4e5f6...`)

- [ ] JWT secret generated

---

## ✅ Set Backend Environment Variables (5 min)

### Using CLI (Quick)
```bash
vercel env add DATABASE_URL --name=ticket-apw-api
vercel env add JWT_SECRET --name=ticket-apw-api
vercel env add CORS_ORIGIN --name=ticket-apw-api
vercel env add NODE_ENV --name=ticket-apw-api
vercel env add JWT_EXPIRY --name=ticket-apw-api
vercel env add BCRYPT_ROUNDS --name=ticket-apw-api
```

### Using Dashboard (Alternative)
1. Go to https://vercel.com/dashboard
2. Select `ticket-apw-api` project
3. **Settings** → **Environment Variables**
4. Add each variable from table below

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://...` |
| `JWT_SECRET` | Random hex (generated above) |
| `CORS_ORIGIN` | `https://ticket-apw.vercel.app` |
| `NODE_ENV` | `production` |
| `JWT_EXPIRY` | `7d` |
| `BCRYPT_ROUNDS` | `10` |

- [ ] All 6 variables set
- [ ] Verified: `vercel env list --name=ticket-apw-api`

---

## ✅ Redeploy Backend (3 min)

```bash
vercel deploy --prod --name=ticket-apw-api
```

Or via dashboard:
1. **ticket-apw-api** project
2. **Deployments** tab
3. Click latest
4. **Redeploy**

- [ ] Redeployment successful

---

## ✅ Test Backend Health (1 min)

```bash
curl https://ticket-apw-api.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

- [ ] Health endpoint responds with 200

---

## ✅ Update Frontend Config (2 min)

Edit `src/lib/api-config.ts`:

Change development URL from:
```typescript
return 'http://localhost:5173/api';
```

To:
```typescript
return 'http://localhost:3001/api';  // For local dev
// Production uses VITE_API_URL env var
```

- [ ] File updated

---

## ✅ Set Frontend API URL (2 min)

In Vercel dashboard for **ticket-apw** (frontend):

1. **Settings** → **Environment Variables**
2. Add/Update:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://ticket-apw-api.vercel.app`
3. **Save**

Or CLI:
```bash
vercel env add VITE_API_URL https://ticket-apw-api.vercel.app
```

- [ ] Environment variable set

---

## ✅ Redeploy Frontend (2 min)

```bash
vercel deploy --prod
```

Or via dashboard:
1. **ticket-apw** project
2. **Deployments**
3. **Redeploy** latest

Or via git:
```bash
git push origin main
# Auto-deploys
```

- [ ] Frontend redeployed

---

## ✅ Test Full Integration (5 min)

### Test Backend
```bash
curl https://ticket-apw-api.vercel.app/api/health
```
- [ ] Returns 200 with `{"status":"ok"}`

### Test Frontend
1. Go to https://ticket-apw.vercel.app
2. Open DevTools (F12)
3. **Console** tab
   - [ ] No errors
4. **Network** tab
   - Make an API call (login, fetch projects, etc.)
   - [ ] API calls show `ticket-apw-api.vercel.app` domain
   - [ ] Response status 200 (not 404/500)
5. **Application** tab
   - [ ] LocalStorage shows auth token (if logged in)

---

## ✅ Verify Everything (2 min)

### Health Check
```bash
curl https://ticket-apw-api.vercel.app/api/health
```

- [ ] Backend responds

### Logs
```bash
vercel logs --prod --name=ticket-apw-api
```

- [ ] No error messages
- [ ] Shows recent requests

### Environment Variables
```bash
vercel env list --name=ticket-apw-api
```

- [ ] All 6 variables present

---

## ✅ Final Checklist

- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Backend health endpoint works
- [ ] Frontend API URL updated
- [ ] Frontend redeployed
- [ ] No CORS errors in browser
- [ ] API calls go to correct backend domain
- [ ] Tests pass in browser console
- [ ] Database queries work end-to-end

---

## 🎉 Complete!

Your deployment is done!

**URLs:**
- Frontend: https://ticket-apw.vercel.app
- Backend API: https://ticket-apw-api.vercel.app/api
- Health: https://ticket-apw-api.vercel.app/api/health

**View Logs:**
```bash
vercel logs --prod --name=ticket-apw-api
```

**Make Changes:**
```bash
git push origin main  # Both auto-deploy
```

---

## 🚨 Troubleshooting

### API returns 404
```bash
vercel logs --prod --name=ticket-apw-api
# Check for route errors
```

### CORS error in browser
```bash
vercel env add CORS_ORIGIN https://ticket-apw.vercel.app --name=ticket-apw-api
vercel deploy --prod --name=ticket-apw-api
```

### Database connection fails
```bash
vercel env list --name=ticket-apw-api
# Verify DATABASE_URL is correct
```

### Frontend still hitting old backend
```bash
# Clear browser cache
# Check frontend VITE_API_URL is set
# Verify frontend is redeployed
```

---

**See detailed guide:** `VERCEL_BACKEND_SETUP_GUIDE.md`
