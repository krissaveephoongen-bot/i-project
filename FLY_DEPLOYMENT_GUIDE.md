# Fly.io Deployment Guide

## Prerequisites

1. **Fly.io Account**: https://fly.io (free tier available)
2. **Flyctl CLI**: Install command-line tool
3. **Git**: Ensure code is committed
4. **Database URL**: PostgreSQL connection string ready

---

## Step 1: Install Flyctl

### Windows (PowerShell)
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### macOS/Linux
```bash
curl -L https://fly.io/install.sh | sh
```

### Verify Installation
```bash
flyctl version
```

---

## Step 2: Authenticate with Fly.io

```bash
flyctl auth login
```

This opens a browser to authenticate. Sign in with your Fly.io account or create one.

Verify authentication:
```bash
flyctl auth whoami
```

---

## Step 3: Create Fly.io App

```bash
cd c:\Users\Jakgrits\project-mgnt
flyctl launch
```

When prompted:
- **App Name**: `ticket-apw-api` (or your preferred name)
- **Region**: `sjc` (San Jose) or closest to you
- **PostgreSQL**: Say `No` (you'll add connection string later)
- **Redis**: Say `No`

This creates/updates `fly.toml` file.

---

## Step 4: Configure Environment Variables

### Option A: Set secrets one by one
```bash
flyctl secrets set DATABASE_URL="postgresql://user:password@host:5432/dbname"
flyctl secrets set JWT_SECRET="your-secret-key-here"
flyctl secrets set JWT_EXPIRY="7d"
flyctl secrets set BCRYPT_ROUNDS="10"
flyctl secrets set CORS_ORIGIN="https://ticket-apw.vercel.app"
flyctl secrets set NODE_ENV="production"
```

### Option B: Set all at once
```bash
flyctl secrets set \
  DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  JWT_SECRET="your-secret-key" \
  JWT_EXPIRY="7d" \
  BCRYPT_ROUNDS="10" \
  CORS_ORIGIN="https://ticket-apw.vercel.app" \
  NODE_ENV="production"
```

### Verify Secrets
```bash
flyctl secrets list
```

---

## Step 5: Prepare for Deployment

### Update fly.toml (if needed)
The file should already exist. Make sure it contains:

```toml
app = "ticket-apw-api"
primary_region = "sjc"

[build]
  builder = "heroku"

[env]
  NODE_ENV = "production"

[[services]]
  protocol = "tcp"
  internal_port = 3001
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[checks]
  [checks.http]
    grace_period = "10s"
    interval = "30s"
    method = "get"
    path = "/api/health"
    protocol = "http"
    timeout = "5s"
    tls_skip_verify = false
```

### Create .dockerignore (if not exists)
```
node_modules
npm-debug.log
.git
.env
.env.local
.DS_Store
dist
.vercel
uploads
```

---

## Step 6: Deploy to Fly.io

### Initial Deployment
```bash
flyctl deploy
```

Flyctl will:
1. Build Docker image
2. Upload to Fly.io
3. Deploy to your region
4. Start the application

**Wait for deployment to complete** (usually 2-3 minutes)

### Check Deployment Status
```bash
flyctl status
```

### View Logs
```bash
flyctl logs
```

### Get Your API URL
Your backend is now live at:
```
https://ticket-apw-api.fly.dev/api
```

Test it:
```bash
curl https://ticket-apw-api.fly.dev/api/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

---

## Step 7: Update Frontend on Vercel

### Set API URL in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select **ticket-apw** project
3. **Settings** → **Environment Variables**
4. Add/Update:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://ticket-apw-api.fly.dev`
5. Save and redeploy

Or use Vercel CLI:
```bash
vercel env add VITE_API_URL https://ticket-apw-api.fly.dev
```

Then redeploy:
```bash
git push origin main
```
(Vercel auto-deploys on push)

---

## Step 8: Verify Everything Works

### Test Health Endpoint
```bash
curl https://ticket-apw-api.fly.dev/api/health
```

### Test from Frontend
1. Go to https://ticket-apw.vercel.app
2. Open DevTools (F12)
3. **Console** tab - check for API errors
4. **Network** tab - verify API calls go to `ticket-apw-api.fly.dev`

---

## Manage Your Fly.io App

### View Current Status
```bash
flyctl status
```

### View Logs in Real-time
```bash
flyctl logs --follow
```

### Redeploy (after code changes)
```bash
git push origin main  # or your branch
flyctl deploy
```

### Scale App (add more instances)
```bash
flyctl scale count=2
```

### Restart App
```bash
flyctl restart
```

### Stop App (free tier)
```bash
flyctl scale count=0
```

### Delete App
```bash
flyctl destroy ticket-apw-api
```

---

## Database Connection

### If Using Supabase
1. Go to https://supabase.com
2. Create/select project
3. Get connection string from **Settings → Database → Connection string**
4. Add to Fly.io:
   ```bash
   flyctl secrets set DATABASE_URL="postgresql://..."
   ```

### If Using Railway
1. Go to https://railway.app
2. Create PostgreSQL plugin
3. Get connection string
4. Add to Fly.io secrets

### If Using Local PostgreSQL
Keep connection string updated in `.env` file locally

---

## Troubleshooting

### Deployment Fails
```bash
# Check logs
flyctl logs

# Rebuild and redeploy
flyctl deploy --no-cache
```

### App Crashes on Startup
1. Check environment variables: `flyctl secrets list`
2. Check DATABASE_URL is correct
3. Check logs: `flyctl logs`

### API Returns 502/503
- App might be crashing
- Run: `flyctl logs`
- Check database connection

### CORS Errors in Browser
- Verify `CORS_ORIGIN` secret is set to your frontend URL
- Restart app: `flyctl restart`

### Can't Connect to Database
- Verify `DATABASE_URL` is correct
- Check database accepts Fly.io IP addresses
- If using Supabase, ensure "Fly.io region" firewall rule is added

---

## Monitor Your App

### View Metrics
```bash
flyctl metrics
```

### Check Uptime
```bash
flyctl status
```

### Get Machine Details
```bash
flyctl machines list
```

---

## Updates & Maintenance

### Update Node Version (in Dockerfile.backend)
Edit `Dockerfile.backend`:
```dockerfile
FROM node:20-alpine  # Update version here
```

Then redeploy:
```bash
flyctl deploy
```

### Database Migrations
```bash
flyctl ssh console

# Inside Fly shell
npm run migrate:prod
exit
```

---

## Cost Estimates (Fly.io)

- **Free tier**: 3 shared-cpu-1x 256MB VMs, 3 Postgres databases
- **After free**: ~$5/month for 1 VM + database
- No charges for data transfer (within Fly network)

---

## Next Steps

1. ✅ Deploy backend to Fly.io
2. ✅ Update Vercel with new API URL
3. ✅ Test API endpoints
4. Setup CI/CD pipeline for auto-deploy on push
5. Configure monitoring (Sentry, DataDog, etc.)
6. Setup database backups

---

## Quick Cheat Sheet

```bash
# Login
flyctl auth login

# Create app
flyctl launch

# Set secrets
flyctl secrets set VAR="value"

# Deploy
flyctl deploy

# View logs
flyctl logs

# Restart
flyctl restart

# Status
flyctl status
```

---

## Need Help?

- Fly.io Docs: https://fly.io/docs
- Status: https://status.fly.io
- Community: https://community.fly.io
