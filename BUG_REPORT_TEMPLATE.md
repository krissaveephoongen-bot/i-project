# Bug Report Template

## 🐛 BUG DETAILS

### Title
_Brief, descriptive title of the bug_

Example: "Cannot delete client when project references it"

---

### Severity Level
Choose one:
- 🔴 **CRITICAL** - Application crash, data loss, security issue
- 🟠 **HIGH** - Major feature broken, blocking workflow
- 🟡 **MEDIUM** - Feature partially broken or workaround exists
- 🟢 **LOW** - Minor visual issue or edge case

---

### Affected Feature
- [ ] Clients
- [ ] Projects
- [ ] Timesheet
- [ ] Users
- [ ] Expenses
- [ ] Approvals
- [ ] Authentication
- [ ] Other: ___________

---

### CRUD Operation
- [ ] CREATE (Adding new items)
- [ ] READ (Viewing items)
- [ ] UPDATE (Editing items)
- [ ] DELETE (Removing items)
- [ ] Search/Filter
- [ ] Export
- [ ] Other: ___________

---

## 📍 LOCATION

**Page URL:** `/clients`

**Component:** ClientFormModal

**Module:** Client Management

---

## 📝 DESCRIPTION

### Summary
_One sentence describing what's wrong_

"Users cannot create clients with Thai characters in the name field"

### Expected Behavior
_What should happen_

When a user enters a client name with Thai characters (e.g., "บริษัท จำกัด") and submits the form, the system should:
- Accept the Thai text without error
- Display it correctly in the client list
- Save it properly to the database

### Actual Behavior
_What actually happens_

When a user enters Thai characters in the client name field and clicks "Create Client", the form shows an error: "Invalid characters in name field" but the field accepts English characters fine.

### Difference
The system rejects valid Thai text while accepting English, suggesting a character encoding or validation issue.

---

## 🔧 REPRODUCTION

### Steps to Reproduce
1. Navigate to `/clients`
2. Click "New Client" button
3. Fill in the form:
   - **Name:** "บริษัท ทดสอบ จำกัด"
   - **Email:** test@company.com
   - **Phone:** 02-123-4567
4. Click "Create Client"
5. Observe the error message

### Prerequisites
- User logged in with Employee role
- Client list has at least one existing client
- Browser supports Thai input method

### Can reproduce
- [ ] Always
- [ ] Usually (80% of the time)
- [ ] Intermittently (50% of the time)
- [ ] Rarely (20% of the time)
- [ ] Cannot reproduce

---

## 📸 SCREENSHOTS & LOGS

### Screenshot 1: Form with Thai Characters
[Paste screenshot here]
_Description: Shows form filled with Thai text and error message_

### Screenshot 2: Error Message
[Paste screenshot here]
_Description: Shows specific error text in red_

### Browser Console Error
```
Error: Invalid characters in name field
  at validateClientName (validation.js:42)
  at ClientFormModal.tsx:95
Stack trace:
  ...
```

### Network Request
```
POST /api/clients
Request Payload:
{
  "name": "บริษัท ทดสอบ จำกัด",
  "email": "test@company.com",
  "phone": "02-123-4567",
  "taxId": "",
  "address": "",
  "notes": ""
}

Response:
{
  "error": "Invalid characters in name field",
  "status": 400
}
```

---

## 🌍 ENVIRONMENT

### Application
- **Version:** v1.0
- **Environment:** Local Development
- **Deployment:** Not deployed yet

### Browser
- **Name:** Chrome
- **Version:** 131.0.6778.205
- **OS:** Windows 11 Pro
- **Screen Resolution:** 1920 x 1080
- **Is Mobile:** No

### Network
- **Speed:** Broadband (Fast)
- **Proxy:** None
- **VPN:** No

### Database
- **Type:** PostgreSQL
- **Environment:** Docker (Local)
- **Connection:** Direct

### API
- **Backend Status:** Running on localhost:3001
- **Frontend Status:** Running on localhost:3000
- **Last Deploy:** N/A (Local dev)

---

## 🧪 TESTING INFO

### When Discovered
- **Date:** February 16, 2025
- **Time:** 2:30 PM
- **Tester:** [Your Name]
- **Test Cycle:** CRUD Testing Phase 1

### First Occurrence
- [ ] First time seen
- [ ] Seen multiple times
- [x] Reported before (Bug #123)

### Previous Report
If seen before, link to issue: #123

---

## 🔍 ANALYSIS

### Probable Cause
_Your best guess at what's causing this (optional)_

The validation function in `validation.ts` line 42 likely has a regex pattern that only accepts ASCII characters. The pattern should be updated to support Unicode (Thai) characters.

Suspected file: `lib/validation.ts`
Suspected function: `validateClientName()`
Suspected line: 42

### Possible Duplicate
Could this be related to:
- [ ] Bug #456 - Cannot search with Thai characters
- [ ] Bug #789 - Descriptions don't support Thai

---

## 📊 IMPACT

### Scope
- [ ] Only affects me
- [x] Affects feature
- [ ] Affects multiple features
- [ ] Affects entire application

### Users Affected
- **Role:** Employee / Manager / Admin
- **Approximate Count:** 5+ users with Thai businesses

### Workaround
_Temporary solution while waiting for fix_

Use English transliteration instead:
- ✅ Works: "Borisat Somsai Co Ltd"
- ❌ Doesn't work: "บริษัท สมใจ จำกัด"

---

## 💾 DATA

### Sample Data
If applicable, provide sample data that causes the issue:

```json
{
  "name": "บริษัท ทดสอบ จำกัด",
  "email": "test@testcompany.co.th",
  "phone": "02-123-4567",
  "taxId": "1234567890123",
  "address": "123 ถนนสีลม, กรุงเทพฯ",
  "notes": "ทดสอบเท่านั้น"
}
```

### Affected Records
- Total records affected: 3 clients
- Record IDs: client_001, client_003, client_007

---

## 🔗 RELATED ISSUES

### Linked Issues
- Bug #234 - Email validation too strict
- Feature #567 - Thai language support
- Bug #890 - UTF-8 encoding issues

---

## 📋 CHECKLIST

Before submitting, verify:
- [x] Described steps to reproduce clearly
- [x] Included screenshots/error messages
- [x] Specified environment details
- [x] Searched for duplicates
- [x] Title is descriptive
- [x] Added severity level
- [x] Included expected vs actual behavior

---

## 👤 REPORTER INFORMATION

| Field | Value |
|-------|-------|
| **Name** | [Your Name] |
| **Email** | [Your Email] |
| **Role** | QA Tester |
| **Department** | Quality Assurance |
| **Date Reported** | February 16, 2025 |
| **Time Reported** | 2:30 PM |

---

## 🏷️ TAGS

Add relevant tags:
- `thai-language`
- `input-validation`
- `clients`
- `encoding`
- `urgent`

---

## 📞 NOTES

### For Developers
Please note:
- Make sure to check other validation functions for similar issues
- Thai character support is critical for Thailand market
- Consider adding unit tests for Unicode input

### For QA
- Test with various Thai input methods (Google Thai, Windows Thai IME)
- Test with mixed Thai/English text
- Test with special Thai characters (tone marks, etc.)

### For Product
- This affects all Thai users creating businesses
- Priority should be HIGH for Thailand operations

---

## ⏰ TIMELINE

| Action | Date | Assignee | Status |
|--------|------|----------|--------|
| **Reported** | 2025-02-16 | Tester | ✅ |
| **Triaged** | ⏳ | QA Lead | ⏳ |
| **Assigned** | ⏳ | Developer | ⏳ |
| **In Progress** | ⏳ | Developer | ⏳ |
| **Fixed** | ⏳ | Developer | ⏳ |
| **Verified** | ⏳ | QA Tester | ⏳ |
| **Closed** | ⏳ | QA Lead | ⏳ |

---

## 📎 ATTACHMENTS

- [ ] Video recording
- [ ] Database export
- [ ] Log file
- [ ] Configuration file
- [ ] Test data file

---

## 🔐 CONFIDENTIAL INFO

| Type | Value |
|------|-------|
| **Sensitive Data** | None |
| **Contains PII** | No |
| **API Keys Exposed** | No |
| **Passwords Visible** | No |

---

## ✅ RESOLUTION

### Fix Applied
_To be filled by developer_

Changed validation regex from `/^[a-zA-Z0-9\s\-.,&'()]*$/` to `/^[a-zA-Z0-9\u0E00-\u0E7F\s\-.,&'()]*$/` to support Thai characters (Unicode range U+0E00 to U+0E7F).

**File:** `lib/validation.ts`  
**Line:** 42  
**Commit:** abc123def456

### Testing Performed
- [x] Tested with Thai characters
- [x] Tested with English characters
- [x] Tested with mixed Thai/English
- [x] Tested with special characters
- [x] Unit tests added
- [x] Integration tests passed

### Status
- [ ] Pending
- [ ] In Progress
- [ ] Fixed
- [ ] Verified
- [x] Closed

---

**Bug ID:** BUG-2025-001  
**Created:** 2025-02-16  
**Last Modified:** ⏳
