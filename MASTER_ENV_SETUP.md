# Master Environment Variables Setup Guide

Complete end-to-end guide for setting up environment variables for frontend and backend repositories.

## Overview

You have 3 ways to set up environment variables:

1. **Interactive Script** (Recommended) - Guided setup
2. **Copy Examples** - Manual setup from templates
3. **Manual Entry** - Direct file editing

## Method 1: Interactive Setup Script (Easiest) ⭐

### For macOS/Linux

```bash
# Make script executable
chmod +x setup-env.sh

# Run interactive setup
./setup-env.sh
```

The script will:
- Ask for frontend and backend configuration
- Generate random secrets automatically
- Create `.env.local` and `.env` files
- Show what was configured

### For Windows

```cmd
# Run interactive setup
setup-env.bat
```

Same process as macOS/Linux but for Windows.

## Method 2: Copy & Edit Templates

### Frontend

```bash
# Copy template
cp .env.local.example .env.local

# Edit file
nano .env.local
# or
code .env.local
```

**Required settings**:
```env
VITE_API_URL=http://localhost:5000
```

### Backend

```bash
# Copy template
cp .env.backend.example .env

# Edit file
nano .env
# or
code .env
```

**Required settings**:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ticket_apw
JWT_SECRET=[generate with: openssl rand -base64 32]
SESSION_SECRET=[generate with: openssl rand -base64 32]
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Change@123
```

## Method 3: Manual Setup

### Step 1: Frontend (.env.local)

Create file: `~ticket-apw/.env.local`

```env
VITE_API_URL=http://localhost:5000
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
NODE_ENV=development
```

### Step 2: Backend (.env)

Create file: `~/ticket-apw-backend/.env`

```env
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ticket_apw
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticket_apw
DB_USER=postgres
DB_PASSWORD=your_password_here

# Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here_minimum_32_chars
SESSION_SECRET=your_session_secret_here_minimum_32_chars
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:5173

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Change@123
ADMIN_NAME="System Administrator"

# Optional
REDIS_URL=redis://localhost:6379
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=true
ENABLE_API_DOCS=true
LOG_LEVEL=info
```

## Verify Your Setup

### Option 1: Validation Script

```bash
node validate-env.js
```

Shows:
- ✓ Which variables are set
- ✗ Which are missing
- ⚠ Warnings about weak secrets
- Suggestions to fix issues

### Option 2: Manual Check

**Frontend**:
```bash
cd ~/ticket-apw
cat .env.local
# Should show: VITE_API_URL=http://localhost:5000
```

**Backend**:
```bash
cd ~/ticket-apw-backend
cat .env | grep -v PASSWORD
# Should show all required variables (minus passwords)
```

### Option 3: Test Services

```bash
# Terminal 1: Backend
cd ~/ticket-apw-backend
npm run dev
# Should see: 🚀 Server running on http://localhost:5000
# Should see: ✓ Database connected

# Terminal 2: Frontend
cd ~/ticket-apw
npm run dev
# Should see: ➜ Local: http://localhost:5173/
# Open browser: http://localhost:5173
# Should NOT see CORS errors
```

## Database Setup

### Option 1: PostgreSQL Locally

#### macOS
```bash
# Install
brew install postgresql

# Start service
brew services start postgresql

# Create database
createdb ticket_apw

# Set password for postgres user (if needed)
psql -U postgres -c "ALTER USER postgres PASSWORD 'your_password';"

# Test connection
psql postgresql://postgres:password@localhost:5432/ticket_apw
```

#### Windows
```cmd
# Download from: https://www.postgresql.org/download/windows/
# Install with default settings
# User: postgres
# Password: set during install

# Create database
createdb -U postgres ticket_apw

# Test connection
psql -U postgres -d ticket_apw
```

#### Docker
```bash
# Use docker-compose (if available)
docker-compose up -d

# Or use PostgreSQL image
docker run --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ticket_apw \
  -p 5432:5432 \
  -d postgres

# Connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/ticket_apw
```

### Option 2: Cloud Database

**Neon** (Recommended - Free tier)
```
1. Go to: https://neon.tech
2. Sign up
3. Create project
4. Copy connection string
5. Paste into DATABASE_URL in .env
```

**Railway** (Good free tier)
```
1. Go to: https://railway.app
2. Sign up with GitHub
3. Create new project
4. Add PostgreSQL
5. Copy connection string
```

**Vercel Postgres**
```
1. Go to: https://vercel.com
2. Create project or use existing
3. Add Postgres integration
4. Copy connection string
```

## Secrets & Keys

### Generating JWT_SECRET and SESSION_SECRET

**macOS/Linux**:
```bash
# Generate 32-byte random key in base64
openssl rand -base64 32

# Example output:
# aBcDeFgHiJkLmNoPqRsT1uVwXyZ2+a0b1C2d3E4f5G6h7I8j=
```

**Windows PowerShell**:
```powershell
# Generate random base64 string
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))

# Or use Node.js (requires Node installed)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Online Generator** (less secure):
```
1. Go to: https://www.uuidgenerator.net/random
2. Copy output (use multiple times for different secrets)
3. Or use: https://randomkeygen.com/
```

### Storing Secrets Securely

**Development** (local):
- Store in `.env` (local file only)
- Add `.env` to `.gitignore`
- Never commit `.env` file

**Production** (Vercel):
- Use Vercel Dashboard
- Settings → Environment Variables
- Vercel stores encrypted
- Never visible in logs

## Troubleshooting Setup

### Problem: "Cannot connect to database"

**Solution**:
```bash
# Test connection string
psql postgresql://postgres:password@localhost:5432/ticket_apw

# If fails:
# 1. Is PostgreSQL running? brew services list
# 2. Is database created? createdb ticket_apw
# 3. Is password correct? Try with postgres user
# 4. Is port open? netstat -an | grep 5432
```

### Problem: "CORS error when calling API"

**Solution**:
```
1. Check CORS_ORIGIN in backend .env
2. Should match frontend URL exactly:
   CORS_ORIGIN=http://localhost:5173
3. Restart backend: npm run dev
4. Restart frontend: npm run dev
5. Check DevTools → Network → API call headers
```

### Problem: "JWT Secret not working"

**Solution**:
```
1. Regenerate: openssl rand -base64 32
2. Update JWT_SECRET in .env
3. Restart backend: npm run dev
4. Clear browser cookies
5. Try login again
```

### Problem: ".env.local not loading in frontend"

**Solution**:
```
1. Filename MUST be: .env.local (not .env)
2. Variables MUST start with VITE_
3. Restart dev server: npm run dev
4. Check DevTools Console: console.log(import.meta.env.VITE_API_URL)
```

## Setup Checklist

### Frontend Setup
- [ ] `.env.local` file created
- [ ] `VITE_API_URL` set to correct backend URL
- [ ] File is in `.gitignore`
- [ ] File not committed to git
- [ ] Verified with: `npm run dev` starts without errors

### Backend Setup
- [ ] `.env` file created
- [ ] `DATABASE_URL` set correctly
- [ ] `JWT_SECRET` generated (32+ chars)
- [ ] `SESSION_SECRET` generated (32+ chars)
- [ ] `CORS_ORIGIN` matches frontend URL
- [ ] `ADMIN_EMAIL` and `ADMIN_PASSWORD` set
- [ ] File is in `.gitignore`
- [ ] File not committed to git
- [ ] Database is accessible: `npm run db:test`

### Testing
- [ ] Backend starts: `npm run dev` (no errors)
- [ ] Frontend starts: `npm run dev` (no errors)
- [ ] Can access frontend: http://localhost:5173
- [ ] Can access backend health: http://localhost:5000/health
- [ ] Can login successfully
- [ ] API calls work
- [ ] No CORS errors in console

### Production (Vercel)
- [ ] Backend deployed to Vercel
- [ ] All backend env vars set in Vercel
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_URL` set to production backend URL
- [ ] Frontend can call backend API
- [ ] No errors in Vercel logs

## Quick Reference

### Setup Methods

| Method | Time | Difficulty | Best For |
|--------|------|------------|----------|
| Interactive Script | 2 min | Easy | First time setup |
| Copy Examples | 5 min | Easy | Manual control |
| Manual Entry | 10 min | Medium | Custom setup |

### File Locations

| File | Path | Purpose |
|------|------|---------|
| Frontend example | `.env.local.example` | Template |
| Frontend actual | `.env.local` | Runtime (you create) |
| Backend example | `.env.backend.example` | Template |
| Backend actual | `.env` | Runtime (you create) |

### Key Environment Variables

| Variable | Frontend | Backend | Secret | Example |
|----------|----------|---------|--------|---------|
| VITE_API_URL | ✓ | | No | http://localhost:5000 |
| DATABASE_URL | | ✓ | Yes | postgresql://... |
| JWT_SECRET | | ✓ | Yes | [32+ random chars] |
| SESSION_SECRET | | ✓ | Yes | [32+ random chars] |
| CORS_ORIGIN | | ✓ | No | http://localhost:5173 |
| NODE_ENV | | ✓ | No | development |
| ADMIN_EMAIL | | ✓ | No | admin@example.com |
| ADMIN_PASSWORD | | ✓ | Yes | Change@123 |

## Next Steps

### 1. Run Setup (Choose One)
```bash
# Option A: Interactive (easiest)
./setup-env.sh              # macOS/Linux
setup-env.bat               # Windows

# Option B: Manual
cp .env.local.example .env.local
cp .env.backend.example .env
# Edit files with your values

# Option C: All at once
node validate-env.js        # Check what's missing
```

### 2. Verify Setup
```bash
node validate-env.js
# Should show: ✓ All environment variables are properly configured!
```

### 3. Start Development
```bash
# Terminal 1: Backend
cd ~/ticket-apw-backend
npm run dev

# Terminal 2: Frontend
cd ~/ticket-apw
npm run dev

# Browser: http://localhost:5173
```

### 4. Test in Browser
- Visit http://localhost:5173
- Try to login
- Check DevTools → Network → API calls
- Should work without CORS errors

## Support Resources

| Topic | File |
|-------|------|
| Quick Setup | `ENV_QUICK_SETUP.md` |
| Detailed Guide | `ENV_SETUP_GUIDE.md` |
| Validation | `validate-env.js` |
| Examples | `.env.local.example`, `.env.backend.example` |

---

**Status**: Ready to set up environment variables  
**Time Estimate**: 5-10 minutes  
**Difficulty**: Easy (script does most work)

**Choose a method above and get started! 🚀**
