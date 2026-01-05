# Fly.io Deployment Checklist

Complete these steps in order to deploy your backend to Fly.io.

---

## ✅ Prerequisites

- [ ] Fly.io account created (https://fly.io)
- [ ] Git repository is up to date
- [ ] All code changes committed
- [ ] PostgreSQL database ready (Supabase, Railway, or local)
- [ ] Database URL obtained

**Example PostgreSQL connection strings:**
- **Supabase**: `postgresql://[user]:[password]@db.[ref].supabase.co:5432/postgres`
- **Railway**: `postgresql://[user]:[password]@[host]:[port]/[database]`
- **Local PostgreSQL**: `postgresql://[user]:[password]@localhost:5432/ticket_apw`

---

## 🔧 Step 1: Install Flyctl CLI

### Windows (PowerShell Admin)
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

- [ ] Installation complete
- [ ] Verify: `flyctl version`

### macOS/Linux
```bash
curl -L https://fly.io/install.sh | sh
```

- [ ] Installation complete
- [ ] Verify: `flyctl version`

---

## 🔑 Step 2: Authenticate

```bash
flyctl auth login
```

- [ ] Login successful
- [ ] Browser opened and authenticated
- [ ] Verify: `flyctl auth whoami`

---

## 📦 Step 3: Create Fly.io App

Navigate to project directory:
```bash
cd c:\Users\Jakgrits\project-mgnt
```

Launch Fly.io app:
```bash
flyctl launch
```

When prompted:
- [ ] App name: `ticket-apw-api`
- [ ] Region: `sjc` (or closest to you)
- [ ] Postgres: `No`
- [ ] Redis: `No`

Verify `fly.toml` created:
- [ ] File exists
- [ ] Contains `app = "ticket-apw-api"`

---

## 🔐 Step 4: Set Environment Variables

Gather these values first:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Generate a random secret key
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Set all secrets:
```bash
flyctl secrets set DATABASE_URL="postgresql://..."
flyctl secrets set JWT_SECRET="your-secret-here"
flyctl secrets set JWT_EXPIRY="7d"
flyctl secrets set BCRYPT_ROUNDS="10"
flyctl secrets set CORS_ORIGIN="https://ticket-apw.vercel.app"
flyctl secrets set NODE_ENV="production"
```

Verify all secrets set:
```bash
flyctl secrets list
```

- [ ] `DATABASE_URL` set ✓
- [ ] `JWT_SECRET` set ✓
- [ ] `JWT_EXPIRY` set ✓
- [ ] `BCRYPT_ROUNDS` set ✓
- [ ] `CORS_ORIGIN` set ✓
- [ ] `NODE_ENV` set ✓

---

## 🚀 Step 5: Deploy Backend

### Option A: Auto Deploy (Recommended)
```bash
flyctl deploy
```

- [ ] Deployment started
- [ ] Wait for completion (2-3 minutes)
- [ ] Status shows "healthy"

### Option B: Using Deploy Script
```bash
# Windows
.\deploy-fly.ps1

# macOS/Linux
bash deploy-fly.sh
```

Verify deployment:
```bash
flyctl status
```

- [ ] All machines show `running`
- [ ] Health check shows `passing`

---

## ✨ Step 6: Verify Backend is Live

### Test Health Endpoint
```bash
curl https://ticket-apw-api.fly.dev/api/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

- [ ] Health endpoint responds
- [ ] Status is `ok`

### View Real-time Logs
```bash
flyctl logs
```

- [ ] No error messages
- [ ] Request logs visible

---

## 🌐 Step 7: Update Frontend on Vercel

### Get Your Backend URL
```bash
echo "https://ticket-apw-api.fly.dev"
```

### Update Vercel Environment Variable

**Option A: Vercel Dashboard**
1. [ ] Go to https://vercel.com/dashboard
2. [ ] Select **ticket-apw** project
3. [ ] **Settings** → **Environment Variables**
4. [ ] Update/Add:
   - Name: `VITE_API_URL`
   - Value: `https://ticket-apw-api.fly.dev`
5. [ ] **Save** and trigger **Redeploy**

**Option B: Vercel CLI**
```bash
vercel env add VITE_API_URL https://ticket-apw-api.fly.dev
```

- [ ] Variable saved on Vercel
- [ ] Frontend redeployed

---

## ✅ Step 8: Test Integration

### 1. Frontend Loads
- [ ] Go to https://ticket-apw.vercel.app
- [ ] Page loads without errors

### 2. Check DevTools
1. [ ] Open DevTools (F12)
2. [ ] **Network** tab
3. [ ] Look for API requests
4. [ ] Verify calls go to `ticket-apw-api.fly.dev`

### 3. Console Logs
- [ ] **Console** tab - no error messages
- [ ] API calls return 200/201 status

### 4. Test API Endpoint
```bash
curl https://ticket-apw-api.fly.dev/api/health
curl https://ticket-apw-api.fly.dev/api/projects
```

- [ ] Endpoints respond correctly

---

## 📊 Step 9: Setup Monitoring (Optional)

### View Metrics
```bash
flyctl metrics
```

- [ ] CPU usage visible
- [ ] Memory usage visible
- [ ] Network traffic visible

### Enable Health Checks
```bash
flyctl checks list
```

- [ ] Health check passes every 30s
- [ ] Grace period: 10s after startup

### View Logs Continuously
```bash
flyctl logs --follow
```

- [ ] Tail logs in real-time
- [ ] Monitor for errors

---

## 🔄 Step 10: Setup Auto-Deploy (Optional)

### Enable GitHub Auto-Deploy
```bash
flyctl deploy --now
```

Then on GitHub pushes, Fly.io automatically redeploys.

- [ ] GitHub integration enabled
- [ ] Auto-deploy on push working

---

## 🎯 Deployment Complete!

Your backend is now live:
- **API URL**: `https://ticket-apw-api.fly.dev/api`
- **Health**: `https://ticket-apw-api.fly.dev/api/health`
- **Frontend**: `https://ticket-apw.vercel.app`

### Useful Commands Going Forward

```bash
# View status
flyctl status

# View logs
flyctl logs --follow

# Restart app
flyctl restart

# Update secrets
flyctl secrets set VAR="value"

# Deploy again after code changes
flyctl deploy

# Scale (more instances)
flyctl scale count=2

# Scale down (free tier)
flyctl scale count=1
```

---

## 🚨 Troubleshooting

If deployment fails, check:

1. **Check logs**
   ```bash
   flyctl logs
   ```

2. **Verify secrets**
   ```bash
   flyctl secrets list
   ```

3. **Check database connection**
   - Ensure `DATABASE_URL` is correct
   - Ensure database accepts Fly.io IPs

4. **Rebuild without cache**
   ```bash
   flyctl deploy --no-cache
   ```

5. **Get help**
   - Fly.io Docs: https://fly.io/docs
   - Run: `flyctl help`

---

## 📝 Notes

- Fly.io free tier includes 3 shared CPUs and databases
- Databases auto-backup daily
- No charges for data transfer within Fly network
- Next steps: Setup CI/CD, monitoring, backups

---

**Keep this checklist updated as you make changes to deployment settings.**
