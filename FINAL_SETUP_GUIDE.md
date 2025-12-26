# Final Setup Guide - Frontend & Backend

## 📁 Repository Structure

```
c:\Users\Jakgrits\
├── project-mgnt\          (Current - becoming FRONTEND)
│   ├── .env.local         ✅ Created (frontend config)
│   ├── .env               ✅ Created (backend config - copy to backend repo)
│   ├── src\               (React app)
│   ├── services\          (API services)
│   ├── package.json       (Frontend deps)
│   └── vite.config.ts
│
└── ticket-apw-backend\    (To be created or cloned - BACKEND)
    ├── .env               (Copy from project-mgnt\.env)
    ├── server\            (Express app)
    ├── api\               (Serverless functions)
    ├── prisma\            (Database schema)
    ├── package.json       (Backend deps)
    └── vercel.json
```

---

## 🚀 Setup Steps

### Step 1: Rename Current Repo (Optional but Recommended)

If `project-mgnt` is your frontend, rename it to `ticket-apw`:

```cmd
cd c:\Users\Jakgrits
ren project-mgnt ticket-apw
# or manually in Windows File Explorer
```

### Step 2: Create Backend Repository Directory

Create the backend directory:

```cmd
mkdir c:\Users\Jakgrits\ticket-apw-backend
cd c:\Users\Jakgrits\ticket-apw-backend
```

### Step 3: Copy Backend Configuration Files

Copy from frontend directory:

```cmd
# Copy .env file
copy c:\Users\Jakgrits\ticket-apw\.env .env

# Copy server files (if they exist in current location)
xcopy c:\Users\Jakgrits\ticket-apw\server . /E /I
xcopy c:\Users\Jakgrits\ticket-apw\api . /E /I
xcopy c:\Users\Jakgrits\ticket-apw\database . /E /I
xcopy c:\Users\Jakgrits\ticket-apw\prisma . /E /I
```

### Step 4: Create Backend package.json

Create file: `c:\Users\Jakgrits\ticket-apw-backend\package.json`

```json
{
  "name": "ticket-apw-backend",
  "version": "1.0.0",
  "description": "Backend API for Project Management System",
  "private": true,
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "build": "npm run prisma:generate",
    "test": "jest",
    "db:test": "node scripts/test-connection.js",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "prisma:generate": "prisma generate"
  },
  "dependencies": {
    "express": "^5.2.1",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "@prisma/client": "^5.22.0",
    "jsonwebtoken": "^9.0.3",
    "bcrypt": "^6.0.0",
    "helmet": "^8.1.0",
    "axios": "^1.13.2",
    "uuid": "^13.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.19.27",
    "nodemon": "^3.0.2",
    "prisma": "^5.9.1"
  }
}
```

### Step 5: Create Backend vercel.json

Create file: `c:\Users\Jakgrits\ticket-apw-backend\vercel.json`

```json
{
  "buildCommand": "npm install && npm run prisma:generate",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": null,
  "outputDirectory": null,
  "env": [
    "DATABASE_URL",
    "JWT_SECRET",
    "SESSION_SECRET",
    "NODE_ENV",
    "CORS_ORIGIN"
  ]
}
```

### Step 6: Install Backend Dependencies

```cmd
cd c:\Users\Jakgrits\ticket-apw-backend
npm install
```

### Step 7: Update Frontend .env.local

Verify frontend configuration at: `c:\Users\Jakgrits\ticket-apw\.env.local`

```env
VITE_API_URL=http://localhost:5000
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
NODE_ENV=development
```

### Step 8: Start Backend Service

```cmd
cd c:\Users\Jakgrits\ticket-apw-backend
npm run dev
```

**Expected Output**:
```
Server running on http://localhost:5000
✓ Database connected
✓ Routes initialized
```

### Step 9: Start Frontend Service (New Terminal)

```cmd
cd c:\Users\Jakgrits\ticket-apw
npm run dev
```

**Expected Output**:
```
➜ Local:   http://localhost:5173/
➜ press h to show help
```

### Step 10: Test in Browser

Open: **http://localhost:5173**

**Login Credentials**:
- Email: `admin@example.com`
- Password: `Change@123`

---

## 📋 Checklist

### Frontend (ticket-apw)
- [ ] Directory exists at: `c:\Users\Jakgrits\ticket-apw`
- [ ] `.env.local` file exists
- [ ] Contains: `VITE_API_URL=http://localhost:5000`
- [ ] `package.json` has frontend dependencies
- [ ] `.gitignore` protects `.env.local`

### Backend (ticket-apw-backend)
- [ ] Directory exists at: `c:\Users\Jakgrits\ticket-apw-backend`
- [ ] `.env` file exists (copied from frontend)
- [ ] `package.json` created with backend dependencies
- [ ] `vercel.json` created
- [ ] `server/` directory copied
- [ ] `prisma/` directory copied
- [ ] Dependencies installed: `npm install`
- [ ] `.gitignore` protects `.env`

### Services Running
- [ ] Backend starts: `npm run dev` from ticket-apw-backend
- [ ] Shows: "Server running on http://localhost:5000"
- [ ] Frontend starts: `npm run dev` from ticket-apw
- [ ] Shows: "http://localhost:5173"
- [ ] Browser loads without CORS errors
- [ ] Can login with admin@example.com / Change@123

---

## 🔧 Directory Structure After Setup

```
c:\Users\Jakgrits\ticket-apw\
├── src\
├── components\
├── services\
├── .env.local           ✅
├── .env                 (not used - only for reference)
├── package.json         (frontend)
├── vite.config.ts
├── tsconfig.json
└── ...

c:\Users\Jakgrits\ticket-apw-backend\
├── server\
│   ├── index.js
│   ├── app.js
│   ├── routes\
│   └── services\
├── api\
├── prisma\
│   └── schema.prisma
├── .env                 ✅
├── package.json         (backend)
├── vercel.json
└── ...
```

---

## 🚀 Running Both Services

### Terminal 1: Backend
```cmd
cd c:\Users\Jakgrits\ticket-apw-backend
npm run dev
```

### Terminal 2: Frontend
```cmd
cd c:\Users\Jakgrits\ticket-apw
npm run dev
```

### Browser
```
Open: http://localhost:5173
```

---

## 📊 Environment Variables

### Frontend (.env.local) at `ticket-apw`
```
VITE_API_URL=http://localhost:5000
```

### Backend (.env) at `ticket-apw-backend`
```
DATABASE_URL=postgresql://neondb_owner:...@...
JWT_SECRET=RNhJHmJdVlpPk9JAsJTB5HF/gFO9QncATl1nq89QDFw=
SESSION_SECRET=dUuzy9f9kJfJGSnb1ES3JrzeN9ef3BwuPlT4z4oM9AA=
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Change@123
```

---

## ⚠️ Important Notes

1. **Frontend repo** (ticket-apw):
   - Contains React application
   - Uses `.env.local` for configuration
   - Points to backend via `VITE_API_URL`

2. **Backend repo** (ticket-apw-backend):
   - Contains Express server
   - Uses `.env` for configuration
   - Connects to Neon database
   - Serves API endpoints

3. **Database**:
   - Neon (cloud-hosted PostgreSQL)
   - Shared connection string in `.env`

4. **Security**:
   - Both `.env` files are in `.gitignore`
   - Never commit secrets
   - Different secrets for production

---

## 🆘 Troubleshooting

### Backend fails to start
```
Error: Cannot find module 'express'
→ Run: npm install
```

### CORS error in browser
```
Error: CORS policy
→ Check: CORS_ORIGIN in .env matches http://localhost:5173
→ Restart backend: npm run dev
```

### Database connection error
```
Error: connect ECONNREFUSED
→ Check: DATABASE_URL in .env
→ Verify: Neon database is accessible
```

### Frontend can't reach backend
```
Error: API call fails
→ Check: VITE_API_URL in .env.local = http://localhost:5000
→ Check: Backend is running on port 5000
→ Check: DevTools Network tab for actual request URL
```

---

## 📞 Quick Commands

```cmd
# Backend
cd c:\Users\Jakgrits\ticket-apw-backend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run db:studio    # Open database UI

# Frontend
cd c:\Users\Jakgrits\ticket-apw
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production

# Verify setup
node validate-env.js # Check environment configuration
```

---

## ✅ Success Criteria

Your setup is successful when:

✅ Backend starts on http://localhost:5000
✅ Frontend starts on http://localhost:5173
✅ Browser shows application
✅ Can login with admin@example.com / Change@123
✅ Projects/dashboard loads
✅ No CORS errors in console
✅ API calls work correctly

---

## 🎯 Next: Production Deployment

When ready to deploy to Vercel:

1. **Backend to Vercel**:
   - Deploy `ticket-apw-backend`
   - Set environment variables
   - Note production URL

2. **Frontend to Vercel**:
   - Deploy `ticket-apw`
   - Set `VITE_API_URL` to production backend URL

See `MASTER_ENV_SETUP.md` for detailed production setup.

---

**Status**: Ready to start both services

**Next Action**: Follow steps 1-10 above to set up both repositories
