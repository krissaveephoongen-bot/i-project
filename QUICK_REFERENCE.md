# Quick Reference Guide

## 🚀 Quick Start

### View All Improvements
1. Check **IMPROVEMENTS_SUMMARY.md** - Overall changes
2. Check **IMPLEMENTATION_GUIDE.md** - Code patterns
3. Check **PAGES_REWRITE.md** - Page migrations

### Run Development
```bash
npm run dev          # Start frontend on :3000
npm run dev:backend  # Start backend on :3001
npm run dev:all      # Start both
```

### Test Changes
```bash
npm run test:e2e:headed  # Run E2E tests visually
npm run test:unit        # Run unit tests
```

---

## 📋 Files Overview

| File | Purpose | Action |
|------|---------|--------|
| `AGENTS.md` | Dev guidelines | Reference |
| `IMPROVEMENTS_SUMMARY.md` | Overall changes | Read first |
| `IMPLEMENTATION_GUIDE.md` | Code patterns | Use as template |
| `PAGES_REWRITE.md` | Migration guide | Before deploying |
| `QUICK_REFERENCE.md` | This file | Quick lookup |

---

## 📍 New Pages Location

```
✅ Reports Pages
   next-app/app/reports/
   ├── financial/page.tsx
   ├── resources/page.tsx
   ├── projects/page.tsx
   ├── insights/page.tsx
   ├── utilization/page.tsx
   └── hours/page.tsx

✅ Rewritten Pages (New Versions)
   next-app/app/timesheet/page-new.tsx  → Ready to deploy
   next-app/app/expenses/page-new.tsx   → Ready to deploy
```

---

## 🔄 Data Flow

### Reports
```
User Request
    ↓
Page (next-app/app/reports/*)
    ↓
Fetch: /api/reports/{type}
    ↓
Supabase DB
    ↓
KPI Cards + Charts
    ↓
Display to User
```

### Timesheet
```
User Request
    ↓
Page (timesheet/page.tsx)
    ↓
Fetch: /api/timesheet/entries
    ↓
Display List
    ↓
User Action (Add/Edit/Delete/Submit)
    ↓
POST/PUT/DELETE to /api/timesheet/entries
    ↓
Update Display
```

### Expenses
```
User Request
    ↓
Page (expenses/page.tsx)
    ↓
Fetch: /api/expenses
    ↓
Display List + KPIs
    ↓
User Action (Add/Edit/Delete)
    ↓
POST/PUT/DELETE to /api/expenses
    ↓
Update Display
```

---

## 🎯 Common Tasks

### View Financial Report
1. Go to `/reports`
2. Click on Financial tab OR
3. Go directly to `/reports/financial`

### Add Timesheet Entry
1. Go to `/timesheet`
2. Click "Add Entry"
3. Select project & date
4. Enter hours
5. Click "Save"
6. Submit when ready

### Create Expense
1. Go to `/expenses`
2. Click "Add Expense"
3. Select project & date
4. Enter amount & category
5. Click "Save"

### Deploy New Timesheet Page
```bash
# Backup current
cp next-app/app/timesheet/page.tsx next-app/app/timesheet/page-backup.tsx

# Deploy new
cp next-app/app/timesheet/page-new.tsx next-app/app/timesheet/page.tsx

# Test
npm run dev
```

---

## 🔧 API Quick Reference

### Reports APIs
```
GET /api/reports/financial    → Budget data
GET /api/reports/resources    → Team utilization
GET /api/reports/projects     → Project metrics
GET /api/reports/insights     → Analytics
GET /api/reports/utilization  → Capacity
GET /api/reports/hours        → Time tracking
```

### Timesheet APIs
```
GET  /api/timesheet/entries          → List entries
POST /api/timesheet/entries          → Create
PUT  /api/timesheet/entries/{id}     → Update
DEL  /api/timesheet/entries/{id}     → Delete
POST /api/timesheet/submission       → Submit
```

### Expenses APIs
```
GET  /api/expenses                   → List expenses
POST /api/expenses                   → Create
PUT  /api/expenses                   → Update
DEL  /api/expenses?id={id}          → Delete
```

---

## 📊 Status Badges

### Timesheet Status
- **Draft** - Can edit/delete
- **Submitted** - Awaiting approval
- **Approved** - Finalized
- **Rejected** - Can resubmit

### Expense Status
- **Pending** - Can edit/delete
- **Approved** - Finalized
- **Rejected** - Can resubmit

---

## 🐛 Troubleshooting

### Page Not Loading
```
1. Check browser console (F12)
2. Check DevTools Network tab
3. Verify API is running
4. Check environment variables
5. Refresh page (Ctrl+Shift+R)
```

### Data Not Showing
```
1. Check if user is logged in
2. Verify API response in Network tab
3. Check browser console for errors
4. Verify userId is correct
5. Check database has data
```

### Button Not Working
```
1. Check console for errors
2. Verify API endpoint exists
3. Check request payload
4. Verify authentication
5. Try refresh
```

### Slow Page Loading
```
1. Check Network tab for slow requests
2. Verify parallel API calls
3. Check browser DevTools Performance
4. Clear browser cache
5. Restart dev server
```

---

## 📱 Mobile Testing

### Test on Mobile
```bash
# Get local IP
ipconfig getifaddr en0  # macOS
hostname -I             # Linux

# Visit from mobile
http://{your-ip}:3000
```

### Common Issues
- ❌ Modal too wide → Check responsive classes
- ❌ Text too small → Check font sizes
- ❌ Buttons not clickable → Check touch targets
- ❌ Table horizontal scroll → Check overflow handling

---

## 🎨 Theme & Colors

### Status Colors
| Status | Color | Hex |
|--------|-------|-----|
| Draft | Slate | #64748b |
| Submitted | Yellow | #eab308 |
| Approved | Green | #22c55e |
| Rejected | Red | #ef4444 |
| Pending | Yellow | #eab308 |

### Component Colors
| Component | Color | Usage |
|-----------|-------|-------|
| Primary | Blue | Buttons |
| Success | Green | Success msgs |
| Warning | Yellow | Warnings |
| Error | Red | Errors |
| Info | Slate | Info msgs |

---

## 📝 Code Snippets

### Fetch with Error Handling
```typescript
try {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  setData(Array.isArray(data) ? data : []);
} catch (e: any) {
  console.error('Error:', e);
  setError(e?.message || 'Failed to load');
  toast.error(e?.message);
} finally {
  setLoading(false);
}
```

### State + Computed Value
```typescript
const [entries, setEntries] = useState<Entry[]>([]);

const total = useMemo(() => {
  return entries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
}, [entries]);
```

### Modal Handling
```typescript
const [modalOpen, setModalOpen] = useState(false);

return (
  <>
    <button onClick={() => setModalOpen(true)}>Open</button>
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent>
        {/* Form */}
      </DialogContent>
    </Dialog>
  </>
);
```

---

## ✅ Pre-Deployment Checklist

- [ ] All pages load without errors
- [ ] Network requests show in DevTools
- [ ] API responses are correct
- [ ] Error handling works
- [ ] Loading states appear
- [ ] CRUD operations work
- [ ] Mobile responsive
- [ ] Print layout looks good
- [ ] Console has no errors
- [ ] Performance acceptable

---

## 🔗 Resources

| Resource | Link |
|----------|------|
| React Docs | https://react.dev |
| TypeScript | https://www.typescriptlang.org |
| Next.js | https://nextjs.org |
| Shadcn UI | https://ui.shadcn.com |
| Tailwind CSS | https://tailwindcss.com |

---

## 📞 Quick Help

**Q: How do I run the project?**
A: `npm run dev:all` starts both frontend and backend

**Q: Where are the report pages?**
A: In `next-app/app/reports/` - each subfolder has its own page

**Q: When should I deploy new timesheet page?**
A: After testing thoroughly - see PAGES_REWRITE.md

**Q: How do I revert changes?**
A: Backup files are in `*-backup.tsx` or `*-old.tsx`

**Q: Where's the API documentation?**
A: Check backend routes in `backend/src/routes/`

---

**Last Updated:** February 14, 2026
**Version:** 1.0
