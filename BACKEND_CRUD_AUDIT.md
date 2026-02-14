# Backend CRUD System Audit

## Current Architecture

### Feature-Based Organization
```
backend/src/features/
├── auth/
│   ├── controllers/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   └── types/
├── projects/
├── tasks/
├── users/
└── dashboard/
```

### API Response Standard
All responses follow the `ApiResponse` pattern:
```typescript
{
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationInfo; // For list endpoints
  error?: string; // On error
}
```

### Middleware Stack
1. **CORS** - Cross-origin requests
2. **Express.json()** - JSON parsing
3. **authMiddleware** - JWT verification
4. **requireRole()** - Role-based access control
5. **validateRequest()** - Zod schema validation

## Current CRUD Implementations

### ✅ Projects Module
**Status**: Full CRUD + Relations

Routes:
- `GET /api/projects` - List with pagination, filtering, sorting
- `GET /api/projects/:id` - Get by ID
- `POST /api/projects` - Create (admin/manager only)
- `PUT /api/projects/:id` - Update (admin/manager only)
- `DELETE /api/projects/:id` - Delete (admin only)
- `GET /api/projects/:id/tasks` - Get project tasks
- `GET /api/projects/:id/team` - Get team members
- `POST /api/projects/:id/team` - Add team member
- `DELETE /api/projects/:id/team/:userId` - Remove team member

**Controller Pattern**: Uses try-catch with proper error handling
**Service Layer**: Yes, separate service class
**Validation**: Zod schemas (createProjectSchema, updateProjectSchema)

---

### ✅ Tasks Module
**Status**: Full CRUD

Routes:
- `GET /api/tasks` - List with filtering
- `GET /api/tasks/:id` - Get by ID
- `POST /api/tasks` - Create with validation
- `PUT /api/tasks/:id` - Update with validation
- `DELETE /api/tasks/:id` - Delete
- `GET /api/tasks/project/:projectId` - Get by project
- `GET /api/tasks/assignee/:userId` - Get by assignee

**Controller Pattern**: Follows project pattern
**Service Layer**: Yes
**Validation**: Zod schemas

---

### ✅ Users Module
**Status**: Full CRUD with Role-Based Access

Routes:
- `GET /api/users` - List (admin/manager only)
- `GET /api/users/me` - Current user profile
- `PUT /api/users/me` - Update own profile
- `GET /api/users/:id` - Get by ID (admin/manager only)
- `PUT /api/users/:id` - Update (admin only)
- `DELETE /api/users/:id` - Delete (admin only)
- `GET /api/users/role/:role` - Filter by role

**Controller Pattern**: Comprehensive with role checks
**Service Layer**: Yes
**Validation**: Zod schemas

---

### ✅ Auth Module
**Status**: Authentication & Authorization

Routes:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (JWT)
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/verify` - Verify token

**Middleware Exports**:
- `authMiddleware` - JWT verification
- `requireRole(['admin', 'manager'])` - Role checking

---

### ✅ Dashboard Module
**Status**: Read-only reports

Routes:
- Various analytics and dashboard endpoints

---

### ❌ Expenses Module
**Status**: Legacy implementation (needs modernization)

**Current Location**: `backend/routes/expenses-routes.js` (old JS file)
**Issues**:
- Not following feature-based architecture
- No service layer
- No validation schemas
- No proper error handling pattern
- Mixed with other route files

**Existing Routes**:
- `GET /api/expenses` - List with filtering
- `GET /api/expenses/:id` - Get by ID
- `POST /api/expenses` - Create with basic validation
- `PUT /api/expenses/:id` - Update
- `DELETE /api/expenses/:id` - Delete ✅
- `POST /api/expenses/:id/approve` - Approve expense
- `POST /api/expenses/:id/reject` - Reject expense
- `GET /api/expenses/categories/list` - Get categories

---

### ❌ Clients Module
**Status**: Not found in backend

**Needed**:
- Full CRUD API implementation
- Validation schemas
- Service layer
- Controller following project pattern

---

### ❌ Reports Module
**Status**: Legacy analytics only

**Current**: `backend/routes/reports-routes.js`
**Needed**: 
- Upgrade to feature-based architecture
- Add CRUD for saved reports
- Implement report configuration management

---

## Implementation Standards

### Controller Pattern
```typescript
export class [Feature]Controller {
  private [feature]Service: [Feature]Service;

  constructor() {
    this.[feature]Service = new [Feature]Service();
  }

  get[Feature]s = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.[feature]Service.get[Feature]s(...);
      const response: ApiResponse = {
        success: true,
        message: '[Feature] retrieved successfully',
        data: result.data,
        pagination: result.pagination,
      };
      res.json(response);
    } catch (error) {
      next(error); // Pass to global error handler
    }
  };
}
```

### Service Pattern
```typescript
export class [Feature]Service {
  async get[Features](filters, pagination) {
    // Business logic
  }

  async create[Feature](data) {
    // Validation
    // Database operation
    // Return result
  }
}
```

### Route Pattern
```typescript
const router = Router();
const controller = new [Feature]Controller();

router.use(authMiddleware);

router.get('/', controller.get[Features]);
router.get('/:id', controller.get[Feature]ById);
router.post('/', validateRequest(schema), controller.create[Feature]);
router.put('/:id', validateRequest(schema), controller.update[Feature]);
router.delete('/:id', controller.delete[Feature]);

export { router as [feature]Routes };
```

### Validation Pattern
```typescript
// In features/[feature]/schemas/[feature]Schemas.ts
import { z } from 'zod';

export const create[Feature]Schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  // ... other fields
});

export const update[Feature]Schema = create[Feature]Schema.partial();
```

---

## Database Schema Support

### Supported Tables
- projects
- tasks
- users
- expenses (with status: pending/approved/rejected)
- (clients - TBD)
- (reports - TBD)

---

## Priority Roadmap

### Phase 1: Modernize Expenses Module ⚠️ HIGH
1. Create feature-based structure
2. Extract validation schemas
3. Create service layer
4. Update controller to follow pattern
5. Integrate with main app.ts

### Phase 2: Implement Clients Module ⚠️ HIGH
1. Create full feature structure
2. Add validation schemas
3. Implement service layer
4. Create controller
5. Add routes to main app

### Phase 3: Enhance Reports Module ⚠️ MEDIUM
1. Upgrade to feature-based architecture
2. Add CRUD for saved reports
3. Implement report configuration

### Phase 4: Add Middleware Enhancements ⚠️ LOW
1. Add request logging middleware
2. Add rate limiting
3. Add request/response validation
4. Add audit logging for mutations

---

## Error Handling Standards

**Global Error Handler** (in app.ts):
```typescript
app.use((error: Error, req: express.Request, res: express.Response) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
});
```

**Service Layer Error Handling**:
- Custom error classes
- Specific HTTP status codes
- User-friendly messages

---

## Testing Considerations

### Unit Tests Needed
- Service layer logic
- Validation schemas
- Business rule enforcement

### Integration Tests Needed
- API endpoints
- Error scenarios
- Role-based access control
- Database operations

---

## Next Actions

1. **Create Expenses Feature** - Migrate from JS to TS with proper architecture
2. **Create Clients Feature** - Full implementation
3. **Update app.ts** - Register new routes
4. **Add Tests** - For each new feature
5. **Document APIs** - OpenAPI/Swagger specs

---

## File Structure Template

```
backend/src/features/[feature]/
├── controllers/
│   └── [Feature]Controller.ts
├── routes/
│   └── [feature]Routes.ts
├── schemas/
│   └── [feature]Schemas.ts
├── services/
│   └── [Feature]Service.ts
├── repositories/
│   └── [Feature]Repository.ts (if complex DB operations)
└── types/
    └── [Feature]Types.ts
```

Each feature is self-contained and follows the same pattern for consistency and maintainability.
