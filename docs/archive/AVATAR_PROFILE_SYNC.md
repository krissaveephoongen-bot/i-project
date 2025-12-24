# Avatar Profile & Settings Synchronization

## Overview
Avatar profile and user information are now synchronized across the Settings page and Sidebar component.

## Changes Made

### 1. Settings Page (`src/pages/Settings.tsx`)
- **Added avatar field** to `UserSettings` interface
- **Created avatar upload section** with:
  - Image preview (132x132px with rounded corners)
  - "Choose Photo" button with file input (accept image files)
  - File size validation (max 5MB)
  - "Remove Photo" button to clear avatar
- **Avatar handling**:
  - Converts uploaded image to Base64 for storage
  - Displays preview immediately before saving
  - Includes upload state management with `uploading` flag
- **Profile save** includes avatar data in PUT request:
  ```typescript
  body: JSON.stringify({
    name: `${profile.firstName} ${profile.lastName}`,
    phone: profile.phone,
    department: profile.department,
    avatar: profile.avatar,  // New field
  })
  ```

### 2. Sidebar Component (`src/components/layout/Sidebar.tsx`)
- **Avatar display** in user profile footer:
  - Shows uploaded avatar image if available
  - Falls back to first letter of email if no avatar
  - Circular design (8x8px) with gradient background
- **Synced data**:
  - Displays `currentUser?.avatar` from context
  - Shows `currentUser?.displayName || currentUser?.name || 'User'` for name
  - Pulls from auth context automatically

### 3. AuthContext (`src/contexts/AuthContext.tsx`)
- **Extended `AuthUser` type** with additional fields:
  ```typescript
  avatar?: string;
  phone?: string;
  department?: string;
  timezone?: string;
  displayName?: string;
  ```
- **Updated context type** to support all user fields
- All new fields are optional and propagate through context value

## How It Works

### Data Flow
```
Settings Page
  ↓ (file upload)
Avatar Preview + Profile State
  ↓ (save click)
API PUT /api/prisma/users/{id}
  ↓ (avatar saved to database)
AuthContext Updates (on next auth refresh)
  ↓
Sidebar Component Refreshes
```

### Avatar Storage
- Avatar stored as **Base64 string** in database
- Field: `avatar` in users table
- Type: `String` (TEXT field to accommodate large base64)

## Usage

### For Users
1. Navigate to **Settings → Profile**
2. Click **"Choose Photo"** button
3. Select an image (JPG, PNG, or GIF, max 5MB)
4. Review preview
5. Click **"Save Changes"** button
6. Avatar updates in Sidebar immediately on page refresh

### For Developers
Avatar field can be accessed from:
```typescript
// In Settings page
profile.avatar  // User's avatar as base64

// In Sidebar/Components
currentUser?.avatar  // From auth context
```

## API Integration

### Save Avatar
```typescript
PUT /api/prisma/users/{userId}
Body: {
  avatar: string (base64)  // Optional
}
```

### Database Schema
The `users` table already supports avatar field:
```sql
avatar String?  -- Optional avatar data
```

## Testing

### Manual Testing
1. Login to application
2. Go to Settings page
3. Upload a profile picture
4. Verify preview shows
5. Save changes
6. Check Sidebar avatar updates
7. Logout and login again
8. Verify avatar persists

### Files Changed
- `src/pages/Settings.tsx` - Avatar section + form updates
- `src/components/layout/Sidebar.tsx` - Avatar display from context
- `src/contexts/AuthContext.tsx` - Extended user type with avatar fields

## Future Enhancements
- [ ] Cloud storage integration (S3, Firebase Storage)
- [ ] Image compression before upload
- [ ] Crop/edit image before saving
- [ ] Avatar validation (dimensions, aspect ratio)
- [ ] Progress bar during upload
- [ ] Drag & drop avatar upload
