# Password Reset Implementation Guide

## Overview
This document describes the password reset functionality added to the project-manager-users module, including system authentication and access control.

## Features Implemented

### 1. Frontend Components

#### ProjectManagerUsers Page (src/pages/ProjectManagerUsers.tsx)
- **Reset Password Button**: Added KeyOutlined icon button in the Actions column
- **Functionality**: Admin can trigger password reset for any project manager
- **Confirmation Modal**: User must confirm before sending reset link
- **API Call**: POSTs to `/api/prisma/users/:id/reset-password`

#### ResetPassword Page (src/pages/auth/ResetPassword.tsx)
- **Enhanced Validation**: Strong password requirements
  - Minimum 8 characters
  - One uppercase letter (A-Z)
  - One lowercase letter (a-z)
  - One number (0-9)
  - One special character (!@#$%^&*)
- **Token Handling**: Extracts reset token from URL query parameter
- **Success Feedback**: Shows success message and redirects to login
- **Error Handling**: Displays validation and API errors

### 2. Backend API Endpoints

#### POST /api/prisma/users/:id/reset-password
Initiates password reset process for a user
- **Access**: Admin only (should be protected by middleware)
- **Parameters**: User ID in URL
- **Response**: Success message with user email
- **Implementation Status**: Base structure with TODO for email sending

#### POST /api/prisma/users/verify-reset-token
Verifies reset token and updates password
- **Parameters**: 
  - `token` (string): Reset token from email link
  - `newPassword` (string): New password (must meet requirements)
- **Response**: Success message or error
- **Implementation Status**: Base structure with TODO for token verification

### 3. Database Schema Changes

#### User Model Updates (prisma/schema.prisma)
Added two optional fields to support password reset:
```prisma
resetToken      String?         @db.Text
resetTokenExpires DateTime?      @db.Timestamptz(6)
```

#### Migration File
Location: `prisma/migrations/add_password_reset_fields/migration.sql`
- Adds `resetToken` and `resetTokenExpires` columns
- Creates index on `resetToken` for faster lookups

## Implementation Checklist

### Phase 1: Infrastructure (✓ Complete)
- [x] Add reset token fields to User schema
- [x] Create database migration
- [x] Update frontend components
- [x] Add backend endpoints

### Phase 2: Email Integration (TODO)
Requires:
1. Email service setup (SendGrid, AWS SES, Nodemailer, etc.)
2. Email template creation
3. Update `POST /api/prisma/users/:id/reset-password` to:
   - Generate cryptographically secure reset token
   - Hash token for storage
   - Save token and expiration to database
   - Send email with reset link

Example token generation:
```javascript
const crypto = require('crypto');
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenHash = await bcryptjs.hash(resetToken, 10);
```

### Phase 3: Token Verification (TODO)
Update `POST /api/prisma/users/verify-reset-token` to:
1. Find user with matching reset token
2. Verify token hasn't expired (compare with `resetTokenExpires`)
3. Verify password meets requirements
4. Hash new password
5. Update user record with new password
6. Clear reset token fields

## Security Considerations

### Current Implementation
- Passwords hashed with bcryptjs (salt rounds: 12)
- Form validation on frontend and backend
- Strong password requirements enforced

### Recommended Additions
1. **Rate Limiting**: Limit password reset requests per email/IP
2. **Token Expiration**: Set reasonable expiration (1 hour recommended)
3. **HTTPS Only**: Ensure reset links only work over HTTPS
4. **Audit Logging**: Log all password reset attempts
5. **Email Verification**: Verify user email before allowing reset
6. **Two-Factor Authentication**: Consider adding as additional security

## API Usage Examples

### Admin initiating password reset
```bash
POST /api/prisma/users/123e4567-e89b-12d3-a456-426614174000/reset-password
Headers: Content-Type: application/json
Auth: Bearer [admin-token]
```

Response:
```json
{
  "message": "Password reset link sent successfully",
  "email": "john.doe@company.com"
}
```

### User resetting password with token
```bash
POST /api/prisma/users/verify-reset-token
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "SecurePass123!"
}
```

Response:
```json
{
  "message": "Password reset successfully"
}
```

## Frontend URL Pattern
```
/reset-password?token=<reset_token_from_email>
```

## Testing Checklist

- [ ] Admin can see "Reset Password" button for each manager
- [ ] Confirmation modal appears when clicking button
- [ ] API endpoint returns success message
- [ ] Reset password page validates token presence
- [ ] Password meets all validation requirements
- [ ] Success page appears after reset
- [ ] Redirects to login after 2 seconds
- [ ] User can login with new password
- [ ] Invalid/expired tokens show error message

## File Locations

```
Frontend:
- src/pages/ProjectManagerUsers.tsx (Reset button UI)
- src/pages/auth/ResetPassword.tsx (Reset form)

Backend:
- server/routes/prisma-user-routes.js (API endpoints)

Database:
- prisma/schema.prisma (Data model)
- prisma/migrations/add_password_reset_fields/migration.sql (Migration)

Documentation:
- PASSWORD_RESET_IMPLEMENTATION.md (this file)
```

## Next Steps

1. **Email Service Integration**
   - Choose email provider
   - Set up environment variables
   - Implement email sending in reset endpoint

2. **Token Management**
   - Implement secure token generation
   - Add token verification logic
   - Set token expiration

3. **Testing**
   - Unit tests for password validation
   - Integration tests for API endpoints
   - E2E tests for user workflow

4. **Security Audit**
   - Review security best practices
   - Implement rate limiting
   - Add audit logging
   - Set up monitoring

## Related Files

- `AUTH_SYSTEM_DOCUMENTATION.md` - Overall authentication system
- `AUTH_IMPLEMENTATION_GUIDE.md` - Auth system implementation details
- `PROJECT_MANAGER_SETUP.md` - Project manager module setup
