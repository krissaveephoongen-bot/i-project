# Project Billing System Documentation

## Overview
A comprehensive billing and invoicing system that enables project managers to define billing phases/milestones, track deliveries, manage payment schedules, and monitor invoice status and payment history.

## System Components

### 1. Database Schema
**File**: `database/migrations/add-project-billing-table.sql`

#### Tables

##### project_billing_phases
Stores billing phases/milestones for each project.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `phase_number` | INTEGER | Phase sequence (1, 2, 3, ...) |
| `description` | TEXT | Phase description (e.g., "Design Phase") |
| `amount` | DECIMAL | Phase amount/price |
| `percentage_of_total` | DECIMAL | Percent of contract value (0-100) |
| `currency` | TEXT | Currency (THB, USD, EUR) |
| `planned_delivery_date` | TIMESTAMP | Planned delivery date |
| `actual_delivery_date` | TIMESTAMP | Actual delivery date |
| `planned_payment_date` | TIMESTAMP | Planned payment date |
| `actual_payment_date` | TIMESTAMP | Actual payment date |
| `status` | ENUM | Phase status |
| `deliverables` | TEXT | Deliverable descriptions |
| `notes` | TEXT | Additional notes |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `is_deleted` | BOOLEAN | Soft delete flag |

##### project_invoices_detailed
Detailed invoice records linked to billing phases.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `billing_phase_id` | UUID | Foreign key to billing phase |
| `invoice_number` | TEXT | Unique invoice ID |
| `subtotal` | DECIMAL | Before tax amount |
| `tax_amount` | DECIMAL | Calculated tax |
| `tax_rate` | DECIMAL | Tax percentage (0-100) |
| `total_amount` | DECIMAL | Subtotal + tax |
| `amount_paid` | DECIMAL | Amount received |
| `balance_due` | DECIMAL | Remaining balance |
| `due_date` | TIMESTAMP | Payment due date |
| `paid_date` | TIMESTAMP | When payment received |
| `status` | ENUM | Invoice status |
| `payment_method` | TEXT | Payment method (bank transfer, check, etc.) |
| `transaction_reference` | TEXT | Reference/transaction ID |
| `notes` | TEXT | Payment notes |

#### Enums

**billing_phase_status**:
- `pending` - Not yet started
- `in-progress` - Currently being worked on
- `delivered` - Work completed, awaiting payment
- `invoiced` - Invoice issued
- `paid` - Payment received
- `overdue` - Payment past due
- `cancelled` - Phase cancelled

#### Views
- **project_billing_summary** - Aggregated billing statistics per project
- **overdue_invoices** - All unpaid invoices past due date

---

### 2. API Routes
**File**: `server/billing-routes.js`

#### Billing Phases

##### Get Phases
```
GET /api/projects/{projectId}/billing-phases
```
**Query Parameters**: `status` (optional filter)

##### Create Phase
```
POST /api/projects/{projectId}/billing-phases
```
**Body**:
```json
{
  "phase_number": 1,
  "description": "Design & Planning",
  "amount": 15000,
  "percentage_of_total": 25,
  "currency": "THB",
  "planned_delivery_date": "2025-12-31",
  "planned_payment_date": "2026-01-15",
  "status": "pending",
  "deliverables": "Architecture design, wireframes",
  "notes": "Initial phase"
}
```

##### Update Phase
```
PUT /api/billing-phases/{phaseId}
```

##### Delete Phase
```
DELETE /api/billing-phases/{phaseId}
```

#### Invoices

##### Get Invoices
```
GET /api/projects/{projectId}/invoices
```

##### Create Invoice
```
POST /api/billing-phases/{phaseId}/invoices
```
**Body**:
```json
{
  "invoice_number": "INV-001",
  "subtotal": 15000,
  "tax_rate": 7,
  "due_date": "2026-01-15",
  "payment_method": "Bank Transfer",
  "notes": "50% upfront payment"
}
```

##### Record Payment
```
POST /api/invoices/{invoiceId}/payment
```
**Body**:
```json
{
  "amount_paid": 7500,
  "paid_date": "2026-01-10",
  "payment_method": "Bank Transfer",
  "transaction_reference": "TRX123456",
  "notes": "Partial payment received"
}
```

#### Summary & Reports

##### Billing Summary
```
GET /api/projects/{projectId}/billing-summary
```

**Response**:
```json
{
  "success": true,
  "data": {
    "project_id": "uuid",
    "total_contract_value": 60000,
    "total_phases": 4,
    "pending_amount": 15000,
    "invoiced_amount": 30000,
    "paid_amount": 15000,
    "overdue_amount": 0,
    "total_balance_due": 15000
  }
}
```

##### Overdue Invoices
```
GET /api/invoices/overdue
```

---

### 3. Service Layer
**File**: `services/billingService.js`

Core methods:
- `getBillingPhases(projectId, filters)` - Fetch phases
- `createBillingPhase(projectId, phaseData)` - Create phase
- `updateBillingPhase(phaseId, updateData)` - Update phase
- `deleteBillingPhase(phaseId)` - Delete phase
- `createInvoice(phaseId, invoiceData)` - Create invoice
- `recordPayment(invoiceId, paymentData)` - Record payment
- `getBillingSummary(projectId)` - Get summary stats
- `getOverdueInvoices()` - Get overdue invoices
- `validatePhasePercentages(projectId)` - Validate total = 100%

---

### 4. React Component
**File**: `src/pages/ProjectBilling.tsx`

#### Props
```typescript
interface ProjectBillingProps {
  projectId: string;
  projectName?: string;
  contractAmount?: number;
}
```

#### Features
- **Summary Cards**: Display key metrics
  - Total phases
  - Paid amount
  - Invoiced amount
  - Balance due
  - Overdue amount

- **Billing Phases List**:
  - Phase number and description
  - Amount and percentage display
  - Status badge
  - Expandable details view

- **Detailed View** (when expanded):
  - Planned vs actual delivery dates
  - Planned vs actual payment dates
  - Deliverables list
  - Notes
  - Edit/Delete buttons

- **Create/Edit Modal**:
  - All phase fields
  - Auto-calculation of percentage
  - Date picker for timeline dates
  - Status selector

#### Usage
```tsx
import ProjectBilling from '@/pages/ProjectBilling';

export default function ProjectPage() {
  return (
    <ProjectBilling 
      projectId="uuid-here"
      projectName="My Project"
      contractAmount={60000}
    />
  );
}
```

---

## Billing Phase Status Workflow

```
PENDING ──→ IN-PROGRESS ──→ DELIVERED ──→ INVOICED ──→ PAID
    ↓            ↓              ↓            ↓
 CANCELLED   CANCELLED    CANCELLED    OVERDUE/PAID
```

**Status Transitions**:
- `pending`: Initial state, work hasn't started
- `in-progress`: Active work in progress
- `delivered`: Work completed, ready to invoice
- `invoiced`: Invoice issued to client
- `paid`: Payment received ✓
- `overdue`: Payment past due date (special flag)
- `cancelled`: Phase cancelled/void

---

## Timeline Tracking

Each phase tracks two timelines:

### Delivery Schedule
- **Planned Delivery**: Expected completion date
- **Actual Delivery**: When work was actually completed
- Used to track schedule adherence

### Payment Schedule
- **Planned Payment**: Expected payment date
- **Actual Payment**: When client actually paid
- Used to track cash flow and overdue amounts

---

## Financial Tracking

### Amount Calculation
```
Percentage = (Phase Amount / Contract Amount) × 100

Total Amount = Subtotal + Tax
Tax = Subtotal × (Tax Rate / 100)
Balance Due = Total Amount - Amount Paid
```

### Status Tracking
- **Pending Amount**: Sum of phases with status 'pending'
- **Invoiced Amount**: Sum of phases that are 'invoiced' or 'paid'
- **Paid Amount**: Sum of phases with status 'paid'
- **Overdue Amount**: Sum of overdue invoices
- **Balance Due**: Total outstanding amount

---

## Key Features

### 1. Multiple Billing Phases
Define project billing as multiple phases:
- Phase 1: Design (25%) - 15,000
- Phase 2: Development (45%) - 27,000
- Phase 3: Testing (15%) - 9,000
- Phase 4: Support (15%) - 9,000

### 2. Flexible Payment Terms
- Set different dates for each phase
- Track planned vs actual dates
- Auto-calculate delays

### 3. Invoice Management
- Generate invoices per phase
- Apply tax calculations
- Track partial payments
- Monitor overdue invoices

### 4. Summary Dashboard
- Quick overview of billing status
- Cash flow visualization
- Outstanding balance tracking
- Phase completion metrics

---

## Data Validation

### Phase Validation
```javascript
// Percentages should total 100% (or 0 if not using)
Total Percentage = Sum of all phase percentages

// Dates validation
actual_delivery_date >= planned_delivery_date
actual_payment_date >= planned_payment_date
```

### Invoice Validation
```javascript
// Amount validation
subtotal >= 0
tax_rate: 0-100
total_amount = subtotal + tax
amount_paid >= 0
balance_due >= 0
```

---

## Sample Data

Migration includes sample billing phases:
1. **System Design & Planning** - 25% - Pending → Delivered
2. **Development & Implementation** - 45% - In Progress
3. **Testing, QA & Deployment** - 15% - Pending
4. **Support & Maintenance** - 15% - Pending

Generate sample data:
```sql
SELECT insert_sample_billing_data();
```

---

## Integration Guide

### 1. Add to Project Detail Page
```tsx
import ProjectBilling from '@/pages/ProjectBilling';

export default function ProjectDetail() {
  return (
    <div>
      <ProjectBilling 
        projectId={projectId}
        projectName={project.name}
        contractAmount={project.contract_amount}
      />
    </div>
  );
}
```

### 2. Add to Dashboard
```tsx
import ProjectBilling from '@/pages/ProjectBilling';
import { useEffect, useState } from 'react';

export default function DashboardBilling() {
  const [summary, setSummary] = useState(null);
  
  useEffect(() => {
    // Fetch all projects and their billing summaries
    fetchBillingSummaries();
  }, []);
  
  return (
    <div>
      {/* Summary cards */}
      {/* Project billing list */}
    </div>
  );
}
```

### 3. Server Integration
Add routes to your main server file:
```javascript
const billingRoutes = require('./server/billing-routes.js');
app.use('/api', billingRoutes);
```

---

## Database Migration

Execute the migration to create tables:
```bash
# Using psql
psql -U user -d database -f database/migrations/add-project-billing-table.sql

# Or using Node.js migration script
npm run db:migrate
```

---

## Common Workflows

### Create a New Project Billing Structure
1. Create 4 phases (Design, Dev, QA, Support)
2. Set amounts totaling contract value
3. Set delivery and payment dates
4. Update status as work progresses

### Invoice a Completed Phase
1. Phase status → "delivered"
2. Create invoice for the phase
3. Set due date (e.g., NET30)
4. Send to client

### Record Payment
1. When payment received, click invoice
2. Enter payment amount
3. Update payment date
4. Auto-update status to "paid" if full payment

### Track Overdue
1. System auto-flags invoices past due date
2. View in Overdue Invoices report
3. Follow up with client
4. Record payment once received

---

## Reporting & Analytics

### Views Available
1. **project_billing_summary**
   - Phase count
   - Amount breakdowns
   - Status distribution

2. **overdue_invoices**
   - Days overdue calculation
   - Project reference
   - Outstanding amount

### Metrics to Track
- **Cash Flow**: Planned vs actual payment schedule
- **Phase Completion**: Delivered phases vs total
- **Invoice Aging**: Time between delivery and payment
- **Outstanding Balance**: Total owed by clients

---

## Error Handling

### Validation Errors
- Phase number uniqueness
- Amount validation
- Date logic (actual ≥ planned)
- Invoice number uniqueness

### Business Logic
- Can't delete phase with invoices
- Payment amount can't exceed invoice total
- Phase can't be deleted if it impacts percentage total

---

## Performance Considerations

### Indexes
Created on:
- `project_id` - Fast project lookups
- `status` - Fast status filtering
- `payment_date` fields - Timeline queries
- `invoice_number` - Unique constraint

### Optimization
- Use soft deletes for audit trail
- Archive old invoices
- Aggregate summary data in view
- Cache billing summaries

---

## Security & Audit

### Data Protection
- Soft deletes preserve data
- `created_by`/`updated_by` tracks changes
- `created_at`/`updated_at` audit timestamps
- No hard deletes - full history retained

### Access Control
Implement role-based access:
- **Admins**: Full access
- **PMs**: View/edit own projects
- **Finance**: View payment data
- **Clients**: View own invoices (if enabled)

---

## Future Enhancements

1. **Recurring Invoicing**: Auto-generate monthly invoices
2. **Payment Reminders**: Auto-send overdue notifications
3. **Multi-currency Support**: Convert currencies
4. **PDF Export**: Generate professional invoices
5. **Payment Gateway**: Stripe/PayPal integration
6. **Expense Tracking**: Link expenses to billing phases
7. **Approval Workflow**: PO approval before invoicing
8. **Revenue Recognition**: IFRS/ASC 606 compliance
9. **Commission Calculation**: Auto-calculate sales commission
10. **Dunning Management**: Automated payment collection

---

## Troubleshooting

### Issues

**Q: Percentage total doesn't equal 100%**
- A: Use `validatePhasePercentages()` to check
- Recalculate percentages or use manual entry

**Q: Can't delete phase**
- A: Check for linked invoices
- Delete invoices first, then phase

**Q: Overdue calculation wrong**
- A: Verify `due_date` is set correctly
- Check system timezone settings

**Q: Payment not recorded**
- A: Verify invoice exists and is not paid
- Check amount doesn't exceed balance

---

## Support & Contact

For issues, feature requests, or documentation updates, contact the development team or refer to the main project repository.
