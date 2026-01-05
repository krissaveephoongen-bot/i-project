# Vercel Backend Deployment - Summary

Deploy your Express backend to Vercel (separate project from frontend).

---

## What You're Doing

Moving from:
```
❌ Vercel serverless API (broken catch-all routes)
```

To:
```
✅ Frontend: https://ticket-apw.vercel.app (React, Vite)
✅ Backend: https://ticket-apw-api.vercel.app (Express, Node.js)
✅ Database: PostgreSQL (Supabase/Railway)
```

All from same GitHub repository.

---

## 5-Minute Quick Start

### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 2. Deploy Backend
```bash
cd c:\Users\Jakgrits\project-mgnt
vercel deploy --prod --name=ticket-apw-api
```

### 3. Set Environment Variables
```bash
vercel env add DATABASE_URL --name=ticket-apw-api
vercel env add JWT_SECRET --name=ticket-apw-api
vercel env add CORS_ORIGIN --name=ticket-apw-api
```

### 4. Redeploy with Variables
```bash
vercel deploy --prod --name=ticket-apw-api
```

### 5. Update Frontend
In Vercel dashboard:
- Add `VITE_API_URL = https://ticket-apw-api.vercel.app`
- Redeploy frontend

### 6. Test
```bash
curl https://ticket-apw-api.vercel.app/api/health
```

Done! ✅

---

## Files You Need

| File | Purpose |
|------|---------|
| `server/app.js` | Express app (already exists) |
| `server/routes/*.js` | API routes (already exist) |
| `vercel.json` | Backend deployment config |
| `src/lib/api-config.ts` | Points to backend API |

---

## Environment Variables Needed

| Variable | Example | Get From |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://...` | Supabase/Railway |
| `JWT_SECRET` | Random hex | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CORS_ORIGIN` | `https://ticket-apw.vercel.app` | Your frontend URL |
| `NODE_ENV` | `production` | Hard-coded |
| `JWT_EXPIRY` | `7d` | Your choice |
| `BCRYPT_ROUNDS` | `10` | Your choice |

---

## Vercel.json Template

```json
{
  "version": 2,
  "name": "ticket-apw-api",
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
  ]
}
```

---

## Manage Two Projects

| Task | Command |
|------|---------|
| Deploy frontend | `vercel deploy --prod` |
| Deploy backend | `vercel deploy --prod --name=ticket-apw-api` |
| View backend logs | `vercel logs --prod --name=ticket-apw-api` |
| View frontend logs | `vercel logs --prod` |
| Set backend env var | `vercel env add VAR --name=ticket-apw-api` |
| List backend vars | `vercel env list --name=ticket-apw-api` |

---

## Test Commands

```bash
# Health check
curl https://ticket-apw-api.vercel.app/api/health

# View logs
vercel logs --prod --name=ticket-apw-api

# Check environment variables
vercel env list --name=ticket-apw-api

# List all deployments
vercel list --name=ticket-apw-api
```

---

## Key Points

✅ Same GitHub repo, two Vercel projects
✅ Frontend auto-deploys from main branch
✅ Backend auto-deploys from main branch
✅ All code in one place, deploys to two services
✅ Free tier covers both projects
✅ No extra infrastructure needed

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| API returns 404 | Check `vercel logs --name=ticket-apw-api` |
| CORS errors | Verify `CORS_ORIGIN` env var matches frontend URL |
| Database fails | Check `DATABASE_URL` is correct, test with `psql` |
| Frontend can't find backend | Verify `VITE_API_URL` is set and frontend is redeployed |

---

## Next Steps

1. ✅ Install Vercel CLI
2. ✅ Create backend Vercel project
3. ✅ Set environment variables
4. ✅ Update frontend config
5. ✅ Test integration
6. Setup monitoring (optional)
7. Configure CI/CD (optional)

---

## Documentation

| Document | Read If |
|----------|---------|
| **[VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md)** | You want detailed step-by-step instructions |
| **[VERCEL_BACKEND_CHECKLIST.md](VERCEL_BACKEND_CHECKLIST.md)** | You want a simple checklist to follow |
| **[VERCEL_BACKEND_DEPLOYMENT.md](VERCEL_BACKEND_DEPLOYMENT.md)** | You want overview and reference |

---

## Cost

**Free Tier:**
- Both projects included
- Unlimited deployments
- Perfect for MVP

**Pro ($20/month):**
- Advanced analytics
- Priority support
- Not needed for MVP

---

## Current Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ Deployed | https://ticket-apw.vercel.app |
| Backend | 🔄 To Deploy | https://ticket-apw-api.vercel.app |
| Database | ✅ Ready | Your PostgreSQL |

---

## Help

**Get Started:**
1. Read [VERCEL_BACKEND_CHECKLIST.md](VERCEL_BACKEND_CHECKLIST.md)
2. Follow each step
3. Test with curl and browser

**More Details:**
- [VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md) - Full walkthrough
- [VERCEL_BACKEND_DEPLOYMENT.md](VERCEL_BACKEND_DEPLOYMENT.md) - Technical overview

**Vercel Help:**
- https://vercel.com/docs
- https://vercel.com/docs/cli

---

**Ready?** Start with the checklist: [VERCEL_BACKEND_CHECKLIST.md](VERCEL_BACKEND_CHECKLIST.md)
