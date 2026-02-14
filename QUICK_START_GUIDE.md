# Quick Start Guide - CRUD System Usage

## Frontend - Using Validation

### Simple Validation
```typescript
import { validateEmail, validateRequired } from '@/lib/validation';

// Check if email is valid
const emailError = validateEmailMessage('test@example.com');
if (emailError) {
  console.error(emailError);
}

// Check if required field is filled
const nameError = validateRequired(formData.name, 'Name');
```

### In Form Submission
```typescript
const handleSubmit = async (data) => {
  // Validate
  const titleError = validateRequired(data.title, 'Title');
  if (titleError) {
    toastValidationError(undefined, titleError);
    return;
  }

  // Save
  try {
    await saveData(data);
    toastCreateSuccess('Item');
  } catch (error) {
    toastError('save', error.message);
  }
};
```

---

## Frontend - Using Toast Notifications

### Success Messages
```typescript
import { 
  toastCreateSuccess, 
  toastUpdateSuccess, 
  toastDeleteSuccess 
} from '@/lib/toast-utils';

// After creating
toastCreateSuccess('User');           // "✅ Successfully created User"

// After updating
toastUpdateSuccess('Task');           // "✅ Successfully updated Task"

// After deleting
toastDeleteSuccess('Expense');        // "✅ Successfully deleted Expense"
```

### Error Handling
```typescript
import { toastError, toastValidationError } from '@/lib/toast-utils';

// Validation error
if (!email) {
  toastValidationError(undefined, 'Email is required');
  return;
}

// Operation error
try {
  await saveData();
} catch (error) {
  toastError('save', error.message);  // "❌ [error message]"
}
```

### Network & Permission Errors
```typescript
import { toastNetworkError, toastUnauthorized } from '@/lib/toast-utils';

try {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 401) {
      toastUnauthorized();
    } else {
      toastNetworkError();
    }
  }
} catch {
  toastNetworkError();
}
```

---

## Frontend - Language Switching

### Check Current Language
```typescript
import { getPreferredLanguage } from '@/lib/toast-utils';

const lang = getPreferredLanguage();  // 'en' or 'th'
```

### Set Language Preference
```typescript
// In user settings or language selector
localStorage.setItem('language', 'th');  // Set to Thai
localStorage.setItem('language', 'en');  // Set to English

// Toast messages will automatically localize on next display
```

### Bilingual Messages
All toast functions automatically use the language setting:

**English** (when `localStorage.language === 'en'`):
```
✅ Successfully created User
✅ Successfully updated Task
❌ Failed to delete
⚠️ [Field] is required
📡 Network error. Check connection
```

**Thai** (when `localStorage.language === 'th'` - default):
```
✅ สร้างสำเร็จ User
✅ อัปเดตสำเร็จ Task
❌ ลบล้มเหลว
⚠️ [Field] ไม่ถูกต้อง
📡 ข้อผิดพลาดด้านเครือข่าย
```

---

## Backend - Creating a New Feature Module

### 1. Create Folder Structure
```bash
mkdir -p backend/src/features/[feature]/{controllers,routes,schemas,services,types}
```

### 2. Create Types File
```typescript
// backend/src/features/[feature]/types/[feature]Types.ts
export interface [Feature] {
  id: string;
  name: string;
  // ... other fields
}

export interface Create[Feature]DTO {
  name: string;
  // ... other fields
}
```

### 3. Create Validation Schemas
```typescript
// backend/src/features/[feature]/schemas/[feature]Schemas.ts
import Joi from 'joi';

export const create[Feature]Schema = Joi.object({
  name: Joi.string().min(1).required(),
  // ... other validations
});
```

### 4. Create Service
```typescript
// backend/src/features/[feature]/services/[Feature]Service.ts
export class [Feature]Service {
  async get[Features]() { /* ... */ }
  async get[Feature]ById(id: string) { /* ... */ }
  async create[Feature](data) { /* ... */ }
  async update[Feature](id: string, data) { /* ... */ }
  async delete[Feature](id: string) { /* ... */ }
}
```

### 5. Create Controller
```typescript
// backend/src/features/[feature]/controllers/[Feature]Controller.ts
export class [Feature]Controller {
  private [feature]Service: [Feature]Service;

  constructor() {
    this.[feature]Service = new [Feature]Service();
  }

  get[Features] = async (req, res, next) => {
    try {
      const result = await this.[feature]Service.get[Features]();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
```

### 6. Create Routes
```typescript
// backend/src/features/[feature]/routes/[feature]Routes.ts
import { Router } from 'express';
import { [Feature]Controller } from '../controllers/[Feature]Controller';
import { authMiddleware } from '../../../shared/middleware/authMiddleware';
import { validateRequest } from '../../../shared/middleware/validateRequest';
import { create[Feature]Schema } from '../schemas/[feature]Schemas';

const router = Router();
const controller = new [Feature]Controller();

router.use(authMiddleware);
router.get('/', controller.get[Features]);
router.get('/:id', controller.get[Feature]ById);
router.post('/', validateRequest(create[Feature]Schema), controller.create[Feature]);
router.put('/:id', validateRequest(update[Feature]Schema), controller.update[Feature]);
router.delete('/:id', controller.delete[Feature]);

export { router as [feature]Routes };
```

### 7. Register in app.ts
```typescript
import { [feature]Routes } from './features/[feature]/routes/[feature]Routes';

app.use('/api/[features]', [feature]Routes);
```

---

## Common Validation Patterns

### Required Text Field
```typescript
const nameError = validateRequired(data.name, 'Name');
const nameError2 = validateMinLength(data.name, 2, 'Name');
```

### Email Field
```typescript
const emailError = validateEmailMessage(data.email);
```

### Phone Field (Thailand)
```typescript
const phoneError = validatePhoneMessage(data.phone);
```

### Tax ID (Thailand - 13 digits)
```typescript
const taxIdError = validateThaiTaxIdMessage(data.taxId);
```

### Budget/Amount
```typescript
const budgetError = validateBudgetMessage(data.budget);
const amountError = validatePositiveNumber(data.amount, 'Amount');
```

### Date Range
```typescript
const dateError = validateDateRangeMessage(data.startDate, data.endDate);
```

---

## Common Toast Patterns

### Simple Success
```typescript
try {
  await operation();
  toastCreateSuccess('Item');
} catch (error) {
  toastError('create', error.message);
}
```

### With Loading State
```typescript
const handleSubmit = async () => {
  const id = toastLoading('Saving...');
  try {
    await save();
    dismissToast(id);
    toastCreateSuccess('Item');
  } catch (error) {
    dismissToast(id);
    toastError('save', error.message);
  }
};
```

### Delete Confirmation
```typescript
// Already implemented in DeleteConfirmationDialog component
import DeleteConfirmationDialog from '@/app/components/DeleteConfirmationDialog';

<DeleteConfirmationDialog
  open={isDeleteOpen}
  title="Delete User"
  description="This cannot be undone"
  entityName={user.name}
  onConfirm={handleDelete}
  onCancel={handleCancel}
  isDangerous={true}
/>
```

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* ... */ }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "details (dev only)"
}
```

---

## Testing

### Test Validation
```typescript
import { validateEmail, validateRequired } from '@/lib/validation';

describe('validation', () => {
  it('should validate email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });

  it('should validate required field', () => {
    expect(validateRequired('value', 'Field')).toBeNull();
    expect(validateRequired('', 'Field')).toContain('required');
  });
});
```

### Test Toast
```typescript
import { toastCreateSuccess, toastError } from '@/lib/toast-utils';

jest.mock('react-hot-toast');

describe('toast-utils', () => {
  it('should show success toast', () => {
    toastCreateSuccess('User');
    expect(toast.success).toHaveBeenCalled();
  });
});
```

---

## Troubleshooting

### Toast Not Showing
1. Check that Toaster component is in layout
2. Verify import path: `import { toast } from 'react-hot-toast'`
3. Check browser console for errors

### Validation Not Working
1. Ensure import from `@/lib/validation`
2. Check that error state is being displayed
3. Verify validation function is being called

### Backend API Not Working
1. Verify route is registered in `app.ts`
2. Check middleware order (auth before validation)
3. Review service layer logic
4. Check database connection

### Language Not Changing
1. Verify `localStorage.setItem('language', 'en')`
2. Clear localStorage cache
3. Check that toast has been created after language change

---

## Quick Commands

### Frontend
```bash
npm run dev                # Start dev server
npm run test:unit         # Run tests
npm run build            # Production build
npm run lint             # Check style
```

### Backend
```bash
npm run dev:backend      # Start backend
npm run build            # TypeScript compilation
npm run test             # Run tests
npm run db:seed          # Reset database
```

### Both
```bash
npm run dev:all          # Start both frontend and backend
npm run install:all      # Install dependencies
```

---

## File Locations

| Component | Location |
|-----------|----------|
| Validation | `next-app/lib/validation.ts` |
| Toast Utils | `next-app/lib/toast-utils.ts` |
| Delete Dialog | `next-app/app/components/DeleteConfirmationDialog.tsx` |
| Backend Types | `backend/src/features/[feature]/types/` |
| Backend Schemas | `backend/src/features/[feature]/schemas/` |
| Backend Service | `backend/src/features/[feature]/services/` |
| Backend Controller | `backend/src/features/[feature]/controllers/` |
| Backend Routes | `backend/src/features/[feature]/routes/` |

---

## References

- `CRUD_SYSTEM_STATUS.md` - Complete status overview
- `CRUD_PHASE2_VALIDATION.md` - Validation details
- `CRUD_PHASE3_COMPLETE.md` - Toast details
- `BACKEND_PHASE4_EXPENSES.md` - Backend implementation
- `AGENTS.md` - Project commands and architecture

---

**Last Updated**: 2026-02-14
**Version**: 1.0
