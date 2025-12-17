# Quick Start - Expenses Feature

## What Was Fixed

The "Error fetching expenses" issue has been resolved. The system now has:

✅ Expenses database table with proper schema  
✅ Corrected API routes and endpoints  
✅ Server entry point for starting backend  
✅ Database migrations runner  
✅ Project name resolution in expense lists  

## Start Here

### 1. Run Database Migrations
```bash
node scripts/run-migrations.js
```
This creates the expenses table and any missing tables.

### 2. Start Both Backend & Frontend
```bash
npm run dev:all
```

Or start them separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

### 3. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Expenses endpoint: http://localhost:5000/api/expenses

## What's Available

### Expenses Page
- View all expenses with project names
- Filter by status (pending, approved, rejected)
- Filter by category (travel, food, accommodation, equipment, software, service, other)
- Create, edit, delete expenses
- Approve/reject pending expenses
- Export to CSV

### API Operations
- Create expense: `POST /api/expenses`
- Get expenses: `GET /api/expenses?status=pending&category=travel`
- Update expense: `PUT /api/expenses/{id}`
- Delete expense: `DELETE /api/expenses/{id}`
- Approve: `POST /api/expenses/{id}/approve`
- Reject: `POST /api/expenses/{id}/reject`

## Troubleshooting

**Still seeing "Error fetching expenses"?**
1. Check backend is running: Open http://localhost:5000/api/health in browser
2. Check migrations ran: `node scripts/run-migrations.js`
3. Check database connection in `server/.env` - is DATABASE_URL set?
4. Check browser console (F12) for network errors

**Need to reset everything?**
```bash
# Restart from scratch
node scripts/run-migrations.js
npm run server &
npm run dev
```

## Files Changed
- `server/expense-routes.js` - Fixed API routes
- `server/index.js` - Created server entry point
- `database/migrations/004-create-expenses-table.sql` - Created table
- `scripts/run-migrations.js` - Created migration runner
- `package.json` - Added new npm scripts

See `EXPENSES_FIX.md` for detailed technical information.
