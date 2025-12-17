# Expenses Feature - Fix Summary

## Issues Identified & Fixed

### 1. Missing Database Table
**Problem**: The `expenses` table was not created in the database.

**Solution**: 
- Created migration file: `database/migrations/004-create-expenses-table.sql`
- Table includes all necessary columns: id, date, project_id, category, amount, description, user_id, user_name, status, is_deleted
- Includes proper indexes for performance optimization
- Soft delete support via `is_deleted` flag

**How to apply**:
```bash
node scripts/run-migrations.js
```

### 2. Incorrect API Route Paths
**Problem**: The expense routes had incorrect path definitions that didn't match how they were mounted.

**Solution**:
- Fixed all route definitions in `server/expense-routes.js`
- Changed from `/expenses` to `/` (since mounted at `/api/expenses`)
- Changed from `/expenses/:id` to `/:id`
- Changed from `/expenses/analytics/summary` to `/analytics/summary`

### 3. Missing Server Entry Point
**Problem**: There was no `server/index.js` file to start the Express server.

**Solution**:
- Created `server/index.js` that imports and starts the Express app
- Includes proper error handling for port conflicts
- Graceful shutdown handling for SIGTERM/SIGINT signals

### 4. Missing Project Name in Expense Response
**Problem**: Frontend expected a `project` field (name) but API only returned `project_id`.

**Solution**:
- Updated the GET /expenses query to LEFT JOIN with projects table
- Now returns both `project_id` and `project` (name) in the response
- Applied alias `e.*` and `p.name as project` for clarity

## How to Start the System

### Option 1: Development (Frontend + Backend)
```bash
npm run dev:all
```
This starts both the backend server (port 5000) and frontend (port 5173) concurrently.

### Option 2: Backend Only
```bash
npm run server
```
Starts only the Express backend on port 5000.

### Option 3: Frontend Only (Backend already running)
```bash
npm run dev
```
Starts only the Vite frontend on port 5173.

## Database Setup

Before starting the application, ensure:

1. **Database migrations are run**:
   ```bash
   node scripts/run-migrations.js
   ```

2. **Environment variables are set** in `server/.env`:
   - `DATABASE_URL` - PostgreSQL connection string
   - `PORT` - Server port (default: 5000)

## Testing the Expenses API

Once the server is running, test the expenses endpoint:

```bash
# Test all expenses
curl http://localhost:5000/api/expenses

# Test with filters
curl "http://localhost:5000/api/expenses?status=pending"
curl "http://localhost:5000/api/expenses?category=travel"
```

Or use the test script:
```bash
node scripts/test-expenses-api.js
```

## Files Modified

1. `server/expense-routes.js` - Fixed route paths and query
2. `server/app.js` - No changes needed (correct mounting)
3. `server/index.js` - **Created** - Server entry point
4. `package.json` - Added `server` and `dev:all` scripts
5. `database/migrations/004-create-expenses-table.sql` - **Created** - Table definition
6. `scripts/run-migrations.js` - **Created** - Migration runner

## Expenses Table Schema

```sql
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(100) PRIMARY KEY DEFAULT (UUID()),
  date DATE NOT NULL,
  project_id VARCHAR(100),
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  user_id VARCHAR(100),
  user_name VARCHAR(255) DEFAULT 'System User',
  status VARCHAR(50) DEFAULT 'pending',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Available Categories

- travel
- food
- accommodation
- equipment
- software
- service
- other

## Available Status Values

- pending
- approved
- rejected

## API Endpoints

All endpoints are prefixed with `/api/expenses`:

- `GET /` - List all expenses (with filters)
- `GET /:id` - Get single expense
- `POST /` - Create expense
- `PUT /:id` - Update expense
- `DELETE /:id` - Soft delete expense
- `GET /analytics/summary` - Get expense summary by category
- `POST /:id/approve` - Approve expense
- `POST /:id/reject` - Reject expense

## Frontend Integration

The Expenses page (`src/pages/Expenses.tsx`) now properly:
- Fetches expenses from the API
- Displays project names (via JOIN)
- Allows filtering by status, category, and project
- Supports CRUD operations
- Shows expense statistics

## Troubleshooting

### "Error fetching expenses" in the UI
1. Verify the backend server is running: `npm run server`
2. Check database connection: Database URL in `.env` is correct
3. Ensure migrations are applied: `node scripts/run-migrations.js`
4. Check browser console for network errors

### Database Connection Issues
1. Verify `DATABASE_URL` is set in `server/.env`
2. Test connection: `node scripts/test-connection.ts`
3. Check database is accessible from your network

### Port Already in Use
If port 5000 is in use:
1. Change port: `PORT=3000 npm run server`
2. Or kill the process using the port
