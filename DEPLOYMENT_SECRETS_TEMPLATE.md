# Deployment Secrets Template

**⚠️ IMPORTANT: Keep this file PRIVATE. Never commit to git.**

Fill in your actual values below, then use these commands:

```bash
flyctl secrets set DATABASE_URL="your-value-here"
flyctl secrets set JWT_SECRET="your-value-here"
# etc...
```

---

## Your Values (KEEP PRIVATE!)

### Database Connection
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

**From Supabase:**
- Go to Project Settings → Database → Connection String
- Copy the "Session" connection string
- Replace `[YOUR-PASSWORD]` with your actual password

```
# Example:
DATABASE_URL=postgresql://postgres:abc123@db.abcd1234.supabase.co:5432/postgres
```

### JWT Secret (Generate Random)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then use output:
```
JWT_SECRET=your-32-character-hex-string-here
```

### Frontend URL (from Vercel)
```
CORS_ORIGIN=https://ticket-apw.vercel.app
```

---

## All Secrets Command

Copy and run this (update values first):

```bash
flyctl secrets set \
  DATABASE_URL="postgresql://user:pass@host:5432/db" \
  JWT_SECRET="your-secret-key" \
  JWT_EXPIRY="7d" \
  BCRYPT_ROUNDS="10" \
  CORS_ORIGIN="https://ticket-apw.vercel.app" \
  NODE_ENV="production"
```

---

## Verify Secrets Are Set

```bash
flyctl secrets list
```

Should show all 6 secrets.

---

## Change Later

Update any secret anytime:
```bash
flyctl secrets set VAR="new-value"
flyctl restart  # Restart app for changes to take effect
```

---

## ✅ Checklist

- [ ] DATABASE_URL obtained from Supabase/Railway/Local
- [ ] JWT_SECRET generated (use random 32-char hex)
- [ ] CORS_ORIGIN is your Vercel frontend URL
- [ ] All 6 secrets set via `flyctl secrets set`
- [ ] Verified with `flyctl secrets list`
- [ ] App is running: `flyctl status`

---

## If You Lose Your Values

**Database URL (Supabase):**
1. Go to https://supabase.com
2. Select your project
3. Settings → Database → Connection string (Session)

**JWT Secret:**
- Can be changed anytime
- Generate new: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Deployed secrets:**
```bash
flyctl secrets list  # View what's currently set
```

---

**Remember: Never share your JWT_SECRET or DATABASE_URL publicly!**
