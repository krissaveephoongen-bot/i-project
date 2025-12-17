# Project Billing System - Setup & Integration Guide

## Quick Start

### Step 1: Database Migration
Execute the billing schema migration to create required tables:

```bash
# Option A: Using psql directly
psql -U your_user -d your_database -f database/migrations/add-project-billing-table.sql

# Option B: Using Node.js (if you have a migration runner)
npm run db:migrate -- --migration add-project-billing-table.sql

# Option C: Copy-paste the SQL directly into your database management tool
# File: database/migrations/add-project-billing-table.sql
```

**What gets created:**
- `project_billing_phases` table
- `project_invoices_detailed` table
- Database indexes for performance
- Views for reporting
- Triggers for updated_at auto-update

### Step 2: Update Server Routes
Add the billing routes to your Express server:

**File**: Your main server file (e.g., `server/index.js` or wherever you initialize Express)

```javascript
// Add this with your other route imports
const billingRoutes = require('./server/billing-routes.js');

// Add this with your other app.use() calls
app.use('/api', billingRoutes);
```

**Verify installation by testing endpoint:**
```bash
curl http://localhost:5000/api/projects/{projectId}/billing-phases
```

### Step 3: Add React Component
Use the ProjectBilling component in your pages:

```tsx
import ProjectBilling from '@/pages/ProjectBilling';

export default function MyProjectPage() {
  const { projectId, project } = useParams();
  
  return (
    <ProjectBilling 
      projectId={projectId}
      projectName={project?.name}
      contractAmount={project?.contract_amount}
    />
  );
}
```

### Step 4: Insert Sample Data (Optional)
To test with sample billing phases:

```sql
SELECT insert_sample_billing_data();
```

This creates 4 sample phases for the first active project.

---

## File Structure

```
project-mgnt/
├── database/
│   └── migrations/
│       └── add-project-billing-table.sql       ← Database schema
├── server/
│   ├── billing-routes.js                       ← API endpoints
│   └── [other routes...]
├── services/
│   ├── billingService.js                       ← Business logic
│   └── [other services...]
├── src/
│   └── pages/
│       └── ProjectBilling.tsx                  ← React component
├── PROJECT_BILLING_DOCUMENTATION.md            ← Full documentation
└── PROJECT_BILLING_SETUP_GUIDE.md              ← This file
```

---

## API Endpoints Reference

### Create Billing Phase
```bash
POST /api/projects/{projectId}/billing-phases
Content-Type: application/json

{
  "phase_number": 1,
  "description": "Design Phase",
  "amount": 15000,
  "percentage_of_total": 25,
  "currency": "THB",
  "planned_delivery_date": "2025-12-31",
  "planned_payment_date": "2026-01-15",
  "status": "pending"
}
```

### Get Phases
```bash
GET /api/projects/{projectId}/billing-phases
GET /api/projects/{projectId}/billing-phases?status=paid
```

### Update Phase
```bash
PUT /api/billing-phases/{phaseId}

{
  "status": "delivered",
  "actual_delivery_date": "2025-12-28"
}
```

### Delete Phase
```bash
DELETE /api/billing-phases/{phaseId}
```

### Get Billing Summary
```bash
GET /api/projects/{projectId}/billing-summary
```

### Create Invoice
```bash
POST /api/billing-phases/{phaseId}/invoices

{
  "invoice_number": "INV-001",
  "subtotal": 15000,
  "tax_rate": 7,
  "due_date": "2026-01-15"
}
```

### Record Payment
```bash
POST /api/invoices/{invoiceId}/payment

{
  "amount_paid": 7500,
  "paid_date": "2026-01-10",
  "payment_method": "Bank Transfer"
}
```

### Get Overdue Invoices
```bash
GET /api/invoices/overdue
```

---

## Component Usage Examples

### Basic Usage
```tsx
<ProjectBilling 
  projectId="abc-123"
  projectName="Website Redesign"
  contractAmount={60000}
/>
```

### In a Tab
```tsx
import ProjectBilling from '@/pages/ProjectBilling';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProjectDetail() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
      </TabsList>
      
      <TabsContent value="billing">
        <ProjectBilling {...projectProps} />
      </TabsContent>
    </Tabs>
  );
}
```

### With Custom Styling
```tsx
<div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
  <h2 className="text-2xl font-bold mb-4">Project Billing</h2>
  <ProjectBilling {...projectProps} />
</div>
```

---

## Data Entry Workflow

### 1. Create Billing Phases
When starting a project:
1. Click "New Phase" button
2. Enter phase details:
   - Phase number (1, 2, 3, ...)
   - Description (what will be delivered)
   - Amount (in THB/USD/EUR)
   - Percentage (auto-calculated or manual)
   - Delivery dates (planned and actual when known)
   - Payment dates (planned and actual when known)
   - Status (start with "pending")
3. Click "Create Phase"
4. Repeat for all phases (typically 3-5 phases)

**Example Phase Breakdown:**
```
Phase 1: Design & Planning      (25%)  - $15,000
Phase 2: Development            (45%)  - $27,000  
Phase 3: Testing & QA           (15%)  - $9,000
Phase 4: Deployment & Support   (15%)  - $9,000
                        TOTAL: (100%) - $60,000
```

### 2. Update Phase Status
As work progresses:
1. Click the phase card to expand
2. Update status: pending → in-progress → delivered
3. Enter actual delivery date when complete
4. Click "Update Phase"

### 3. Create Invoice
When phase is delivered:
1. Expand phase details
2. Create invoice (via API or modal)
3. Set invoice number (INV-001, INV-002, etc.)
4. Set tax rate (0%, 7%, etc.)
5. Set due date (e.g., Net 30 days)
6. Phase status changes to "invoiced"

### 4. Record Payment
When payment is received:
1. Find invoice in list
2. Click "Record Payment"
3. Enter amount paid
4. Enter payment date
5. Add payment method and reference
6. If amount equals balance, status becomes "paid"

---

## Common Issues & Solutions

### Issue: "Phase not found" error
**Cause**: Invalid projectId or phase already deleted
**Solution**: 
- Verify projectId is correct UUID
- Check browser network tab for API response
- Refresh page and retry

### Issue: Percentage total doesn't equal 100%
**Cause**: Manual percentage entry
**Solution**:
- Use "auto-calculate" feature (enter amount, percentage auto-fills)
- Or manually adjust individual percentages
- Validate before saving

### Issue: Can't delete phase
**Cause**: Phase has linked invoices
**Solution**:
- Delete invoices first
- Then delete phase
- Or use soft delete (is_deleted flag)

### Issue: Payment recorded but status not "paid"
**Cause**: Partial payment, balance still due
**Solution**:
- Record additional payment for remaining balance
- Or update phase status manually

### Issue: API endpoint not found (404)
**Cause**: Routes not registered in server
**Solution**:
```javascript
// Make sure you added this to server:
const billingRoutes = require('./server/billing-routes.js');
app.use('/api', billingRoutes);
```

---

## Testing the Installation

### Test 1: Verify Database Tables
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'project_billing%' OR table_name LIKE 'project_invoice%';
```

Expected output:
```
project_billing_phases
project_invoices_detailed
```

### Test 2: Verify API Endpoints
```bash
# Get a project ID first
curl http://localhost:5000/api/projects | jq '.data[0].id'

# Test billing endpoint
curl http://localhost:5000/api/projects/{projectId}/billing-phases
```

Expected output:
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

### Test 3: Create Sample Phase
```bash
curl -X POST http://localhost:5000/api/projects/{projectId}/billing-phases \
  -H "Content-Type: application/json" \
  -d '{
    "phase_number": 1,
    "description": "Test Phase",
    "amount": 10000,
    "percentage_of_total": 100,
    "status": "pending"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Billing phase created successfully",
  "data": { ... }
}
```

### Test 4: Verify React Component
```tsx
// Add to any page and verify:
// 1. Summary cards display (should show 1 phase)
// 2. Phase list shows your test phase
// 3. Can expand phase to see details
// 4. Can edit/delete phase
```

---

## Performance Optimization

### Database Indexes
Indexes are automatically created:
- `idx_billing_phases_project_id` - Fast project lookups
- `idx_billing_phases_status` - Fast status filters
- `idx_invoices_billing_phase_id` - Fast invoice lookups
- `idx_invoices_due_date` - Fast overdue queries

These make queries fast even with thousands of phases/invoices.

### Caching Strategy
```typescript
// Cache billing summary for 5 minutes
const cacheSummary = async (projectId: string) => {
  const cacheKey = `billing_summary_${projectId}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) return cached;
  
  const summary = await fetchSummary(projectId);
  await cache.set(cacheKey, summary, 5 * 60); // 5 min
  return summary;
};
```

### Pagination (for future enhancement)
```bash
# Get phases with pagination
GET /api/projects/{projectId}/billing-phases?limit=10&offset=0
```

---

## Deployment Checklist

- [ ] Database migration executed successfully
- [ ] API routes registered in server
- [ ] React component added to page/tab
- [ ] Tested creating a billing phase
- [ ] Tested updating phase details
- [ ] Tested creating an invoice
- [ ] Tested recording payment
- [ ] Tested deleting a phase
- [ ] Verified summary cards display
- [ ] Tested dark mode styling
- [ ] Tested on mobile responsive view
- [ ] Reviewed error handling
- [ ] Added documentation link to main docs
- [ ] Trained team on new feature

---

## Security Considerations

### Authentication
All API endpoints require authentication (as configured in your server):
```javascript
router.get('/api/billing-phases/:id', authenticateToken, handler);
```

### Authorization
Implement role-based access:
```javascript
// Only PMs can edit project billing
router.put('/billing-phases/:id', 
  authenticateToken, 
  requireRole('pm'), 
  handler
);

// Finance team can view all invoices
router.get('/invoices/overdue',
  authenticateToken,
  requireRole(['finance', 'admin']),
  handler
);
```

### Data Protection
- Soft deletes preserve audit trail
- `created_by`/`updated_by` tracks user changes
- All dates are timezone-aware
- No sensitive data in URL params

---

## Maintenance Tasks

### Monthly Tasks
- [ ] Review overdue invoices
- [ ] Archive paid invoices
- [ ] Update payment schedules if needed
- [ ] Reconcile with accounting system

### Quarterly Tasks
- [ ] Analyze cash flow trends
- [ ] Review payment delays
- [ ] Optimize billing phase structure
- [ ] Train new team members

### Yearly Tasks
- [ ] Archive old projects' billing data
- [ ] Review billing policies
- [ ] Update tax rates if needed
- [ ] Audit all transactions

---

## Next Steps

1. **Complete Installation**
   - Run database migration
   - Add routes to server
   - Integrate React component

2. **Test Thoroughly**
   - Create sample phases
   - Create invoices
   - Record payments
   - Verify calculations

3. **Train Team**
   - Document your billing process
   - Train PMs on phase creation
   - Train finance team on invoicing
   - Train admins on reporting

4. **Configure Settings**
   - Set default tax rate
   - Define payment terms (Net 30, Net 60, etc.)
   - Set overdue notification rules
   - Configure payment methods

5. **Integration**
   - Link to project dashboard
   - Add billing to project detail page
   - Create billing reports
   - Set up payment reminders

---

## Support & Resources

- **Full Documentation**: See `PROJECT_BILLING_DOCUMENTATION.md`
- **API Reference**: See `server/billing-routes.js` comments
- **Component Props**: See `src/pages/ProjectBilling.tsx` interface
- **Service Methods**: See `services/billingService.js`

For help with implementation, contact your development team.
