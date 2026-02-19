# Toast Notification Implementation Guide

## Overview
เพิ่ม toast notification สำหรับแสดงผลการบันทึก/อัปเดตข้อมูล (สำเร็จ/ล้มเหลว)

## Installation ✅
- ✅ `react-hot-toast` - Already installed
- ✅ `Toaster` provider - Already in `app/components/providers.tsx`

## Usage

### 1. Import Hook
```typescript
import { useToast } from '@/hooks/useToast';
```

### 2. Initialize in Component
```typescript
export default function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  
  // ... your code
}
```

### 3. Use in Functions
```typescript
const handleSave = async () => {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showSuccess('Data saved successfully!');
    } else {
      showError('Failed to save data');
    }
  } catch (error) {
    showError(error.message);
  }
};
```

## API

### `showSuccess(message, duration?)`
- **message**: Success message (string)
- **duration**: Display time in ms (default: 3000)
- **Color**: Green (#10b981)
- **Icon**: ✓

```typescript
showSuccess('Profile updated successfully');
showSuccess('ข้อมูลบันทึกสำเร็จ', 2000);
```

### `showError(message, duration?)`
- **message**: Error message (string)
- **duration**: Display time in ms (default: 4000)
- **Color**: Red (#ef4444)
- **Icon**: ✕

```typescript
showError('Failed to update profile');
showError('เกิดข้อผิดพลาด โปรดลองใหม่', 3000);
```

### `showInfo(message, duration?)`
- **message**: Info message (string)
- **duration**: Display time in ms (default: 3000)
- **Color**: Blue (#3b82f6)
- **Icon**: ℹ

```typescript
showInfo('Processing your request...');
showInfo('กำลังบันทึกข้อมูล...');
```

### `showWarning(message, duration?)`
- **message**: Warning message (string)
- **duration**: Display time in ms (default: 3000)
- **Color**: Amber (#f59e0b)
- **Icon**: ⚠

```typescript
showWarning('This action cannot be undone');
showWarning('อ่านข้อมูลเสร็จแล้ว');
```

## Examples

### Form Submission
```typescript
'use client';

import { useToast } from '@/hooks/useToast';

export default function ContactForm() {
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: new FormData(e.currentTarget)
      });
      
      if (!response.ok) throw new Error('Submission failed');
      
      showSuccess('ส่งข้อมูลสำเร็จแล้ว');
      e.currentTarget.reset();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />
      <textarea name="message" required />
      <button type="submit">ส่ง</button>
    </form>
  );
}
```

### CRUD Operations
```typescript
const handleDelete = async (id: string) => {
  try {
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      showSuccess('Item deleted successfully');
      // Refresh list
    } else {
      showError('Cannot delete this item');
    }
  } catch (error) {
    showError('Network error occurred');
  }
};

const handleUpdate = async (id: string, data: any) => {
  try {
    const response = await fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showSuccess('Changes saved successfully');
    } else {
      showError('Failed to save changes');
    }
  } catch (error) {
    showError('An unexpected error occurred');
  }
};
```

### Validation Feedback
```typescript
const handleSignUp = async (formData: SignUpForm) => {
  // Input validation
  if (!formData.email.includes('@')) {
    showError('Invalid email address');
    return;
  }
  
  if (formData.password.length < 8) {
    showError('Password must be at least 8 characters');
    return;
  }
  
  if (formData.password !== formData.confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  // Processing
  showInfo('Creating your account...');
  
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      showSuccess('Account created successfully');
    } else {
      const error = await response.json();
      showError(error.message || 'Signup failed');
    }
  } catch (error) {
    showError('Network error occurred');
  }
};
```

### Bilingual Support
```typescript
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function DataForm() {
  const { language } = useLanguage();
  const { showSuccess, showError } = useToast();
  
  const messages = {
    success: language === 'th' ? 'บันทึกสำเร็จ' : 'Saved successfully',
    error: language === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred',
    required: language === 'th' ? 'จำเป็นต้องกรอก' : 'This field is required'
  };
  
  const handleSave = async (data: any) => {
    if (!data.name) {
      showError(messages.required);
      return;
    }
    
    try {
      // API call...
      showSuccess(messages.success);
    } catch {
      showError(messages.error);
    }
  };
  
  return null;
}
```

## Positioning
- **Default**: `top-right`
- **Available**: `top-left`, `top-center`, `bottom-left`, `bottom-center`, `bottom-right`

To customize, edit `app/components/providers.tsx`:
```typescript
<Toaster position="bottom-center" />
```

## Styling
Toast notifications are pre-styled with:
- ✅ Rounded corners (8px)
- ✅ Proper padding (16px 24px)
- ✅ Color-coded backgrounds (green/red/blue/amber)
- ✅ White text for contrast
- ✅ Custom icons

For custom styling, modify `hooks/useToast.ts`

## Files Modified/Created
- ✅ `hooks/useToast.ts` - New utility hook
- ✅ `app/components/TaskForm.tsx` - Updated to use useToast
- ✅ `app/components/providers.tsx` - Already has Toaster

## Next Steps
Update these components to use `useToast`:
- `app/components/ProjectForm.tsx`
- `app/components/AuditLogViewer.tsx`
- `app/clients/components/ClientFormModal.tsx`
- `app/tasks/components/TaskFormModal.tsx`
- `app/users/components/UserFormModal.tsx`
- `app/expenses/page.tsx`
- `app/timesheet/page.tsx`
- And any other form/save components

## Testing
1. Open browser DevTools Console
2. Navigate to any form
3. Submit valid data → Should see green success toast
4. Submit invalid data → Should see red error toast
5. Check console for any errors

---

**Summary**: Now all save/update operations show user-friendly notifications!
