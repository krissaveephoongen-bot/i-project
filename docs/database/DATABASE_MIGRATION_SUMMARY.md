# Projects.tsx - Database Integration & Real Data Migration

## Summary of Changes

This document outlines all changes made to replace hardcoded/mock data with real database values in the Projects page and related services.

---

## Files Created

### 1. **src/services/customerService.ts** (NEW)
- Complete customer/client management service
- API methods: `getCustomers()`, `getCustomer()`, `createCustomer()`, `updateCustomer()`, `deleteCustomer()`
- Handles all customer-related API calls
- Type-safe with `Customer` interface

### 2. **server/customer-routes.js** (NEW)
- RESTful API endpoints for customer CRUD operations
- Base routes: `/api/customers`
- Endpoints:
  - `GET /api/customers` - List all customers with filtering
  - `GET /api/customers/:id` - Get single customer
  - `POST /api/customers` - Create new customer
  - `PUT /api/customers/:id` - Update customer
  - `DELETE /api/customers/:id` - Soft delete customer
- Full error handling and validation

---

## Files Modified

### 1. **src/pages/Projects.tsx**
#### Changes Made:
- **Removed hardcoded CLIENTS array** (lines 94-100)
  - Old: Static array with 5 hardcoded clients
  - New: Dynamic loading from database

- **Replaced with `useCustomers()` hook**
  - Fetches real customers from `/api/customers`
  - Integrates with React Query for caching and refetching

- **Updated form field mapping**
  - Changed from `clientId` to `customerId`
  - Customer selection now uses real database customers
  - Proper error handling and loading states

- **Fixed team members display**
  - Team members stored as comma-separated strings in database
  - Added parsing logic: `(project.team_members || '').split(',').filter(m => m.trim()).length`
  - Displays actual member count instead of placeholder

- **Updated project creation logic**
  - Now validates customer selection from real database
  - Properly maps customer object to project data
  - Sends structured data to `/api/projects` endpoint

- **Added charter API integration**
  - Charter now saves to database via `POST /api/projects/:id/charter`
  - Charter retrieval from database
  - Previously stored only in component state

- **Improved error handling**
  - Added customer loading error handling
  - Customer fetch failure messages
  - Network error detection for customer service

#### New Imports:
```typescript
import { customerService, type Customer } from '@/services/customerService';
```

#### New State Changes:
- Changed `newProject.clientId` → `newProject.customerId`
- Improved refetch logic to include `refetchCustomers`

---

### 2. **server/app.js**
#### Changes Made:
- **Added customer routes registration** (lines 33, 122-123)
  - Imported: `const customerRoutes = require('./customer-routes');`
  - Registered: `app.use('/api', customerRoutes);`

- **Maintains all existing routes** without disruption

---

### 3. **server/project-routes.js**
#### Changes Made:
- **Added Project Charter endpoints** (lines 743-873)

#### New Endpoints:

**POST `/api/projects/:id/charter`**
- Save/update project charter
- Request body:
  ```json
  {
    "projectObjective": "string",
    "businessCase": "string", 
    "successCriteria": "string",
    "scope": "string",
    "constraints": "string",
    "assumptions": "string",
    "risks": "string"
  }
  ```
- Validates required fields (Objective, Business Case, Success Criteria)
- Stores charter as JSON in database
- Handles fallback if charter column not available

**GET `/api/projects/:id/charter`**
- Retrieve project charter
- Response includes project ID, name, and charter data
- Returns null if no charter exists

---

## Database Structure

### Customers Table
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    type VARCHAR(50) DEFAULT 'private',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
```

### Projects Table (Enhanced)
```sql
ALTER TABLE projects ADD COLUMN charter JSONB;
-- Stores charter data as JSON
```

### Projects Schema Changes
- Projects now link to customers table
- Charter data stored as JSONB for flexibility
- All team_members stored as comma-separated strings (existing format maintained)

---

## Real Data Integration

### 1. **Customer Data**
- **Before**: Hardcoded 5-customer array in component
- **After**: Fetches from `/api/customers` at runtime
- **Benefits**:
  - Dynamic customer management
  - Real-time updates
  - No need to redeploy on customer changes
  - Supports unlimited customers

### 2. **Team Members**
- **Before**: Comma-separated strings (unchanged)
- **After**: Improved parsing and display
- **Parse Logic**: 
  ```typescript
  (project.team_members || '').split(',').filter(m => m.trim()).length
  ```

### 3. **Project Charter**
- **Before**: Stored only in component state (lost on refresh)
- **After**: Persisted in database as JSONB
- **Benefits**:
  - Data persistence
  - Audit trail
  - Multi-user access
  - API integration ready

---

## API Endpoints Summary

### Customers
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get single customer |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Projects (Updated)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project details |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/charter` | Save charter |
| GET | `/api/projects/:id/charter` | Get charter |

---

## Error Handling

### Customer Service Errors
```typescript
// Returns structured error response
{
  success: false,
  data: [],
  message: "Error description"
}
```

### Project Charter Validation
- Required fields: projectObjective, businessCase, successCriteria
- Minimum length: 10 characters
- All validations happen in component AND backend

---

## Migration Checklist

- [x] Create customer service
- [x] Create customer API routes
- [x] Register routes in app.js
- [x] Update Projects.tsx to use real customers
- [x] Add charter API endpoints
- [x] Add error handling for customer fetch
- [x] Fix team member display logic
- [x] Test customer filtering
- [x] Test project creation with real customers
- [x] Test charter save/load

---

## Testing Instructions

### 1. Test Customer Loading
```bash
# Verify customers load from database
curl http://localhost:5000/api/customers
```

### 2. Test Project Creation
- Navigate to Projects page
- Click "New Project"
- Verify customer dropdown shows real customers from database
- Create a project with a real customer

### 3. Test Charter
- Edit a project charter
- Save charter
- Refresh page
- Verify charter data persists

### 4. Test Project Filtering
- Filter by status
- Search by customer name
- Verify real customer names appear in results

---

## Performance Considerations

1. **React Query Caching**: Customers cached after first fetch
2. **Refetch Triggers**: Refetch on:
   - New project creation
   - Project updates
   - Manual refresh button click
3. **Lazy Loading**: Customers loaded only when dialog opens
4. **Pagination Ready**: API supports limit/offset for future large datasets

---

## Future Enhancements

1. **Customer Creation Modal**: Allow creating new customers from project form
2. **Customer Filtering**: Add advanced customer search and filtering
3. **Charter Versioning**: Track charter changes over time
4. **Bulk Operations**: Update multiple projects' charters
5. **Charter Templates**: Pre-defined charter templates
6. **Charter Approval Workflow**: Multi-step charter approval process

---

## Breaking Changes

**None** - All changes are additive. Existing functionality maintained.

---

## Rollback Plan

If needed to rollback:
1. Remove customer-routes.js import from app.js
2. Restore original Projects.tsx (hardcoded CLIENTS array)
3. Remove charter endpoints from project-routes.js
4. All data in database remains intact

---

## Support & Troubleshooting

### Issue: "Failed to fetch customers"
- Check if `/api/customers` endpoint is accessible
- Verify database connection
- Check server logs for errors

### Issue: "Charter not saving"
- Verify charter column exists in projects table
- Check project ID is valid
- Verify required fields are filled

### Issue: "Team member count incorrect"
- Verify team_members field format (comma-separated)
- Check for extra spaces in names
- Inspect API response data structure

---

**Last Updated**: 2025-12-17
**Status**: Production Ready
