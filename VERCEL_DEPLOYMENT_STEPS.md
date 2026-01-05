# Deploy to Vercel - Step by Step

Follow these exact steps to deploy backend to Vercel.

---

## Step 1: Install Vercel CLI

### Windows (Command Prompt or PowerShell)
```bash
npm install -g vercel
```

### Verify
```bash
vercel --version
```

Expected output: `Vercel CLI 32.x.x`

---

## Step 2: Login to Vercel

```bash
vercel login
```

Your browser opens. Sign in with your Vercel account or create one at https://vercel.app

After login, terminal shows:
```
✓ Success! Logged in
```

---

## Step 3: Navigate to Project

```bash
cd c:\Users\Jakgrits\project-mgnt
```

---

## Step 4: Deploy Backend to Vercel

```bash
vercel deploy --prod --name=ticket-apw-api
```

When prompted:
```
? Are you in the root of your project? (Y/n) › Y
```

Press `Y` (yes)

Next prompts:
```
? Link to existing project? (y/N) › N
```

Press `N` (no, create new project)

```
? What's your project's name? › ticket-apw-api
```

Type `ticket-apw-api` (or keep suggestion)

```
? In which directory is your code located? › .
```

Press Enter (use current directory)

**WAIT** for deployment to complete (1-2 minutes).

You'll see:
```
✓ Production: https://ticket-apw-api.vercel.app [queued for deployment]
```

**Your backend URL is**: `https://ticket-apw-api.vercel.app`

---

## Step 5: Get PostgreSQL Connection String

### If Using Supabase

1. Go to https://supabase.com
2. Sign in
3. Select your project
4. Click **Settings** (gear icon)
5. Click **Database** in left menu
6. Scroll to **Connection string**
7. Click **URI** tab (if not already selected)
8. Copy the string
9. Replace `[YOUR-PASSWORD]` with your actual database password
10. Keep it in clipboard/notes

Example:
```
postgresql://postgres:YOUR-PASSWORD@db.abcd1234.supabase.co:5432/postgres
```

### If Using Railway

1. Go to https://railway.app
2. Sign in
3. Select your project
4. Click the **PostgreSQL** service
5. Click **Connect** tab
6. Copy the connection string from the Postgres Proxy section

---

## Step 6: Generate JWT Secret

Open terminal and run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

You'll see output like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

Copy this value - you'll use it as `JWT_SECRET`

---

## Step 7: Set Environment Variables

Run each command separately:

### Command 1: Database URL
```bash
vercel env add DATABASE_URL --name=ticket-apw-api
```

When prompted:
```
? Enter the plaintext value: › 
```

Paste your PostgreSQL connection string, press Enter

### Command 2: JWT Secret
```bash
vercel env add JWT_SECRET --name=ticket-apw-api
```

When prompted, paste the secret you generated, press Enter

### Command 3: CORS Origin
```bash
vercel env add CORS_ORIGIN --name=ticket-apw-api
```

When prompted, type:
```
https://ticket-apw.vercel.app
```

Press Enter

### Command 4: Node Environment
```bash
vercel env add NODE_ENV --name=ticket-apw-api
```

When prompted, type:
```
production
```

Press Enter

### Command 5: JWT Expiry
```bash
vercel env add JWT_EXPIRY --name=ticket-apw-api
```

When prompted, type:
```
7d
```

Press Enter

### Command 6: Bcrypt Rounds
```bash
vercel env add BCRYPT_ROUNDS --name=ticket-apw-api
```

When prompted, type:
```
10
```

Press Enter

---

## Step 8: Verify Environment Variables

Check all variables were set:

```bash
vercel env list --name=ticket-apw-api
```

You should see:
```
  DATABASE_URL     production, preview, development
  JWT_SECRET       production, preview, development
  CORS_ORIGIN      production, preview, development
  NODE_ENV         production, preview, development
  JWT_EXPIRY       production, preview, development
  BCRYPT_ROUNDS    production, preview, development
```

---

## Step 9: Redeploy with Environment Variables

```bash
vercel deploy --prod --name=ticket-apw-api
```

Wait for deployment to complete (30 seconds - 1 minute)

You'll see:
```
✓ Production: https://ticket-apw-api.vercel.app [ready]
```

---

## Step 10: Test Backend is Live

Open terminal and run:

```bash
curl https://ticket-apw-api.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

If you see this, **backend is working!** ✅

---

## Step 11: Get Frontend Project Name

Go to https://vercel.com/dashboard

You'll see your projects listed. Find your frontend project (usually `ticket-apw`).

Note the name - you'll need it next.

---

## Step 12: Set Frontend API URL

In Vercel dashboard:

1. Click on your **frontend project** (ticket-apw or similar)
2. Click **Settings** (top menu)
3. Click **Environment Variables** (left menu)
4. Click **Add New**

Fill in:
- **Name**: `VITE_API_URL`
- **Value**: `https://ticket-apw-api.vercel.app`
- **Environments**: Check all 3 (Production, Preview, Development)

Click **Add** button

---

## Step 13: Redeploy Frontend

In Vercel dashboard:

1. Still in frontend project settings
2. Click **Deployments** (top menu)
3. Click latest deployment (top row)
4. Click **Redeploy** button (top right)
5. Confirm with **Redeploy**

Wait 1-2 minutes for deployment to complete.

You'll see:
```
✓ Production: https://ticket-apw.vercel.app [ready]
```

---

## Step 14: Test Full Integration

### Open Frontend
Go to https://ticket-apw.vercel.app

The page should load without errors.

### Check Network Tab
1. Press `F12` to open DevTools
2. Click **Network** tab
3. Try any action (login, load projects, etc.)
4. Look for API requests
5. Click on any request starting with `ticket-apw-api.vercel.app`
6. Check response status - should be 200 (not 404 or 500)

### Check Console
1. Still in DevTools
2. Click **Console** tab
3. Should be no red error messages
4. Look for success logs about API calls

---

## Step 15: Verify Logs

Check backend logs for any errors:

```bash
vercel logs --prod --name=ticket-apw-api
```

You should see:
- No error messages
- GET requests to `/api/*` endpoints
- Status 200 responses

---

## ✅ Complete!

Your backend is deployed!

**Your URLs:**
- Frontend: https://ticket-apw.vercel.app
- Backend: https://ticket-apw-api.vercel.app
- API: https://ticket-apw-api.vercel.app/api

**Test Health Endpoint:**
```bash
curl https://ticket-apw-api.vercel.app/api/health
```

---

## Troubleshooting

### Error: "Backend returns 404"
```bash
vercel logs --prod --name=ticket-apw-api
```
Check the logs for the actual error.

### Error: "CORS error in browser"
1. Double-check `CORS_ORIGIN` is exactly: `https://ticket-apw.vercel.app`
2. Redeploy backend: `vercel deploy --prod --name=ticket-apw-api`

### Error: "Database connection failed"
1. Verify `DATABASE_URL` is correct
2. Run: `vercel env list --name=ticket-apw-api`
3. Check value matches your database

### Error: "Frontend still calling wrong API"
1. Verify `VITE_API_URL` is set in frontend project
2. Clear browser cache (Ctrl+Shift+Delete)
3. Redeploy frontend from dashboard

---

## Going Forward

### Make Code Changes
```bash
git add .
git commit -m "your message"
git push origin main
```

Both projects auto-deploy! ✅

### View Logs
```bash
# Frontend logs
vercel logs --prod

# Backend logs
vercel logs --prod --name=ticket-apw-api
```

### Update Environment Variable
```bash
vercel env add VAR_NAME --name=ticket-apw-api
vercel deploy --prod --name=ticket-apw-api
```

---

## More Help

- Full guide: `VERCEL_BACKEND_SETUP_GUIDE.md`
- Checklist: `VERCEL_BACKEND_CHECKLIST.md`
- Vercel docs: https://vercel.com/docs

---

**Your backend is now live on Vercel!** 🎉
