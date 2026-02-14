# Sidebar Navigation - Quick Reference

## 🎯 Quick Map

### ANALYTICS (Dashboard & Reports)
```
📊 Dashboard → /
📈 Reports → (submenu)
   ├─ Financial → /reports/financial
   ├─ Resources → /reports/resources
   ├─ Projects → /reports/projects
   ├─ Insights → /reports/insights
   ├─ Utilization → /reports/utilization
   └─ Hours → /reports/hours
```

### WORKSPACE (Main Work Area)
```
📁 Projects → /projects
   └─ Weekly Activities → /projects/weekly-activities

👥 Clients → /clients

✅ Tasks → /tasks

⏰ Timesheet → /timesheet

💰 Expenses → (submenu)
   ├─ All Expenses → /expenses
   ├─ Memo Expenses → /expenses/memo
   └─ Travel Expenses → /expenses/travel

💼 Sales → /sales

✔️ Approvals → (submenu)
   ├─ Timesheets → /approvals/timesheets
   └─ Expenses → /approvals/expenses

🤝 Stakeholders → /stakeholders

🔧 Resources → /resources
```

### ADMIN (Admin Only)
```
⚙️ Admin → (submenu)
   ├─ User Management → /admin/users
   ├─ System Health → /admin/health
   └─ Activity Logs → /admin/logs
```

### BOTTOM (All Users)
```
👤 Profile → /profile
❓ Help → /help
🚪 Logout
```

---

## 🔐 Access Control Matrix

| Feature | Employee | Manager | Admin |
|---------|----------|---------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Reports | ❌ | ✅ | ✅ |
| Projects | ✅ | ✅ | ✅ |
| Clients | ❌ | ✅ | ✅ |
| Tasks | ✅ | ✅ | ✅ |
| Timesheet | ✅ | ✅ | ✅ |
| Expenses | ✅ | ✅ | ✅ |
| Sales | ❌ | ✅ | ✅ |
| Approvals | ❌ | ✅ | ✅ |
| Stakeholders | ❌ | ✅ | ✅ |
| Resources | ❌ | ✅ | ✅ |
| Admin | ❌ | ❌ | ✅ |
| Profile | ✅ | ✅ | ✅ |
| Help | ✅ | ✅ | ✅ |

---

## 📱 Layout

```
┌─────────────────────────┐
│   I-PROJECT LOGO        │ 64px height
├─────────────────────────┤
│                         │
│  Navigation Sections    │
│  (scrollable)           │
│                         │
│  • ANALYTICS            │
│  • WORKSPACE            │
│  • ADMIN                │
│                         │
├─────────────────────────┤
│  Bottom Area            │
│  • Profile              │
│  • Help                 │
│  • User Card            │
│  • Logout               │
└─────────────────────────┘
  Width: 260px
  Position: Fixed Left
  Z-Index: 50
```

---

## 🎨 UI Elements

### Colors & States
- **Default Text:** muted-foreground
- **Hover Background:** bg-slate-50 (light mode) / bg-slate-800 (dark mode)
- **Active Item:** bg-blue-50, text-blue-600 (light) / bg-blue-900/20, text-blue-400 (dark)
- **Icons:** w-5 h-5, flex-shrink-0

### Typography
- **Item Font:** text-sm font-medium
- **Section Title:** text-xs font-semibold tracking-wider, uppercase
- **User Name:** text-sm font-medium
- **User Role:** text-xs text-muted-foreground

### Spacing
- **Section Padding:** px-4 py-2 per item
- **Section Gap:** mb-4 between sections
- **Icons-Text Gap:** gap-3
- **Bottom Area Padding:** p-4, space-y-2

---

## 🔄 Collapsible Items

Items with `children` array automatically become collapsible:

```
📊 Reports ▼  (chevron appears)
   ├─ Financial
   ├─ Resources
   ├─ Projects
   ├─ Insights
   ├─ Utilization
   └─ Hours
```

**Behavior:**
- Click parent to toggle expand/collapse
- Chevron rotates 180° when expanded
- Child items use indentation (pl-7)
- Child items smaller font (still text-sm)

---

## 📋 Sidebar Items List

### Total Items
- **Top-level items:** 14
- **Sub-items:** 16
- **Total navigable links:** 30

### Pages Accessible via Sidebar
✅ `/` - Dashboard
✅ `/reports/financial` - Financial Reports
✅ `/reports/resources` - Resource Reports
✅ `/reports/projects` - Project Reports
✅ `/reports/insights` - Insights
✅ `/reports/utilization` - Utilization
✅ `/reports/hours` - Hours Report
✅ `/projects` - Projects List
✅ `/projects/weekly-activities` - Weekly Activities
✅ `/clients` - Clients
✅ `/tasks` - Tasks
✅ `/timesheet` - Timesheet
✅ `/expenses` - All Expenses
✅ `/expenses/memo` - Memo Expenses
✅ `/expenses/travel` - Travel Expenses
✅ `/sales` - Sales
✅ `/approvals/timesheets` - Timesheet Approvals
✅ `/approvals/expenses` - Expense Approvals
✅ `/stakeholders` - Stakeholders
✅ `/resources` - Resources
✅ `/admin/users` - User Management
✅ `/admin/health` - System Health
✅ `/admin/logs` - Activity Logs
✅ `/profile` - Profile
✅ `/help` - Help

### Pages NOT in Sidebar (Direct URL Access Only)
- `/dashboard` - Dashboard (use `/` instead)
- `/reports` - Reports hub (access via Reports submenu)
- `/approval` - Legacy (use `/approvals` instead)
- `/staff` - Legacy auth page
- `/staff/login` - Legacy
- `/vendor` - Legacy
- `/vendor/login` - Legacy
- Project detail pages (`/projects/[id]/*`) - Accessed from list
- Task edit pages (`/projects/[id]/tasks/[taskId]/edit`) - Accessed from list
- Settings (`/settings`) - Use gear icon in user card

---

## 🚀 Adding New Navigation Items

### 1. Add Sidebar Entry
Edit `app/components/Sidebar.tsx`:

```typescript
{ 
  name: 'New Feature', 
  href: '/new-feature', 
  icon: IconName,
  roles: ['admin', 'manager', 'employee']
}
```

### 2. Add Translation Keys
Edit `app/lib/locales/th.json` and `en.json`:

```json
"navigation": {
  "newFeature": "คุณสมบัติใหม่"
}
```

### 3. Create Page File
Create `app/new-feature/page.tsx`

### 4. Test
- Check with different user roles
- Verify active state highlighting
- Test on mobile (if applicable)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Item not showing | Check `roles` array includes your role |
| Icon not displaying | Verify icon is imported from lucide-react |
| Wrong route | Double-check `href` matches actual page path |
| Translation missing | Add key to both `en.json` and `th.json` |
| Submenu not expanding | Ensure item has `children: [...]` array |
| Mobile overlap | Check sidebar width (should be 260px) |

---

**Version:** 1.0  
**Updated:** Feb 15, 2026  
**Maintained by:** Development Team
