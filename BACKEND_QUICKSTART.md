# Backend Server Quick Start

## What Changed

Your project now has a **separate Express backend** instead of serverless functions on Vercel:

| Before | Now |
|--------|-----|
| ❌ Vercel serverless `/api/[[...route]].js` | ✅ Express server on `localhost:3001` |
| ❌ Frontend API calls to `/api/*` | ✅ Frontend API calls to `http://localhost:3001/api/*` |
| ❌ Deployment issues with catch-all routes | ✅ Stable backend deployment on Fly.io/Railway |

---

## Quick Start (Local)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
Copy from `.env.example` and update with your actual values:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://...  # Your database URL
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### 3. Run Both Servers
```bash
npm run dev:all
```

This starts:
- **Frontend**: `http://localhost:5173` (Vite)
- **Backend**: `http://localhost:3001` (Express)

### 4. Test It Works
```bash
curl http://localhost:3001/api/health
# Response: {"status":"ok","message":"Server is running"}
```

---

## Run Servers Separately

**Frontend only:**
```bash
npm run dev
```

**Backend only:**
```bash
npm run dev:server
```

---

## Files Changed

✅ `server/app.js` - Now always starts the server (removed Vercel check)
✅ `src/lib/api-config.ts` - Points to `http://localhost:3001/api` in dev
✅ `package.json` - Added `dev:all` script and `concurrently` package

---

## Deployment

### Deploy Backend to Fly.io
1. Install Fly CLI: `npm install -g flyctl`
2. Run: `flyctl launch` (select "ticket-apw-api" as name)
3. Set environment: `flyctl secrets set DATABASE_URL="..." JWT_SECRET="..."`
4. Deploy: `flyctl deploy`

Your API URL: `https://ticket-apw-api.fly.dev/api`

### Deploy Frontend to Vercel
1. In Vercel dashboard, set: `VITE_API_URL=https://ticket-apw-api.fly.dev`
2. Push to GitHub, Vercel auto-deploys

---

## Common Issues

**API returns 404:**
- ✓ Is backend running? (`npm run dev:server`)
- ✓ Correct PORT in `.env`? (should be 3001)

**CORS errors:**
- ✓ Check `CORS_ORIGIN` matches frontend URL
- ✓ Backend must have `cors` middleware (already enabled)

**Database connection fails:**
- ✓ Is PostgreSQL running?
- ✓ Check `DATABASE_URL` in `.env`

---

See `DEPLOYMENT_SETUP.md` for full production setup.
