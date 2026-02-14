# ✅ CRUD Implementation Checklist

**Start Date:** February 14, 2026  
**Estimated Completion:** February 16, 2026  
**Status:** Ready to Begin

---

## 📋 Phase 1: Delete Confirmations (2-3 hours)

### Users Module
**File:** `next-app/app/users/page.tsx`

- [ ] Import `DeleteConfirmationDialog` from components
- [ ] Add state: `const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);`
- [ ] Create `deleteUserMutation` with success/error handlers
- [ ] Create `handleDeleteClick()` function (opens modal)
- [ ] Create `handleConfirmDelete()` function (executes delete)
- [ ] Update dropdown menu delete item (call `handleDeleteClick`)
- [ ] Add `<DeleteConfirmationDialog />` component at end of page
- [ ] Test: Delete button shows modal
- [ ] Test: Cancel closes modal without deleting
- [ ] Test: Confirm deletes and shows success toast
- [ ] Test: Error shows error toast
- [ ] Test: Data list refreshes after delete
- [ ] Reference: See `app/users/page-improved.tsx` for complete example

### Tasks Module
**File:** `next-app/app/tasks/page.tsx`

- [ ] Replace `window.confirm()` at line 68 with delete modal
- [ ] Import `DeleteConfirmationDialog` component
- [ ] Add state for `deleteConfirm`
- [ ] Create `handleDeleteClick()` and `handleConfirmDelete()`
- [ ] Add useMutation for deleteTask with toast handlers
- [ ] Update dropdown menu to call `handleDeleteClick`
- [ ] Add modal component
- [ ] Test all scenarios (cancel, confirm, error)

### Clients Module
**File:** `next-app/app/clients/page.tsx`

- [ ] Replace `window.confirm()` at line 64 with delete modal
- [ ] Follow same pattern as Tasks module
- [ ] Test all scenarios

### Projects Module
**File:** `next-app/app/projects/page.tsx`

- [ ] Find `deleteProjectMutation` (around line 300)
- [ ] Add `onSuccess` handler: `toast.success('✅ ลบโครงการสำเร็จแล้ว')`
- [ ] Add `onError` handler: `toast.error('❌ ลบไม่สำเร็จ: ' + error.message)`
- [ ] Test: Success toast appears after delete
- [ ] Test: Error toast appears on failure

**Status: Phase 1**
- [ ] All 4 modules have delete confirmations
- [ ] No `window.confirm()` usage
- [ ] All delete operations show toasts
- [ ] Data refreshes after delete

---

## 📋 Phase 2: Input Validation (3-4 hours)

### Create Validation Library
**File:** `next-app/lib/validation.ts`

- [x] File created with validation utilities
- [ ] Email validation function
- [ ] Thai Tax ID validation (13 digits)
- [ ] Phone validation (Thailand format)
- [ ] Budget validation (positive number)
- [ ] Date range validation
- [ ] Password validation
- [ ] Bulk form validation helper
- [ ] Test validation functions with unit tests

### Update Clients Form Modal
**File:** `next-app/app/clients/components/ClientFormModal.tsx`

- [ ] Import validation functions from `lib/validation`
- [ ] Add form state for errors: `const [errors, setErrors] = useState<Record<string, string>>({})`
- [ ] Add validation for required fields (name)
- [ ] Add email format validation
- [ ] Add Tax ID 13-digit validation
- [ ] Add phone format validation
- [ ] Display error messages under each field
- [ ] Clear errors when user corrects input
- [ ] Test: Invalid email shows error
- [ ] Test: Invalid Tax ID shows error
- [ ] Test: Invalid phone shows error
- [ ] Test: Form prevents submission with errors
- [ ] Test: Success after correction

### Update Projects Form
**File:** `next-app/components/ProjectForm.tsx` (or wherever the form is)

- [ ] Add validation for date range
- [ ] Add validation for budget (non-negative)
- [ ] Display error messages
- [ ] Test: End date before start date shows error
- [ ] Test: Negative budget shows error

### Update Users Form
**File:** `next-app/app/users/page.tsx` (form section)

- [ ] Review existing validation (already good)
- [ ] Ensure all validations have error messages
- [ ] Test existing validations still work

**Status: Phase 2**
- [ ] All validation functions created and tested
- [ ] All required fields validated
- [ ] Email format validated in clients
- [ ] Tax ID 13-digit validated in clients
- [ ] Phone format validated in clients
- [ ] Date range validated in projects
- [ ] Budget validated in projects
- [ ] Error messages display below fields
- [ ] Form prevents submission with errors

---

## 📋 Phase 3: Toast Notifications (2-3 hours)

### Audit All Modules for Missing Toasts

#### Projects Module
**File:** `next-app/app/projects/page.tsx`

- [ ] Create toast: ✅ (check ProjectCreationWizard)
- [ ] Update toast: ✅ (check ProjectForm)
- [ ] Delete toast: ✅ (added in Phase 1)

#### Users Module
**File:** `next-app/app/users/page.tsx`

- [ ] Create toast: ✅ 'สร้างผู้ใช้สำเร็จ'
- [ ] Update toast: ✅ 'อัปเดตผู้ใช้สำเร็จ'
- [ ] Delete toast: ✅ 'ลบผู้ใช้สำเร็จ'
- [ ] Validation error toasts: ✅

#### Tasks Module
**File:** `next-app/app/tasks/page.tsx` & `TaskFormModal.tsx`

- [ ] Create toast: ✅ 'Task created successfully'
- [ ] Update toast: ✅ 'Task updated successfully'
- [ ] Delete toast: ✅ 'Task deleted successfully'
- [ ] Error toasts: ✅

#### Clients Module
**File:** `next-app/app/clients/page.tsx` & `ClientFormModal.tsx`

- [ ] Create toast: ✅ 'Client created successfully'
- [ ] Update toast: ✅ 'Client updated successfully'
- [ ] Delete toast: ✅ 'Client deleted successfully'
- [ ] Validation error toasts: ⏳ (add in Phase 2)

#### Expenses Module
**File:** `next-app/app/approvals/expenses/page.tsx`

- [ ] Approval toast: Check existing
- [ ] Rejection toast: Check existing
- [ ] Delete toast: ⏳ (add in Phase 4)
- [ ] Error toasts: ⏳

### Standardize Toast Messages
**Reference:** `CRUD_QUICK_FIXES.md` Section 7

- [ ] Use consistent emoji: ✅ ❌ 💾 🗑️
- [ ] Use Thai language for primary users
- [ ] Use 4-second duration for success
- [ ] Use 5-second duration for errors
- [ ] Show field name in validation errors

**Status: Phase 3**
- [ ] All create operations have success toasts
- [ ] All update operations have success toasts
- [ ] All delete operations have success toasts
- [ ] All operations have error toasts
- [ ] Messages are consistent across modules
- [ ] Messages are in Thai language
- [ ] Emoji icons are used consistently

---

## 📋 Phase 4: Delete Functionality (2-3 hours)

### Expenses Module Delete
**File:** `next-app/app/approvals/expenses/page.tsx`

- [ ] Check if DELETE API route exists
- [ ] If missing, create route at `next-app/app/api/expenses/[id]/route.ts`
- [ ] Add delete handler function
- [ ] Add delete confirmation modal
- [ ] Add delete button/action to UI
- [ ] Add success toast
- [ ] Add error toast
- [ ] Test: Delete button appears
- [ ] Test: Confirmation modal shows
- [ ] Test: Delete sends API request
- [ ] Test: Success toast shows
- [ ] Test: Data refreshes
- [ ] Test: Error handling works

### Verify Other Modules Don't Soft-Delete
**Files to check:**
- [ ] Projects - hard delete or soft delete?
- [ ] Users - hard delete or soft delete?
- [ ] Tasks - hard delete or soft delete?
- [ ] Clients - hard delete or soft delete?
- [ ] Expenses - hard delete or soft delete?

**If soft-delete (marked as deleted, not actually removed):**
- [ ] Update confirmation modal message
- [ ] Update success toast message
- [ ] Document soft-delete behavior

**Status: Phase 4**
- [ ] All modules support delete
- [ ] Delete confirmations in place
- [ ] Delete toasts showing
- [ ] Data consistency maintained
- [ ] No orphaned records

---

## 📋 Phase 5: Testing & QA (2-3 hours)

### Unit Tests
**Files:** `tests/validation.test.ts`, `tests/forms.test.ts`

- [ ] Test email validation
- [ ] Test Thai Tax ID validation
- [ ] Test phone validation
- [ ] Test date range validation
- [ ] Test budget validation
- [ ] Test form submission with valid data
- [ ] Test form submission with invalid data
- [ ] Test error state management

### E2E Tests
**Files:** `tests/e2e/*.spec.ts`

Create tests for each module:

#### Projects E2E
- [ ] Create project flow
- [ ] Update project flow
- [ ] Delete project with confirmation
- [ ] Validate date ranges
- [ ] Validate budget

#### Users E2E
- [ ] Create user with validation
- [ ] Update user
- [ ] Delete user with confirmation
- [ ] Email validation

#### Tasks E2E
- [ ] Create task
- [ ] Update task
- [ ] Delete task with confirmation

#### Clients E2E
- [ ] Create client with validation
- [ ] Update client
- [ ] Delete client with confirmation
- [ ] Tax ID validation
- [ ] Phone validation

#### Expenses E2E
- [ ] Delete expense with confirmation
- [ ] Approval/rejection workflow

### Manual Testing

#### Projects
- [ ] Create button works
- [ ] Edit button works
- [ ] Delete button shows modal
- [ ] Cancel doesn't delete
- [ ] Confirm deletes
- [ ] Success toast shows
- [ ] List refreshes
- [ ] Date validation works
- [ ] Budget validation works

#### Users
- [ ] Add user button works
- [ ] Form validation works
- [ ] Email format check works
- [ ] Password requirement works
- [ ] Edit user works
- [ ] Delete shows modal (not confirm)
- [ ] Success/error toasts show
- [ ] List refreshes

#### Tasks
- [ ] Create task works
- [ ] Edit task works
- [ ] Delete shows modal
- [ ] Required field validation works
- [ ] Toasts show

#### Clients
- [ ] Create client works
- [ ] Edit client works
- [ ] Delete shows modal
- [ ] Email validation works
- [ ] Tax ID validation works
- [ ] Phone validation works
- [ ] Error messages show
- [ ] Toasts show

#### Expenses
- [ ] Approve expense works
- [ ] Reject expense works
- [ ] Delete button shows
- [ ] Delete confirmation shows
- [ ] Delete works
- [ ] Toast shows

### Responsive Design
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1024px+)
- [ ] Modal works on small screens
- [ ] Forms are usable on mobile
- [ ] Tables scroll properly

### Accessibility
- [ ] Tab navigation works
- [ ] Enter key submits forms
- [ ] Escape closes modals
- [ ] Error messages are read by screen readers
- [ ] Form labels are associated with inputs
- [ ] Icons have aria-labels

### Dark Mode
- [ ] All forms visible in dark mode
- [ ] All toasts visible in dark mode
- [ ] Modal readable in dark mode
- [ ] Error messages visible
- [ ] Icons visible

### Performance
- [ ] No console errors
- [ ] No memory leaks
- [ ] Form submission completes in <2 seconds
- [ ] List refresh completes in <1 second
- [ ] Modal opens instantly
- [ ] No unnecessary re-renders

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Chrome Mobile

**Status: Phase 5**
- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] All manual tests documented
- [ ] No regressions found
- [ ] Performance acceptable
- [ ] Accessibility standards met

---

## 📋 Phase 6: Code Review & Deployment (1-2 hours)

### Code Quality
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Consistent code style
- [ ] TypeScript types complete
- [ ] No `any` types
- [ ] Functions properly documented
- [ ] Error handling comprehensive

### Documentation
- [ ] README updated if needed
- [ ] Code comments for complex logic
- [ ] Validation rules documented
- [ ] API changes documented
- [ ] Breaking changes noted

### Team Review
- [ ] Code reviewed by peer
- [ ] No merge conflicts
- [ ] Changes approved
- [ ] QA approved

### Deployment
- [ ] Build succeeds: `npm run build`
- [ ] No build warnings
- [ ] Tests pass: `npm run test:unit`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Deploy to staging
- [ ] Smoke test in staging
- [ ] Deploy to production
- [ ] Monitor for errors

### Post-Deployment
- [ ] Check logs for errors
- [ ] Verify all CRUD operations work
- [ ] Check user feedback
- [ ] Monitor performance metrics

**Status: Phase 6**
- [ ] Code review completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Deployed successfully
- [ ] No critical issues

---

## 📊 Progress Tracking

### Phase 1: Delete Confirmations
**Target:** 100% of modules use modals, 0% use window.confirm()
```
Users:    [ ] 0% [ ] 25% [ ] 50% [ ] 75% [✓] 100%
Tasks:    [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Clients:  [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Projects: [ ] 0% [ ] 25% [ ] 50% [ ] 75% [✓] 100%
```

### Phase 2: Input Validation
**Target:** 100% of forms have validation, 100% show errors
```
Email:    [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Tax ID:   [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Phone:    [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Dates:    [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Budget:   [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
```

### Phase 3: Toast Notifications
**Target:** 100% of operations show feedback
```
Creates:  [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Updates:  [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Deletes:  [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Errors:   [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
```

### Phase 4: Delete Functionality
**Target:** 100% of modules support delete
```
Expenses: [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
```

### Phase 5: Testing
**Target:** 100% test coverage
```
Unit:     [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
E2E:      [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
Manual:   [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] 100%
```

---

## 🎯 Summary

**Total Items:** 120+
**Estimated Time:** 11-13 hours
**Timeline:** 3-4 days

### Quick Links
- Audit Report: `CRUD_SYSTEM_AUDIT.md`
- Implementation Guide: `CRUD_IMPLEMENTATION_STEPS.md`
- Quick Fixes: `CRUD_QUICK_FIXES.md`
- Summary: `CRUD_IMPLEMENTATION_SUMMARY.md`
- Validation Library: `next-app/lib/validation.ts`
- Delete Component: `next-app/components/DeleteConfirmationDialog.tsx`
- Reference Example: `next-app/app/users/page-improved.tsx`

---

**Last Updated:** 2026-02-14  
**Status:** Ready to Begin  
**Owner:** [Your Name]  

---

## Notes

- [ ] Team informed of changes
- [ ] Stakeholders updated
- [ ] Blockers identified and removed
- [ ] Resources allocated

---

Good luck! 🚀
