# Environment Variables Setup - Complete

All environment variable configuration files and guides have been created.

## 📁 Files Created (8 Total)

### Configuration Examples (2 files)
1. **`.env.local.example`** - Frontend template
2. **`.env.backend.example`** - Backend template

### Setup Scripts (2 files)
3. **`setup-env.sh`** - Interactive setup (macOS/Linux)
4. **`setup-env.bat`** - Interactive setup (Windows)

### Validation Tool (1 file)
5. **`validate-env.js`** - Verify configuration

### Documentation (3 files)
6. **`MASTER_ENV_SETUP.md`** - Complete setup guide ⭐ START HERE
7. **`ENV_SETUP_GUIDE.md`** - Detailed explanations
8. **`ENV_QUICK_SETUP.md`** - Quick reference

## 🚀 Quick Start (Choose One)

### Method 1: Interactive Setup (Easiest) ⭐

```bash
# macOS/Linux
chmod +x setup-env.sh
./setup-env.sh

# Windows
setup-env.bat
```

The script guides you through:
- ✓ Frontend configuration
- ✓ Backend configuration
- ✓ Database setup
- ✓ Secret generation
- ✓ Automatic file creation

### Method 2: Copy & Edit

```bash
# Frontend
cp .env.local.example .env.local
# Edit with your values

# Backend
cp .env.backend.example .env
# Edit with your values
```

### Method 3: Manual

Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000
```

Create `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ticket_apw
JWT_SECRET=[32+ character random string]
SESSION_SECRET=[32+ character random string]
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Change@123
```

## ✅ Verify Setup

### Check With Script
```bash
node validate-env.js
```

Shows:
- ✓ Which variables are set
- ✗ Which are missing
- ⚠ Warnings (weak secrets, etc)
- 💡 Suggestions to fix

### Manual Check
```bash
# Frontend
cat .env.local

# Backend
cat .env | grep -v PASSWORD
```

### Test Services
```bash
# Terminal 1: Backend
cd ~/ticket-apw-backend
npm run dev
# Should show: 🚀 Server running on http://localhost:5000

# Terminal 2: Frontend
cd ~/ticket-apw
npm run dev
# Should show: ➜ Local: http://localhost:5173/

# Browser: http://localhost:5173
# Should login successfully
```

## 📋 What Goes Where

### Frontend (.env.local)
```env
# REQUIRED
VITE_API_URL=http://localhost:5000

# OPTIONAL
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_SUPABASE_URL=[if using Supabase]
```

### Backend (.env)
```env
# REQUIRED
DATABASE_URL=postgresql://...
JWT_SECRET=[32+ random chars]
SESSION_SECRET=[32+ random chars]
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=[your password]

# OPTIONAL
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
ENABLE_ANALYTICS=false
```

## 🔐 Security Notes

**Never**:
- ❌ Commit `.env` to git
- ❌ Share secrets in chat
- ❌ Use weak passwords
- ❌ Store secrets in code

**Always**:
- ✅ Add `.env` to `.gitignore`
- ✅ Generate random secrets
- ✅ Use 32+ character keys
- ✅ Different secrets per environment
- ✅ Rotate secrets periodically

## 📚 Documentation Map

| Need | File |
|------|------|
| Start here | **MASTER_ENV_SETUP.md** |
| Quick reference | **ENV_QUICK_SETUP.md** |
| Detailed guide | **ENV_SETUP_GUIDE.md** |
| Check variables | Run `validate-env.js` |

## 🎯 Next Steps

### 1. Choose Setup Method
- **Easiest**: Use `setup-env.sh` or `setup-env.bat`
- **Manual**: Copy examples and edit
- **Quick**: Manual create files

### 2. Configure Frontend
```bash
cd ~/ticket-apw
cp .env.local.example .env.local
# Set VITE_API_URL
```

### 3. Configure Backend
```bash
cd ~/ticket-apw-backend
cp .env.backend.example .env
# Set all required variables
```

### 4. Verify
```bash
node validate-env.js
```

### 5. Test
```bash
# Terminal 1
npm run dev     # Backend

# Terminal 2
npm run dev     # Frontend

# Browser
http://localhost:5173   # Should work!
```

## 🔧 For Production

Before deploying to Vercel:

1. **Deploy Backend**
   ```bash
   cd ~/ticket-apw-backend
   vercel deploy --prod
   ```

2. **Set Backend Env Vars** (Vercel Dashboard)
   ```
   DATABASE_URL = [production database]
   JWT_SECRET = [strong random key]
   SESSION_SECRET = [strong random key]
   CORS_ORIGIN = https://ticket-apw.vercel.app
   ```

3. **Redeploy**
   ```bash
   vercel deploy --prod
   ```

4. **Get Backend URL**
   - Note: `https://ticket-apw-backend.vercel.app`

5. **Deploy Frontend**
   ```bash
   cd ~/ticket-apw
   vercel deploy --prod
   ```

6. **Set Frontend Env Vars** (Vercel Dashboard)
   ```
   VITE_API_URL = https://ticket-apw-backend.vercel.app
   ```

7. **Redeploy**
   ```bash
   vercel deploy --prod
   ```

## 📖 Documentation Structure

```
.env configuration files
├── Templates
│   ├── .env.local.example (Frontend)
│   └── .env.backend.example (Backend)
├── Setup Scripts
│   ├── setup-env.sh (macOS/Linux)
│   ├── setup-env.bat (Windows)
│   └── validate-env.js (Verification)
└── Guides
    ├── MASTER_ENV_SETUP.md (Start here)
    ├── ENV_SETUP_GUIDE.md (Details)
    └── ENV_QUICK_SETUP.md (Quick ref)
```

## ✨ Key Features

### Interactive Script
- Guides you through setup
- Generates random secrets
- Creates files automatically
- Hides sensitive values

### Validation Tool
- Checks required variables
- Validates formats
- Warns about weak secrets
- Provides fixes

### Documentation
- Step-by-step instructions
- Examples for all options
- Database setup guides
- Troubleshooting section

## 🎓 Three Ways to Set Up

| Method | Time | Effort | Best For |
|--------|------|--------|----------|
| **Interactive Script** | 2 min | None | First time setup |
| **Copy Examples** | 5 min | Low | Manual control |
| **Manual Entry** | 10 min | Medium | Customization |

All three result in the same configuration.

## 💻 Example Outputs

### After Running Interactive Setup

```bash
$ ./setup-env.sh

==========================================
  Environment Variables Setup Script
==========================================

Select setup option:
1) Setup Frontend (.env.local)
2) Setup Backend (.env)
3) Setup Both
...
```

### After Validation

```bash
$ node validate-env.js

✓ Frontend (.env.local) exists
✓ VITE_API_URL = http://localhost:5000
✓ VITE_API_URL is valid URL format

✓ Backend (.env) exists
✓ NODE_ENV = development
✓ DATABASE_URL = postgresql://...
✓ JWT_SECRET length: 44 chars (good)
✓ SESSION_SECRET length: 44 chars (good)
✓ CORS_ORIGIN is valid URL

✓ All environment variables are properly configured!

You can now run:
  npm run dev          # Frontend
  npm run dev          # Backend
```

## 🚦 Status

| Component | Status | Next |
|-----------|--------|------|
| Setup scripts | ✅ Ready | Run `./setup-env.sh` |
| Examples | ✅ Ready | Copy to .env.local/.env |
| Validation | ✅ Ready | Run `validate-env.js` |
| Documentation | ✅ Complete | Read `MASTER_ENV_SETUP.md` |

## 🎯 You're Ready!

Everything is set up. Choose one method:

1. **Run script**: `./setup-env.sh` or `setup-env.bat`
2. **Copy examples**: `cp .env.*.example .env*`
3. **Read guide**: `MASTER_ENV_SETUP.md`

Then verify: `node validate-env.js`

Then test: `npm run dev` (both repos)

---

## Quick Links

- **Start Here**: `MASTER_ENV_SETUP.md`
- **Quick Ref**: `ENV_QUICK_SETUP.md`
- **Details**: `ENV_SETUP_GUIDE.md`
- **Examples**: `.env.local.example`, `.env.backend.example`
- **Validate**: `node validate-env.js`

---

**Everything is ready. Let's set up your environment! 🚀**
