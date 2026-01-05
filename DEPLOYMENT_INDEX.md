# Deployment Index - Complete Guide

Everything you need to deploy your backend to Vercel.

---

## 🚀 Start Here

**First time deploying?** Start with one of these:

1. **FASTEST**: Read [`DEPLOYMENT_QUICK_REFERENCE.txt`](DEPLOYMENT_QUICK_REFERENCE.txt) (2 min)
   - All commands in one place
   - Quick checklist format

2. **RECOMMENDED**: Follow [`VERCEL_DEPLOYMENT_STEPS.md`](VERCEL_DEPLOYMENT_STEPS.md) (10 min)
   - Exact step-by-step instructions
   - Best for first-time deployment
   - ⭐ **START HERE IF UNSURE**

3. **COMPREHENSIVE**: Read [`BACKEND_DEPLOYMENT_README.md`](BACKEND_DEPLOYMENT_README.md) (5 min)
   - Overview of entire process
   - Context and architecture

---

## 📚 Complete Documentation

| Document | Length | Purpose | Best For |
|----------|--------|---------|----------|
| **[VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)** ⭐ | 10 min | Step-by-step commands | First-time deployment |
| **[VERCEL_BACKEND_CHECKLIST.md](VERCEL_BACKEND_CHECKLIST.md)** | 5 min | 15-item checklist | Tracking progress |
| **[VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md)** | 20 min | Detailed technical guide | Troubleshooting |
| **[VERCEL_BACKEND_SUMMARY.md](VERCEL_BACKEND_SUMMARY.md)** | 10 min | Quick reference | Quick lookup |
| **[VERCEL_BACKEND_DEPLOYMENT.md](VERCEL_BACKEND_DEPLOYMENT.md)** | 15 min | Architecture & options | Understanding alternatives |
| **[BACKEND_DEPLOYMENT_README.md](BACKEND_DEPLOYMENT_README.md)** | 5 min | Process overview | Getting context |
| **[DEPLOYMENT_QUICK_REFERENCE.txt](DEPLOYMENT_QUICK_REFERENCE.txt)** | 2 min | Commands cheat sheet | Quick reference |
| **[DEPLOYMENT_SECRETS_TEMPLATE.md](DEPLOYMENT_SECRETS_TEMPLATE.md)** | 3 min | Secret management | Keeping passwords safe |

---

## 🎯 Quick Navigation

### By Task

**I want to deploy right now**
→ [VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)

**I'm stuck and need help**
→ [VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md#troubleshooting)

**I need a quick checklist**
→ [VERCEL_BACKEND_CHECKLIST.md](VERCEL_BACKEND_CHECKLIST.md)

**I want to understand the architecture**
→ [VERCEL_BACKEND_DEPLOYMENT.md](VERCEL_BACKEND_DEPLOYMENT.md)

**I need quick command reference**
→ [DEPLOYMENT_QUICK_REFERENCE.txt](DEPLOYMENT_QUICK_REFERENCE.txt)

**I want to see the big picture first**
→ [BACKEND_DEPLOYMENT_README.md](BACKEND_DEPLOYMENT_README.md)

---

## ✅ What's Ready to Deploy

✅ **Backend Code**
- Express server: `server/app.js`
- Routes: `server/routes/*.js` (4 files)
- Configuration: `vercel.json` (created)

✅ **Frontend Code**
- API config: `src/lib/api-config.ts` (updated)
- Points to: `https://ticket-apw-api.vercel.app`

✅ **Documentation**
- 10 comprehensive guides
- Quick reference card
- Step-by-step instructions

✅ **Dependencies**
- Express, CORS, Dotenv already in package.json
- No additional dependencies needed

---

## ⚡ 15-Minute Deployment Path

```
1. Read VERCEL_DEPLOYMENT_STEPS.md (5 min)
   ↓
2. Gather required values (5 min)
   - PostgreSQL URL
   - Generate JWT secret
   ↓
3. Run deployment commands (5 min)
   - Deploy backend
   - Set environment variables
   - Redeploy with variables
   ↓
4. Test (5 min)
   - curl health endpoint
   - Update frontend
   - Verify in browser
   ↓
5. Done! ✅ (14 minutes total)
```

---

## 📋 Required Values Checklist

Before deploying, gather these:

- [ ] **Database URL**: From Supabase/Railway project
- [ ] **JWT Secret**: Generate with command in guide
- [ ] **Frontend URL**: Your Vercel frontend domain

All detailed in [VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)

---

## 🔧 Files Created for Deployment

| File | Created | Purpose |
|------|---------|---------|
| `vercel.json` | ✅ | Backend deployment config |
| `src/lib/api-config.ts` | ✅ | Updated to use backend URL |
| `server/app.js` | ✅ | Ready to deploy |
| `VERCEL_DEPLOYMENT_STEPS.md` | ✅ | Main guide |
| `VERCEL_BACKEND_CHECKLIST.md` | ✅ | Progress tracker |
| `VERCEL_BACKEND_SETUP_GUIDE.md` | ✅ | Detailed reference |
| `DEPLOYMENT_QUICK_REFERENCE.txt` | ✅ | Commands cheat sheet |
| And 4 more... | ✅ | Various references |

---

## 📊 Architecture After Deployment

```
GitHub Repository (1)
├── Frontend code (src/)
├── Backend code (server/)
└── Single package.json

        ↓ git push origin main

Vercel Project 1: Frontend          Vercel Project 2: Backend
├── ticket-apw                     ├── ticket-apw-api
├── React + Vite                   ├── Express server
├── URL: ticket-apw.vercel.app    └── URL: ticket-apw-api.vercel.app

        ↓ (API calls)

Database (PostgreSQL)
├── Supabase or Railway
└── Shared by both projects
```

---

## 🔑 Key Environment Variables

These go on Vercel backend project (`ticket-apw-api`):

```
DATABASE_URL    = postgresql://...
JWT_SECRET      = random 32-char hex
CORS_ORIGIN     = https://ticket-apw.vercel.app
NODE_ENV        = production
JWT_EXPIRY      = 7d
BCRYPT_ROUNDS   = 10
```

And on Vercel frontend project (`ticket-apw`):

```
VITE_API_URL    = https://ticket-apw-api.vercel.app
```

---

## 🧪 Testing After Deployment

| Test | Command | Expected |
|------|---------|----------|
| Health check | `curl https://ticket-apw-api.vercel.app/api/health` | `{"status":"ok"}` |
| Frontend loads | Open `https://ticket-apw.vercel.app` | No errors |
| API calls | F12 → Network → make API call | `ticket-apw-api.vercel.app` domain |
| Logs | `vercel logs --prod --name=ticket-apw-api` | No errors |

All detailed in [VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)

---

## 🚨 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "command not found: vercel" | Install: `npm install -g vercel` |
| "not authenticated" | Login: `vercel login` |
| API returns 404 | Check logs: [VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md#troubleshooting) |
| CORS errors | See: [VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md#troubleshooting) |
| Database fails | See: [VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md#troubleshooting) |

Full troubleshooting in [VERCEL_BACKEND_SETUP_GUIDE.md](VERCEL_BACKEND_SETUP_GUIDE.md)

---

## 📞 After Deployment

### Make Code Changes
```bash
git add .
git commit -m "message"
git push origin main
# Both projects auto-deploy!
```

### View Logs
```bash
vercel logs --prod --name=ticket-apw-api
```

### Update Environment Variable
```bash
vercel env add VAR_NAME --name=ticket-apw-api
vercel deploy --prod --name=ticket-apw-api
```

See [VERCEL_BACKEND_SUMMARY.md](VERCEL_BACKEND_SUMMARY.md) for more commands

---

## 📅 Timeline

- **Setup**: ~2 minutes
- **Deployment**: ~3 minutes
- **Testing**: ~3 minutes
- **Frontend update**: ~2 minutes
- **Verification**: ~3 minutes

**Total**: ~15 minutes

---

## 💡 Pro Tips

1. **Keep passwords safe**
   - Use [DEPLOYMENT_SECRETS_TEMPLATE.md](DEPLOYMENT_SECRETS_TEMPLATE.md)
   - Don't commit `.env` file to git
   - Never share JWT_SECRET

2. **Track progress**
   - Use [VERCEL_BACKEND_CHECKLIST.md](VERCEL_BACKEND_CHECKLIST.md)
   - Check off each step
   - Easy to resume if interrupted

3. **Save environment variables**
   - Write them down in secure location
   - You'll need them later
   - Can retrieve from Vercel dashboard

4. **Test thoroughly**
   - Test health endpoint first
   - Check logs for errors
   - Test in browser with DevTools

---

## 🎓 Learning Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel CLI**: https://vercel.com/docs/cli
- **Express.js**: https://expressjs.com
- **Supabase**: https://supabase.com/docs

---

## ✨ What You Get After Deployment

✅ Frontend: `https://ticket-apw.vercel.app`
✅ Backend: `https://ticket-apw-api.vercel.app`
✅ API: `https://ticket-apw-api.vercel.app/api/*`
✅ Health: `https://ticket-apw-api.vercel.app/api/health`
✅ Auto-deploy on git push
✅ Free tier (no cost)
✅ No server management needed

---

## 🚀 Ready to Deploy?

**Pick your starting point:**

### Option 1: Quick Start (Recommended)
1. Read: [VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)
2. Follow each step
3. Test with curl

### Option 2: Guided Checklist
1. Read: [VERCEL_BACKEND_CHECKLIST.md](VERCEL_BACKEND_CHECKLIST.md)
2. Check off each item
3. Verify final tests

### Option 3: Full Context First
1. Read: [BACKEND_DEPLOYMENT_README.md](BACKEND_DEPLOYMENT_README.md)
2. Then: [VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)
3. Then: Test and verify

---

## 📝 Next Steps

1. ✅ Choose starting point above
2. ✅ Gather required values
3. ✅ Run deployment commands
4. ✅ Test with curl
5. ✅ Update frontend
6. ✅ Verify in browser
7. ✅ Done! 🎉

---

**Let's deploy!** 🚀

Start with: [VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)
