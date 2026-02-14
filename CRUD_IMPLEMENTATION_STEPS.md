# 🚀 CRUD System Implementation Steps

**Objective:** Fix all CRUD gaps identified in the audit report  
**Timeline:** 3-5 days  
**Priority:** High

---

## Phase 1: Delete Confirmations (2-3 hours)

### Step 1.1: Replace Users Module Delete
**File:** `next-app/app/users/page.tsx`

**Current Code (Line 182-191):**
```typescript
const handleDelete = async (id: string) => {
  if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) return;
  try {
    await deleteUser(id);
    toast.success('ลบผู้ใช้สำเร็จ');
    queryClient.invalidateQueries({ queryKey: ['users'] });
  } catch (e: any) {
    toast.error(e?.message || 'ลบไม่สำเร็จ');
  }
};
```

**Replace With:**
```typescript
// State
const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

// Mutation
const deleteUserMutation = useMutation({
  mutationFn: (userId: string) => deleteUser(userId),
  onSuccess: () => {
    toast.success('✅ ลบผู้ใช้สำเร็จแล้ว');
    queryClient.invalidateQueries({ queryKey: ['users'] });
    setDeleteConfirm(null);
  },
  onError: (error: any) => {
    toast.error(`❌ ลบไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}`);
  },
});

// Handlers
const handleDeleteClick = (user: User) => {
  setDeleteConfirm({ id: user.id, name: user.name });
};

const handleConfirmDelete = async () => {
  if (!deleteConfirm) return;
  deleteUserMutation.mutate(deleteConfirm.id);
};
```

**UI Changes (Line 347-349):**
```typescript
<DropdownMenuItem 
  className="text-red-600 cursor-pointer" 
  onClick={() => handleDeleteClick(user)}
>
  <Trash2 className="h-4 w-4 mr-2" /> ลบผู้ใช้
</DropdownMenuItem>
```

**Add Dialog Component Before Closing Page:**
```typescript
<DeleteConfirmationDialog
  open={!!deleteConfirm}
  title="ยืนยันการลบผู้ใช้"
  description="เมื่อลบผู้ใช้นี้ จะไม่สามารถกู้คืนข้อมูลได้"
  entityName={deleteConfirm?.name}
  isLoading={deleteUserMutation.isPending}
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteConfirm(null)}
  isDangerous={true}
/>
```

**Import:**
```typescript
import DeleteConfirmationDialog from '@/app/components/DeleteConfirmationDialog';
```

---

### Step 1.2: Replace Tasks Module Delete
**File:** `next-app/app/tasks/page.tsx`

**Current Code (Line 67-76):**
```typescript
const handleDelete = async (id: string) => {
  if (!window.confirm('Are you sure you want to delete this task?')) return;
  try {
    await deleteTask(id);
    toast.success('Task deleted successfully');
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  } catch (e: any) {
    toast.error(e?.message || 'Delete failed');
  }
};
```

**Follow same pattern as Users module above**

---

### Step 1.3: Replace Clients Module Delete
**File:** `next-app/app/clients/page.tsx`

**Current Code (Line 63-72):**
```typescript
const handleDelete = async (id: string) => {
  if (!window.confirm('Are you sure you want to delete this client?')) return;
  try {
    await deleteClient(id);
    toast.success('Client deleted successfully');
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  } catch (e: any) {
    toast.error(e?.message || 'Delete failed');
  }
};
```

**Follow same pattern as Users module above**

---

### Step 1.4: Add Delete Toast to Projects
**File:** `next-app/app/projects/page.tsx`

**Current Code (Line 300-330 - where handleDeleteProject is):**
```typescript
// Find the deleteProjectMutation
// Add onSuccess/onError handlers:

const deleteProjectMutation = useMutation({
  mutationFn: (id: string) => deleteProject(id),
  onSuccess: () => {
    toast.success('✅ ลบโครงการสำเร็จแล้ว'); // ADD THIS
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setDeleteConfirm(null);
  },
  onError: (error: any) => {
    toast.error(`❌ ลบไม่สำเร็จ: ${error?.message}`); // ADD THIS
  },
});
```

---

## Phase 2: Input Validation (3-4 hours)

### Step 2.1: Add Email Validation Utility
**Create File:** `next-app/lib/validation.ts`

```typescript
// Email validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

// Thailand Tax ID = 13 digits
export const validateThaiTaxId = (taxId: string): boolean => {
  return /^\d{13}$/.test(taxId);
};

// Phone validation (flexible for Thailand)
export const validatePhone = (phone: string): boolean => {
  return /^[0-9\-\s\(\)]{9,}$/.test(phone);
};

// Budget validation
export const validateBudget = (budget: number): boolean => {
  return !isNaN(budget) && budget >= 0;
};

// Date validation
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  return new Date(startDate) < new Date(endDate);
};
```

---

### Step 2.2: Update Clients Form Modal
**File:** `next-app/app/clients/components/ClientFormModal.tsx`

**Add validation:**
```typescript
import { validateEmail, validateThaiTaxId } from '@/app/lib/validation';

const onSubmit = async (data: Partial<Client>) => {
  // Add validation
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Client name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (data.taxId && !validateThaiTaxId(data.taxId)) {
    errors.taxId = 'Tax ID must be exactly 13 digits';
  }

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`);
    });
    return;
  }

  // Continue with submit...
  try {
    // ... existing code
  }
};
```

**Update form fields to show errors:**
```typescript
<div className="space-y-2">
  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
  <Input 
    id="email" 
    type="email"
    {...register('email', { 
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Invalid email format'
      }
    })} 
    placeholder="contact@company.com"
  />
  {errors.email && (
    <p className="text-sm text-red-500 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {errors.email.message}
    </p>
  )}
</div>

<div className="space-y-2">
  <Label htmlFor="taxId">Tax ID (13 digits)</Label>
  <Input 
    id="taxId" 
    {...register('taxId', {
      pattern: {
        value: /^\d{13}$/,
        message: 'Tax ID must be exactly 13 digits'
      }
    })} 
    placeholder="1234567890123"
    maxLength={13}
  />
  {errors.taxId && (
    <p className="text-sm text-red-500 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {errors.taxId.message}
    </p>
  )}
</div>

<div className="space-y-2">
  <Label htmlFor="phone">Phone</Label>
  <Input 
    id="phone" 
    {...register('phone', {
      pattern: {
        value: /^[0-9\-\s\(\)]{9,}$/,
        message: 'Invalid phone number'
      }
    })} 
    placeholder="02-xxx-xxxx"
  />
  {errors.phone && (
    <p className="text-sm text-red-500 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {errors.phone.message}
    </p>
  )}
</div>
```

---

### Step 2.3: Update Projects Form Validation
**File:** `next-app/components/ProjectForm.tsx` or similar

**Add date and budget validation:**
```typescript
const validateProjectForm = (data: Partial<ProjectType>): boolean => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Project name is required';
  }

  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      errors.endDate = 'End date must be after start date';
    }
  }

  if (data.budget !== undefined && data.budget !== null) {
    if (data.budget < 0) {
      errors.budget = 'Budget cannot be negative';
    }
  }

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, message]) => {
      toast.error(`${field}: ${message}`);
    });
    return false;
  }

  return true;
};
```

---

## Phase 3: Toast Notifications (2-3 hours)

### Step 3.1: Audit & Add Missing Toasts

**Projects Module - Add to delete handler:**
```typescript
const deleteProjectMutation = useMutation({
  mutationFn: (id: string) => deleteProject(id),
  onSuccess: () => {
    toast.success('✅ ลบโครงการสำเร็จแล้ว'); // ADD
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setDeleteConfirm(null);
  },
  onError: (error: any) => {
    toast.error(`❌ ${error?.message}`); // ADD
  },
});
```

**Clients Module - Ensure all operations have toasts:**
```typescript
const handleCreateClient = async (data: Client) => {
  try {
    await createClient(data);
    toast.success('✅ สร้างคลায้েント์สำเร็จแล้ว'); // ADD if missing
  } catch (error) {
    toast.error(`❌ สร้างล้มเหลว: ${error.message}`); // ADD if missing
  }
};
```

**Standard Toast Messages (Thai):**
- Create Success: `✅ สร้าง[Entity]สำเร็จแล้ว`
- Update Success: `💾 อัปเดตสำเร็จแล้ว`
- Delete Success: `🗑️ ลบสำเร็จแล้ว`
- Error: `❌ เกิดข้อผิดพลาด: [message]`
- Loading: `⏳ กำลังบันทึก...`

---

## Phase 4: Delete Functionality (2-3 hours)

### Step 4.1: Add Expense Delete
**File:** `next-app/app/approvals/expenses/page.tsx`

**Add function:**
```typescript
const handleDeleteExpense = async (id: string) => {
  setDeleteConfirm({ id, name: expenseName });
};

const handleConfirmDelete = async () => {
  if (!deleteConfirm) return;
  try {
    const response = await fetch(`/api/expenses/${deleteConfirm.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete failed');
    
    toast.success('✅ ลบรายการขอใช้เบิดสำเร็จแล้ว');
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    setDeleteConfirm(null);
  } catch (error) {
    toast.error(`❌ ${error.message}`);
  }
};
```

**Add backend DELETE route if missing:**
```typescript
// next-app/app/api/expenses/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await supabaseAdminClient
      .from('expenses')
      .delete()
      .eq('id', params.id);
    
    if (response.error) throw response.error;
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Phase 5: Testing Checklist

### Manual Testing Before Deploying
```
[ ] Delete Confirmation Modal appears on delete click
[ ] Clicking Cancel closes modal without deleting
[ ] Clicking Confirm deletes and shows success toast
[ ] Data list refreshes automatically after delete
[ ] Email validation prevents invalid emails
[ ] Tax ID validation enforces 13 digits
[ ] Phone validation accepts various formats
[ ] Date validation prevents end date before start date
[ ] Budget validation prevents negative values
[ ] All error messages display under appropriate fields
[ ] All success/error toasts appear
[ ] Loading state shown during async operations
```

### Unit Tests to Add
```typescript
// tests/validation.test.ts
describe('Validation', () => {
  test('validateEmail rejects invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@example.com')).toBe(true);
  });

  test('validateThaiTaxId requires 13 digits', () => {
    expect(validateThaiTaxId('123456789012')).toBe(false);
    expect(validateThaiTaxId('1234567890123')).toBe(true);
  });

  test('validateDateRange ensures start < end', () => {
    expect(validateDateRange('2026-01-01', '2026-12-31')).toBe(true);
    expect(validateDateRange('2026-12-31', '2026-01-01')).toBe(false);
  });
});
```

---

## Deployment Checklist

- [ ] All 4 modules have delete confirmation modals
- [ ] All validation rules are in place
- [ ] All toast notifications are consistent
- [ ] Delete functionality works for all modules
- [ ] No regressions in existing functionality
- [ ] E2E tests pass
- [ ] Performance not degraded

---

## Estimated Timeline

| Phase | Task | Hours | Days |
|-------|------|-------|------|
| 1 | Delete Confirmations | 3 | 1 |
| 2 | Input Validation | 4 | 1 |
| 3 | Toast Notifications | 2 | 0.5 |
| 4 | Delete Functionality | 2 | 0.5 |
| **Total** | | **11** | **3-4** |

---

## Questions?

Refer back to `CRUD_SYSTEM_AUDIT.md` for detailed analysis of each module.
