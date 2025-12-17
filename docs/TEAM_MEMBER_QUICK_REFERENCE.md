# Team Member Management - Quick Reference

## 🎯 TL;DR (Too Long; Didn't Read)

3 files created. Run migration. Restart server. Done.

---

## 📁 Files Created

1. **Database Migration** → `database/migrations/20241215_update_users_table.sql`
2. **Frontend Service** → `src/services/teamMemberService.ts`
3. **Backend Routes** → `server/team-member-routes.js`
4. **Server Config** → `server/app.js` (updated)

---

## ⚡ Quick Setup (5 minutes)

### 1. Run Migration
```bash
psql -h your-host -U your-user -d your-database < database/migrations/20241215_update_users_table.sql
```

### 2. Restart Server
```bash
npm run server
```

### 3. Test API
```bash
curl http://localhost:5001/api/team-members
```

### 4. Use in Component
```typescript
import { teamMemberService } from '../services/teamMemberService';

const managers = await teamMemberService.getProjectManagers();
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/team-members` | List all members |
| GET | `/api/team-members?role=X` | Filter by role |
| GET | `/api/team-members?status=active` | Filter by status |
| GET | `/api/team-members?search=john` | Search by name/email |
| GET | `/api/team-members/:id` | Get specific member |
| POST | `/api/team-members` | Create member |
| PUT | `/api/team-members/:id` | Update member |
| DELETE | `/api/team-members/:id` | Delete member |
| GET | `/api/team-members/statistics` | Get stats |

---

## 💻 Service Methods

```typescript
// Get members
await teamMemberService.getTeamMembers();
await teamMemberService.getProjectManagers();
await teamMemberService.getTeamMembersByRole('Developer');
await teamMemberService.getTeamMembersByDepartment('Engineering');
await teamMemberService.getActiveTeamMembers();

// Get specific
await teamMemberService.getTeamMember(memberId);

// Manage
await teamMemberService.createTeamMember(data);
await teamMemberService.updateTeamMember(memberId, data);
await teamMemberService.deleteTeamMember(memberId);
await teamMemberService.updateTeamMemberStatus(memberId, 'inactive');

// Stats
await teamMemberService.getTeamMemberStatistics();
```

---

## 📊 Team Member Fields

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Project Manager",
  "department": "Engineering",
  "position": "Senior PM",
  "status": "active"
}
```

---

## 🔄 In React Component

```typescript
import { useQuery } from '@tanstack/react-query';
import { teamMemberService } from '../services/teamMemberService';

export const MyComponent = () => {
  const { data: managers } = useQuery({
    queryKey: ['project-managers'],
    queryFn: () => teamMemberService.getProjectManagers(),
  });

  return (
    <select>
      {managers?.map(m => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
};
```

---

## ✅ Verification Checklist

- [ ] Migration ran successfully
- [ ] Server restarted
- [ ] GET /api/team-members returns data
- [ ] Component imports teamMemberService
- [ ] Dropdown shows team members
- [ ] Creating project saves project manager

---

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| API returns 404 | Restart server |
| No members showing | Check `status = 'active'` in database |
| Dropdown empty | Verify migration ran |
| Old data showing | Clear browser cache or React Query |
| Permission errors | Check database credentials |

---

## 📚 Full Docs

See `TEAM_MEMBER_IMPLEMENTATION_GUIDE.md` for complete setup with examples.

---

## 🚀 Status

✅ **Ready to deploy** - All files created and integrated

---
