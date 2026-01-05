# Backend Deployment to Vercel

**Goal**: Deploy Express backend as separate Vercel project

**Status**: 🔄 Ready to Deploy

---

## Quick Overview

| Item | Details |
|------|---------|
| **Current Problem** | Vercel serverless API failing with 404/500 errors |
| **Solution** | Deploy backend to separate Vercel project |
| **Architecture** | Frontend + Backend on same Vercel account, same GitHub repo |
| **Cost** | Free (both projects on free tier) |
| **Time to Deploy** | 15-20 minutes |

---

## What Gets Deployed

```
Frontend Project (ticket-apw)
├── React + Vite
├── URL: https://ticket-apw.vercel.app
└── Calls: https://ticket-apw-api.vercel.app/api/*

Backend Project (ticket-apw-api)
├── Express server
├── URL: https://ticket-apw-api.vercel.app
└── Database: PostgreSQL (Supabase/Railway)
```

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Vercel account (free at https://vercel.app)
- [ ] GitHub repository connected to Vercel
- [ ] PostgreSQL database (Supabase, Railway, or local)
  - PostgreSQL URL obtained
- [ ] Node.js installed locally
- [ ] Terminal/Command Prompt open
- [ ] Vercel CLI installed: `npm install -g vercel`

---

## Files Already Prepared

✅ `server/app.js` - Express server configured
✅ `server/routes/*.js` - API routes (4 files)
✅ `vercel.json` - Backend deployment config (just created)
✅ `src/lib/api-config.ts` - Updated to use backend URL
✅ `package.json` - Has `dev:server` script

You're ready to deploy!

---

## Documentation Files

Read in this order:

### 1. **[VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)** ⭐ START HERE
   - **Purpose**: Exact step-by-step commands to follow
   - **Length**: 5-10 minutes to read
   - **Contains**: Every command with explanations
   - **Use**: Follow exactly, copy-paste commands

### 2. **[VERCEL_BACKEND_CHECKLIST.md](VERCEL_BACKEND_CHECKLIST.md)**
   - **Purpose**: Quick reference checklist
   - **Length**: 2 minutes
   - **Contains**: All 15 steps checked off
   - **Use**: Use during deployment to track progress

### 3. **[VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md)**
   - **Purpose**: Detailed technical guide
   - **Length**: 20 minutes
   - **Contains**: Full explanations, troubleshooting, best practices
   - **Use**: Read if you get stuck or want to understand more

### 4. **[VERCEL_BACKEND_SUMMARY.md](VERCEL_BACKEND_SUMMARY.md)**
   - **Purpose**: Overview and reference
   - **Length**: 10 minutes
   - **Contains**: Quick reference, common commands
   - **Use**: After deployment, for ongoing management

### 5. **[VERCEL_BACKEND_DEPLOYMENT.md](VERCEL_BACKEND_DEPLOYMENT.md)**
   - **Purpose**: Technical architecture details
   - **Length**: 15 minutes
   - **Contains**: Different deployment options, configurations
   - **Use**: If you want to customize setup

---

## 15-Minute Deployment

**If you're in a hurry, follow these commands exactly:**

```bash
# 1. Install CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Go to project
cd c:\Users\Jakgrits\project-mgnt

# 4. Deploy backend
vercel deploy --prod --name=ticket-apw-api

# 5. Get database URL and generate JWT secret
# (Save these values)

# 6. Set environment variables
vercel env add DATABASE_URL --name=ticket-apw-api
vercel env add JWT_SECRET --name=ticket-apw-api
vercel env add CORS_ORIGIN --name=ticket-apw-api
vercel env add NODE_ENV --name=ticket-apw-api
vercel env add JWT_EXPIRY --name=ticket-apw-api
vercel env add BCRYPT_ROUNDS --name=ticket-apw-api

# 7. Redeploy
vercel deploy --prod --name=ticket-apw-api

# 8. Test
curl https://ticket-apw-api.vercel.app/api/health

# 9. Update frontend in Vercel dashboard
# Add VITE_API_URL = https://ticket-apw-api.vercel.app

# 10. Redeploy frontend from dashboard

# 11. Test
# Open https://ticket-apw.vercel.app in browser
# Check DevTools → Network tab
```

Done! ✅

---

## Required Values

Gather these before deploying:

### 1. PostgreSQL Connection String
From Supabase:
- Go to https://supabase.com
- Select project → Settings → Database
- Copy "Connection string (Session)"
- Replace `[YOUR-PASSWORD]` with actual password

Example:
```
postgresql://postgres:password123@db.abcd1234.supabase.co:5432/postgres
```

### 2. JWT Secret
Run this:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### 3. Frontend URL
Usually:
```
https://ticket-apw.vercel.app
```

---

## Deployment Checklist

Use [VERCEL_BACKEND_CHECKLIST.md](VERCEL_BACKEND_CHECKLIST.md) to track:

- [ ] Step 1: Install Vercel CLI
- [ ] Step 2: Login to Vercel
- [ ] Step 3: Deploy backend
- [ ] Step 4: Get database URL
- [ ] Step 5: Generate JWT secret
- [ ] Step 6: Set environment variables
- [ ] Step 7: Redeploy backend
- [ ] Step 8: Test health endpoint
- [ ] Step 9: Update frontend config
- [ ] Step 10: Set frontend environment variable
- [ ] Step 11: Redeploy frontend
- [ ] Step 12: Test integration
- [ ] Step 13: Verify logs
- [ ] Step 14: Check DevTools
- [ ] Step 15: Deployment complete ✅

---

## Verify Deployment Works

### Test 1: Health Endpoint
```bash
curl https://ticket-apw-api.vercel.app/api/health
```

Response should be:
```json
{"status":"ok","message":"Server is running"}
```

### Test 2: Frontend Loads
Go to https://ticket-apw.vercel.app

Page should load without errors.

### Test 3: DevTools Check
1. Open https://ticket-apw.vercel.app
2. Press F12 (DevTools)
3. **Network** tab
4. Make an API call (login, fetch data, etc.)
5. Verify:
   - Request goes to `ticket-apw-api.vercel.app`
   - Response status is 200
   - No CORS errors in Console

### Test 4: View Logs
```bash
vercel logs --prod --name=ticket-apw-api
```

Should show:
- No error messages
- Recent API requests

---

## Troubleshooting Quick Reference

| Error | Solution |
|-------|----------|
| `command not found: vercel` | Run: `npm install -g vercel` |
| `not authenticated` | Run: `vercel login` |
| API returns 404 | Run: `vercel logs --prod --name=ticket-apw-api` to see error |
| CORS error in browser | Verify `CORS_ORIGIN` environment variable is correct |
| Database connection fails | Check `DATABASE_URL` environment variable |
| Frontend still calling wrong API | Verify `VITE_API_URL` is set, clear cache, redeploy |

For detailed troubleshooting, see [VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md#troubleshooting)

---

## After Deployment

### Making Code Changes
```bash
git add .
git commit -m "your message"
git push origin main
# Both projects auto-deploy!
```

### View Logs
```bash
# Frontend
vercel logs --prod

# Backend
vercel logs --prod --name=ticket-apw-api
```

### Update Environment Variable
```bash
vercel env add VAR_NAME --name=ticket-apw-api
vercel deploy --prod --name=ticket-apw-api
```

### Redeploy Manually
```bash
# Backend
vercel deploy --prod --name=ticket-apw-api

# Frontend
vercel deploy --prod
```

---

## Key Differences from Fly.io

| Aspect | Vercel | Fly.io |
|--------|--------|--------|
| Setup Time | 15 minutes | 20 minutes |
| Cost | Free | Free |
| Infrastructure | Serverless functions | VMs |
| Scaling | Auto | Manual |
| Complexity | Simpler | More control |
| Best For | Rapid deployment | Production-grade apps |

---

## File Structure After Deployment

```
project-mgnt/
├── src/                      # Frontend React code
│   └── lib/
│       └── api-config.ts     # Points to backend URL
├── server/                   # Backend Express code
│   ├── app.js               # Express server
│   └── routes/              # API route handlers
├── vercel.json              # Backend deployment config
├── package.json             # Scripts & dependencies
├── public/                  # Static assets
├── VERCEL_DEPLOYMENT_STEPS.md        # Step-by-step guide
├── VERCEL_BACKEND_SETUP_GUIDE.md     # Detailed guide
└── VERCEL_BACKEND_CHECKLIST.md       # Checklist
```

---

## Support

**Need help?**

1. Check [VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md#troubleshooting)
2. Run: `vercel help`
3. Visit: https://vercel.com/docs

---

## Next Steps (After Deployment)

1. ✅ Deploy backend to Vercel
2. ✅ Deploy frontend to Vercel
3. ✅ Test integration
4. Setup CI/CD pipeline (optional)
5. Configure error tracking (Sentry)
6. Setup database backups
7. Add monitoring (DataDog)

---

## Summary

**Your backend deployment is:**
- ✅ Configured
- ✅ Documented
- ✅ Ready to deploy

**Next action:**
1. Read: [VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)
2. Follow each step
3. Test with curl
4. Verify in browser

**Estimated time:** 15-20 minutes

Let's deploy! 🚀

---

**Questions?** See documentation files listed above.
