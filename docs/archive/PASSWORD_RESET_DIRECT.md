# Direct Password Reset for Project Managers

## Overview
The password reset feature for project-manager-users now allows admins to directly set a new password for project managers without needing email verification or reset tokens.

## Features

### 1. Admin Reset Password Modal
- Access via "Reset Password" button (KeyOutlined icon) in ProjectManagerUsers table
- Opens a modal where admin can set a new password directly
- Shows confirmation form with password matching validation

### 2. Password Display and Copy
- After setting password, displays the new password in a secure display box
- Admin can copy password to clipboard with one click
- Clear instructions to share password securely with user

### 3. Secure Password Handling
- Passwords are hashed with bcryptjs (salt rounds: 12) before storage
- No plain-text passwords stored in database
- Admin cannot view the password again after closing modal

## User Workflow

### Admin Setting Password
1. Click "Reset Password" button for a project manager
2. Enter new password and confirm
3. Click "Set Password"
4. System confirms password has been updated
5. Copy password and share securely with user
6. Click "Close" to complete

### User Logging In
1. User receives password from admin via secure channel
2. User logs in with the new password
3. Optionally, user can change password in account settings

## Frontend Components

### ProjectManagerUsers.tsx
- **State Management**:
  - `isPasswordModalOpen`: Controls modal visibility
  - `passwordForm`: Handles form state and validation
  - `newPassword`: Stores password after successful update
  - `editingManager`: Reference to manager being modified

- **Key Functions**:
  - `handleResetPassword(manager)`: Opens password modal
  - `handlePasswordModalOk()`: Validates and submits password
  - `handleCopyPassword()`: Copies password to clipboard
  - `handleClosePasswordModal()`: Closes modal and resets state

- **Modal States**:
  - **Input State**: Shows form for entering new password
  - **Display State**: Shows password after successful update

## Backend API

### Endpoint: POST /api/prisma/users/:id/admin-reset-password
- **Purpose**: Admin directly sets user password
- **Request Body**:
  ```json
  {
    "newPassword": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password updated successfully",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string"
    }
  }
  ```
- **Error Handling**:
  - 400: Missing newPassword parameter
  - 404: User not found
  - 500: Server error

### Database Update
Uses existing `PUT /api/prisma/users/:id` endpoint with password field
- Finds user by ID
- Hashes password with bcryptjs
- Updates password field
- Clears any existing reset tokens

## Security Considerations

### Current Implementation
- Passwords hashed with bcryptjs (12 salt rounds)
- Form validation on frontend and backend
- Copy-to-clipboard feature for secure sharing
- No password stored in logs or audit trails
- Password is transient and displayed only once

### Recommended Enhancements
1. **Access Control**: Restrict to admin role only
   ```javascript
   // In backend middleware
   router.post('/users/:id/admin-reset-password', authenticateAdmin, resetPassword);
   ```

2. **Audit Logging**: Log all password reset attempts
   ```javascript
   await prisma.auditLog.create({
     data: {
       action: 'PASSWORD_RESET',
       userId: req.user.id,
       targetUserId: req.params.id,
       timestamp: new Date()
     }
   });
   ```

3. **Rate Limiting**: Prevent abuse
   ```javascript
   const rateLimit = require('express-rate-limit');
   const resetLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5 // limit each IP to 5 requests per windowMs
   });
   ```

4. **Temporary Password**: Auto-generate strong password
   ```javascript
   const generatePassword = () => {
     return require('generate-password').generate({
       length: 16,
       numbers: true,
       symbols: true,
       uppercase: true,
       lowercase: true
     });
   };
   ```

5. **Force Password Change**: Require user to change on first login
   ```javascript
   // Add to User schema
   mustChangePassword: Boolean @default(true)
   ```

## Migration from Email Reset
If migrating from email-based reset:
1. Remove reset token fields (or keep for backward compatibility)
2. Update frontend to use new modal
3. Remove email sending logic
4. Update API endpoints
5. Test with existing password reset links (should fail gracefully)

## Testing Checklist

- [ ] Admin can click "Reset Password" button
- [ ] Password modal opens correctly
- [ ] Form validates password and confirmation match
- [ ] API call succeeds and password is updated
- [ ] New password displays in modal
- [ ] "Copy Password" button works
- [ ] User can login with new password
- [ ] Old password no longer works
- [ ] Modal can be closed after copying password
- [ ] Error messages display correctly on API failure

## File Locations

```
Frontend:
- src/pages/ProjectManagerUsers.tsx (Reset password modal UI)

Backend:
- server/routes/prisma-user-routes.js (Admin reset endpoint)

Documentation:
- PASSWORD_RESET_DIRECT.md (this file)
- PASSWORD_RESET_IMPLEMENTATION.md (legacy email reset approach)
```

## Example Usage

### Setting a Project Manager's Password

```bash
curl -X POST http://localhost:5000/api/prisma/users/550e8400-e29b-41d4-a716-446655440000/admin-reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "newPassword": "SecurePassword123!"
  }'
```

Response:
```json
{
  "message": "Password updated successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john.doe@company.com"
  }
}
```

### Admin Workflow in UI
1. Navigate to Project Manager Users page
2. Find the user to reset password for
3. Click the key icon in the Actions column
4. Enter new password (min 8 characters)
5. Confirm password matches
6. Click "Set Password"
7. Copy the displayed password
8. Share securely with the user
9. Click "Close"
