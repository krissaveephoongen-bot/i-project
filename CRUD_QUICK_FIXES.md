# ⚡ CRUD Quick Fixes - Copy & Paste Solutions

## 1️⃣ Delete Confirmation Modal (Copy Below)

### Replace ALL `window.confirm()` with this:

**State:**
```typescript
const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
```

**Mutation:**
```typescript
const deleteItemMutation = useMutation({
  mutationFn: (id: string) => deleteItem(id), // Replace deleteItem with your function
  onSuccess: () => {
    toast.success('✅ ลบสำเร็จแล้ว');
    queryClient.invalidateQueries({ queryKey: ['items'] }); // Replace 'items'
    setDeleteConfirm(null);
  },
  onError: (error: any) => {
    toast.error(`❌ ลบไม่สำเร็จ: ${error?.message}`);
  },
});
```

**Handler:**
```typescript
const handleDeleteClick = (item: any) => {
  setDeleteConfirm({ id: item.id, name: item.name });
};

const handleConfirmDelete = async () => {
  if (!deleteConfirm) return;
  deleteItemMutation.mutate(deleteConfirm.id);
};
```

**Dropdown MenuItem:**
```typescript
<DropdownMenuItem 
  className="text-red-600 cursor-pointer" 
  onClick={() => handleDeleteClick(item)}
>
  <Trash2 className="h-4 w-4 mr-2" /> ลบ
</DropdownMenuItem>
```

**Modal Component (end of page):**
```typescript
<DeleteConfirmationDialog
  open={!!deleteConfirm}
  title="ยืนยันการลบ"
  description="การกระทำนี้ไม่สามารถย้อนกลับได้"
  entityName={deleteConfirm?.name}
  isLoading={deleteItemMutation.isPending}
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteConfirm(null)}
  isDangerous={true}
/>
```

---

## 2️⃣ Email Validation (Copy Below)

### Add to form validation:

```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

// In handleSubmit:
if (!validateEmail(formData.email)) {
  toast.error('❌ รูปแบบอีเมลไม่ถูกต้อง');
  return;
}
```

### In React Hook Form:
```typescript
<Input 
  type="email"
  {...register('email', { 
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format'
    }
  })} 
/>
{errors.email && (
  <p className="text-sm text-red-500">{errors.email.message}</p>
)}
```

---

## 3️⃣ Thailand Tax ID Validation (Copy Below)

```typescript
const THAI_TAX_ID_REGEX = /^\d{13}$/;

const validateThaiTaxId = (taxId: string): boolean => {
  return THAI_TAX_ID_REGEX.test(taxId);
};

// In handleSubmit:
if (data.taxId && !validateThaiTaxId(data.taxId)) {
  toast.error('❌ Tax ID ต้องเป็นตัวเลข 13 หลัก');
  return;
}
```

### In form field:
```typescript
<Input 
  {...register('taxId', {
    pattern: {
      value: /^\d{13}$/,
      message: 'Must be exactly 13 digits'
    }
  })}
  maxLength={13}
  placeholder="1234567890123"
/>
```

---

## 4️⃣ Date Range Validation (Copy Below)

```typescript
const validateDateRange = (startDate: string, endDate: string): boolean => {
  return new Date(startDate) < new Date(endDate);
};

// In handleSubmit:
if (!validateDateRange(data.startDate, data.endDate)) {
  toast.error('❌ วันสิ้นสุดต้องหลังจากวันเริ่มต้น');
  return;
}
```

---

## 5️⃣ Phone Number Validation (Copy Below)

```typescript
// Flexible Thai phone validation
const PHONE_REGEX = /^[0-9\-\s\(\)]{9,}$/;

const validatePhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

// In form field:
<Input 
  {...register('phone', {
    pattern: {
      value: /^[0-9\-\s\(\)]{9,}$/,
      message: 'Invalid phone number'
    }
  })}
  placeholder="02-xxx-xxxx or 08-xxxx-xxxx"
/>
```

---

## 6️⃣ Budget Validation (Copy Below)

```typescript
// In handleSubmit:
if (data.budget && data.budget < 0) {
  toast.error('❌ งบประมาณต้องมากกว่า 0');
  return;
}
```

---

## 7️⃣ Toast Notifications (Copy Below)

### Import:
```typescript
import { toast } from 'react-hot-toast';
```

### Standard Messages:
```typescript
// Success
toast.success('✅ สร้างสำเร็จแล้ว');
toast.success('💾 อัปเดตสำเร็จแล้ว');
toast.success('🗑️ ลบสำเร็จแล้ว');

// Error
toast.error('❌ เกิดข้อผิดพลาด');
toast.error('❌ กรอกข้อมูลไม่ครบถ้วน');

// Loading
const id = toast.loading('⏳ กำลังบันทึก...');
// Later: toast.dismiss(id);

// Validation errors
toast.error(`❌ ${fieldName}: ${errorMessage}`);
```

---

## 8️⃣ Error Message Display Below Fields

```typescript
import { AlertCircle } from 'lucide-react';

<div className="space-y-2">
  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
  <Input 
    id="email"
    {...register('email', { required: 'Email is required' })}
    className={errors.email ? 'border-red-500' : ''}
  />
  {errors.email && (
    <p className="text-sm text-red-500 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {errors.email.message}
    </p>
  )}
</div>
```

---

## 9️⃣ Delete with API Route

```typescript
// Mutation for delete with API call
const deleteItemMutation = useMutation({
  mutationFn: async (id: string) => {
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Delete failed');
    return response.json();
  },
  onSuccess: () => {
    toast.success('✅ ลบสำเร็จแล้ว');
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
  onError: (error: any) => {
    toast.error(`❌ ลบไม่สำเร็จ: ${error.message}`);
  },
});
```

**Backend DELETE route:**
```typescript
// app/api/items/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Delete from database
    const result = await db.delete(items).where(eq(items.id, params.id));
    
    if (!result) throw new Error('Item not found');
    
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🔟 Form Validation Patterns

### Complete Form with All Validations:
```typescript
const handleSubmit = async () => {
  // 1. Clear previous errors
  setErrors({});

  // 2. Validate required fields
  if (!formData.name?.trim()) {
    setErrors(prev => ({ ...prev, name: 'ชื่อเป็นข้อมูลที่จำเป็น' }));
    return;
  }

  // 3. Validate email format
  if (formData.email && !EMAIL_REGEX.test(formData.email)) {
    setErrors(prev => ({ ...prev, email: 'รูปแบบอีเมลไม่ถูกต้อง' }));
    return;
  }

  // 4. Validate phone format
  if (formData.phone && !PHONE_REGEX.test(formData.phone)) {
    setErrors(prev => ({ ...prev, phone: 'หมายเลขโทรศัพท์ไม่ถูกต้อง' }));
    return;
  }

  // 5. Validate Tax ID
  if (formData.taxId && !THAI_TAX_ID_REGEX.test(formData.taxId)) {
    setErrors(prev => ({ ...prev, taxId: 'Tax ID ต้องเป็น 13 หลัก' }));
    return;
  }

  // 6. Validate dates
  if (formData.startDate && formData.endDate) {
    if (!validateDateRange(formData.startDate, formData.endDate)) {
      setErrors(prev => ({ ...prev, endDate: 'วันสิ้นสุดต้องหลังจากวันเริ่มต้น' }));
      return;
    }
  }

  // 7. Validate budget
  if (formData.budget && formData.budget < 0) {
    setErrors(prev => ({ ...prev, budget: 'งบประมาณต้องมากกว่า 0' }));
    return;
  }

  // 8. If all validations pass, submit
  try {
    // Your submit logic
    toast.success('✅ บันทึกสำเร็จแล้ว');
  } catch (error) {
    toast.error(`❌ เกิดข้อผิดพลาด: ${error.message}`);
  }
};
```

---

## Modules Requiring Updates

| Module | Changes Needed | Est. Time |
|--------|----------------|-----------|
| Users | Delete confirmation, validation | 1 hour |
| Tasks | Delete confirmation | 30 min |
| Clients | Delete confirmation, validation | 1.5 hours |
| Projects | Add delete toast | 15 min |
| Expenses | Add delete functionality | 1 hour |

**Total: ~4-5 hours**

---

## File Creation Checklist

- [x] `CRUD_SYSTEM_AUDIT.md` - Complete audit report
- [x] `CRUD_IMPLEMENTATION_STEPS.md` - Detailed steps
- [x] `CRUD_QUICK_FIXES.md` - This file (quick copy-paste)
- [x] `components/DeleteConfirmationDialog.tsx` - Reusable delete modal
- [x] `app/users/page-improved.tsx` - Example implementation
- [ ] `lib/validation.ts` - Create this file with all validators
- [ ] Update other modules following the patterns above

---

**Created:** 2026-02-14  
**Ready for:** Immediate implementation
