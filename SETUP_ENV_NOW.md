# 🚀 SETUP ENVIRONMENT VARIABLES NOW

**Everything is ready. Pick your method and get started.**

---

## ⚡ Fastest Way (2 minutes)

### macOS/Linux
```bash
chmod +x setup-env.sh
./setup-env.sh
```

### Windows
```cmd
setup-env.bat
```

That's it! The script will:
- ✓ Ask you questions
- ✓ Generate secrets
- ✓ Create .env files
- ✓ Done!

---

## 📋 Quickest Way (Copy/Paste)

### Frontend
```bash
cp .env.local.example .env.local
# Edit: Change VITE_API_URL if needed
```

### Backend
```bash
cp .env.backend.example .env
# Edit: Set DATABASE_URL and passwords
```

---

## ✅ Verify It Works

```bash
node validate-env.js
```

Should show:
```
✓ All environment variables are properly configured!
```

---

## 🧪 Test It Works

### Terminal 1: Backend
```bash
cd ~/ticket-apw-backend
npm run dev
# Should show: 🚀 Server running on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd ~/ticket-apw
npm run dev
# Should show: ➜ Local: http://localhost:5173/
```

### Browser
Open: `http://localhost:5173`
- Should load without errors
- Should login successfully

---

## 📚 Need Help?

| Question | File |
|----------|------|
| "Show me all options" | `MASTER_ENV_SETUP.md` |
| "Quick reference" | `ENV_QUICK_SETUP.md` |
| "Detailed guide" | `ENV_SETUP_GUIDE.md` |
| "What's missing?" | Run `validate-env.js` |

---

## 🎯 Your Next 3 Steps

```
1. Choose method (script, copy, or manual)
   ↓
2. Follow the method (2-10 minutes)
   ↓
3. Run: node validate-env.js
   ✓ SUCCESS!
```

---

## 🔑 What You Need to Know

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
```
That's the minimum. Just one variable!

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=[32+ random chars]
SESSION_SECRET=[32+ random chars]  
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_password
```
6 required variables.

---

## 💡 Pro Tips

**Generate secrets fast**:
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

**Create database quick**:
```bash
# macOS
brew install postgresql
brew services start postgresql
createdb ticket_apw

# Windows: Download from postgresql.org

# Docker
docker-compose up -d
```

---

## ⚠️ Important

✅ Add `.env` to `.gitignore`
```
.env
.env.local
.env.production
```

❌ Never commit env files
❌ Never share secrets
❌ Never use weak passwords

---

## 📞 Still Stuck?

1. Read: `MASTER_ENV_SETUP.md`
2. Check: `ENV_SETUP_GUIDE.md`
3. Verify: `node validate-env.js`

---

## 🎉 What You'll Get

After setup, you'll have:

✓ Frontend connecting to backend  
✓ Database configured and running  
✓ Authentication working  
✓ All environment variables set  
✓ Ready to start development!

---

## 🚀 Ready? Start Now!

### Pick one:

**Option 1: Let the script do it** (Easiest)
```bash
./setup-env.sh          # macOS/Linux
setup-env.bat           # Windows
```

**Option 2: Copy templates** (Quick)
```bash
cp .env.local.example .env.local
cp .env.backend.example .env
```

**Option 3: Read first** (Detailed)
```bash
read MASTER_ENV_SETUP.md
```

---

## ✨ That's It!

No complex setup. Just:
1. Run script OR copy files
2. Edit with your values
3. Run `validate-env.js`
4. Start developing

**Time: 5 minutes**
**Difficulty: Easy**

---

**LET'S GO! 🎯**
