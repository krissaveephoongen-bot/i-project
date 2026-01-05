# Fly.io Deployment - Quick Summary

## 🎯 Goal
Deploy your Express backend to Fly.io so Vercel frontend can call it.

**Current Setup:**
```
Frontend (Vercel) → Backend (Fly.io) → Database (PostgreSQL)
https://ticket-apw.vercel.app     https://ticket-apw-api.fly.dev
```

---

## ⚡ 5-Minute Quick Start

### 1. Install Flyctl
```bash
# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# macOS/Linux
curl -L https://fly.io/install.sh | sh
```

### 2. Login
```bash
flyctl auth login
```

### 3. Create App
```bash
flyctl launch
# Name: ticket-apw-api
# Region: sjc
# No Postgres, No Redis
```

### 4. Set Secrets
```bash
flyctl secrets set DATABASE_URL="your-db-url"
flyctl secrets set JWT_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
flyctl secrets set CORS_ORIGIN="https://ticket-apw.vercel.app"
flyctl secrets set NODE_ENV="production"
```

### 5. Deploy
```bash
flyctl deploy
```

### 6. Update Vercel
In Vercel dashboard:
- Set `VITE_API_URL = https://ticket-apw-api.fly.dev`
- Redeploy frontend

Done! Your API is live at: `https://ticket-apw-api.fly.dev/api`

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| **[FLY_DEPLOYMENT_GUIDE.md](FLY_DEPLOYMENT_GUIDE.md)** | Complete deployment instructions with troubleshooting |
| **[DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)** | Step-by-step checklist to follow |
| **[BACKEND_QUICKSTART.md](BACKEND_QUICKSTART.md)** | Local development setup |
| **[DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md)** | Overall architecture & options |

---

## 🔑 Required Values

Gather these before starting:

| Variable | Example | Where to Get |
|----------|---------|------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Supabase, Railway, or local PostgreSQL |
| `JWT_SECRET` | Random 32-char string | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CORS_ORIGIN` | `https://ticket-apw.vercel.app` | Your Vercel frontend URL |

---

## ✅ Verification Steps

After deployment:

```bash
# 1. Check status
flyctl status

# 2. View logs
flyctl logs

# 3. Test health endpoint
curl https://ticket-apw-api.fly.dev/api/health

# 4. Check frontend connects
# Open https://ticket-apw.vercel.app in browser
# DevTools → Network → verify API calls go to ticket-apw-api.fly.dev
```

---

## 🛠️ Common Commands

```bash
# View app status
flyctl status

# View live logs
flyctl logs --follow

# Restart app
flyctl restart

# Update environment variable
flyctl secrets set VAR="value"

# Redeploy after code changes
flyctl deploy

# List all secrets
flyctl secrets list

# Scale to 2 instances
flyctl scale count=2

# Stop app (keep IP)
flyctl scale count=0
```

---

## 🚀 Deploy Script

Use pre-made script for guided deployment:

**Windows:**
```bash
.\deploy-fly.ps1
```

**macOS/Linux:**
```bash
bash deploy-fly.sh
```

---

## 🐛 Troubleshooting

**API returns 404:**
- ✓ Run `flyctl logs` to see errors
- ✓ Verify DATABASE_URL is correct
- ✓ Check CORS_ORIGIN matches frontend

**Deployment fails:**
- ✓ Run `flyctl deploy --no-cache` to rebuild
- ✓ Check authentication: `flyctl auth whoami`
- ✓ Verify fly.toml exists and is valid

**Database connection fails:**
- ✓ Test connection: `psql $DATABASE_URL` (if local)
- ✓ For Supabase: ensure Fly.io region firewall rule is added
- ✓ Check DATABASE_URL format is correct

**CORS errors in browser:**
- ✓ Verify CORS_ORIGIN secret matches frontend URL exactly
- ✓ Run `flyctl restart` after updating secrets

---

## 📊 Monitoring

View real-time metrics:
```bash
flyctl metrics
```

Check health:
```bash
flyctl status
```

See machine details:
```bash
flyctl machines list
```

---

## 💰 Cost

**Free Tier Includes:**
- 3 shared CPU machines
- 3 databases
- Unlimited bandwidth

**After Free Tier:**
- ~$5/month per additional machine
- ~$15/month per database

---

## 🎓 Learning Resources

- **Fly.io Docs**: https://fly.io/docs
- **Express Guide**: https://fly.io/docs/languages-and-frameworks/nodejs/
- **Postgres Guide**: https://fly.io/docs/postgres/
- **Status Page**: https://status.fly.io

---

## Next Steps After Deployment

1. ✅ Deploy backend to Fly.io
2. ✅ Update VITE_API_URL on Vercel
3. ✅ Test API integration
4. Setup CI/CD for auto-deploy on git push
5. Configure monitoring (Sentry, DataDog)
6. Setup database backups
7. Add API documentation (Swagger)

---

**Questions?** Check the detailed guides above or visit https://fly.io/docs
