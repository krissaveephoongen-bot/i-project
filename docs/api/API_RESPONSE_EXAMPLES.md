# API Response Examples - New Data Structure
**Reference Guide for Testing**

---

## GET /api/projects

### Request
```bash
curl http://localhost:5000/api/projects?page=1&limit=10
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Website Redesign",
      "code": "WEB-2025",
      "description": "Complete website redesign project",
      "budget": 50000,
      "actualCost": 25000,
      "estimatedHours": 500,
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-06-30T00:00:00Z",
      "status": "IN_PROGRESS",
      "priority": "high",
      "clientId": "550e8400-e29b-41d4-a716-446655440002",
      "projectManagerId": "550e8400-e29b-41d4-a716-446655440003",
      "tags": ["design", "frontend", "backend"],
      "progress": 50,
      "createdAt": "2024-12-15T10:30:00Z",
      "updatedAt": "2025-12-23T15:45:00Z",
      "client": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Acme Corp",
        "logo": "https://example.com/logo.png"
      },
      "projectManager": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "managerRole": "Senior Project Manager",
        "status": "active",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "name": "John Smith",
          "email": "john.smith@company.com",
          "avatar": "https://example.com/avatars/john.jpg"
        }
      },
      "_count": {
        "tasks": 15,
        "timesheets": 42,
        "timeLogs": 128
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

## GET /api/projects/{id}

### Request
```bash
curl http://localhost:5000/api/projects/550e8400-e29b-41d4-a716-446655440001
```

### Response (Full Project with Relations)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Website Redesign",
    "code": "WEB-2025",
    "description": "Complete website redesign project",
    "budget": 50000,
    "actualCost": 25000,
    "estimatedHours": 500,
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-06-30T00:00:00Z",
    "status": "IN_PROGRESS",
    "priority": "high",
    "clientId": "550e8400-e29b-41d4-a716-446655440002",
    "projectManagerId": "550e8400-e29b-41d4-a716-446655440003",
    "tags": ["design", "frontend", "backend"],
    "progress": 50,
    "createdAt": "2024-12-15T10:30:00Z",
    "updatedAt": "2025-12-23T15:45:00Z",
    
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+1-555-0100",
      "address": "123 Business Ave, Tech City, TC 12345",
      "taxId": "12-3456789",
      "website": "https://acme.com",
      "industry": "Technology",
      "notes": null,
      "status": "active"
    },
    
    "projectManager": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "managerRole": "Senior Project Manager",
      "status": "active",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "name": "John Smith",
        "email": "john.smith@company.com",
        "avatar": "https://example.com/avatars/john.jpg"
      }
    },
    
    "tasks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440005",
        "title": "Design Homepage",
        "name": "Design Homepage",
        "description": "Create mockups and design the homepage",
        "status": "IN_PROGRESS",
        "priority": "high",
        "dueDate": "2025-02-15T00:00:00Z",
        "estimatedHours": 40,
        "actualHours": 32,
        
        "plannedStartDate": "2025-01-01T00:00:00Z",
        "plannedEndDate": "2025-02-15T00:00:00Z",
        "plannedProgressWeight": 25,
        "actualProgress": 80,
        
        "projectId": "550e8400-e29b-41d4-a716-446655440001",
        "assigneeId": "550e8400-e29b-41d4-a716-446655440006",
        "assignee": {
          "id": "550e8400-e29b-41d4-a716-446655440006",
          "name": "Sarah Johnson",
          "email": "sarah.johnson@company.com",
          "avatar": "https://example.com/avatars/sarah.jpg"
        },
        
        "reporterId": "550e8400-e29b-41d4-a716-446655440004",
        "reporter": {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "name": "John Smith",
          "email": "john.smith@company.com",
          "avatar": "https://example.com/avatars/john.jpg"
        },
        
        "parentTaskId": null,
        "labels": ["design", "ui"],
        "createdAt": "2024-12-15T10:30:00Z",
        "updatedAt": "2025-12-23T14:20:00Z",
        "startedAt": "2025-01-02T09:00:00Z",
        "completedAt": null,
        
        "_count": {
          "comments": 5,
          "timeLogs": 8
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440007",
        "title": "Backend API Development",
        "name": "Backend API Development",
        "description": "Develop RESTful API endpoints",
        "status": "TODO",
        "priority": "high",
        "dueDate": "2025-04-30T00:00:00Z",
        "estimatedHours": 120,
        "actualHours": 0,
        
        "plannedStartDate": "2025-02-16T00:00:00Z",
        "plannedEndDate": "2025-04-30T00:00:00Z",
        "plannedProgressWeight": 40,
        "actualProgress": 0,
        
        "projectId": "550e8400-e29b-41d4-a716-446655440001",
        "assigneeId": "550e8400-e29b-41d4-a716-446655440008",
        "assignee": {
          "id": "550e8400-e29b-41d4-a716-446655440008",
          "name": "Mike Chen",
          "email": "mike.chen@company.com",
          "avatar": "https://example.com/avatars/mike.jpg"
        },
        
        "reporterId": "550e8400-e29b-41d4-a716-446655440004",
        "reporter": {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "name": "John Smith",
          "email": "john.smith@company.com",
          "avatar": "https://example.com/avatars/john.jpg"
        },
        
        "parentTaskId": null,
        "labels": ["backend", "api"],
        "createdAt": "2024-12-15T10:45:00Z",
        "updatedAt": "2025-12-23T10:00:00Z",
        "startedAt": null,
        "completedAt": null,
        
        "_count": {
          "comments": 0,
          "timeLogs": 0
        }
      }
    ],
    
    "timesheets": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440009",
        "userId": "550e8400-e29b-41d4-a716-446655440006",
        "projectId": "550e8400-e29b-41d4-a716-446655440001",
        "taskId": "550e8400-e29b-41d4-a716-446655440005",
        "date": "2025-12-20",
        "hoursWorked": 8,
        "description": "Homepage design completion",
        "status": "APPROVED",
        "approvedById": "550e8400-e29b-41d4-a716-446655440004",
        "approvedAt": "2025-12-21T09:00:00Z",
        "rejectionReason": null
      }
    ],
    
    "_count": {
      "tasks": 15,
      "timesheets": 42,
      "timeLogs": 128,
      "comments": 23
    }
  }
}
```

---

## POST /api/projects

### Request
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App Development",
    "code": "MOB-2025",
    "description": "Build mobile app for iOS and Android",
    "startDate": "2025-01-15",
    "endDate": "2025-12-31",
    "budget": 150000,
    "actualCost": 0,
    "estimatedHours": 1200,
    "status": "PLANNING",
    "priority": "high",
    "clientId": "550e8400-e29b-41d4-a716-446655440002",
    "projectManagerId": "550e8400-e29b-41d4-a716-446655440003",
    "tags": ["mobile", "ios", "android"],
    "progress": 0
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Mobile App Development",
    "code": "MOB-2025",
    "description": "Build mobile app for iOS and Android",
    "budget": 150000,
    "actualCost": 0,
    "estimatedHours": 1200,
    "startDate": "2025-01-15T00:00:00Z",
    "endDate": "2025-12-31T00:00:00Z",
    "status": "PLANNING",
    "priority": "high",
    "clientId": "550e8400-e29b-41d4-a716-446655440002",
    "projectManagerId": "550e8400-e29b-41d4-a716-446655440003",
    "tags": ["mobile", "ios", "android"],
    "progress": 0,
    "createdAt": "2025-12-23T16:00:00Z",
    "updatedAt": "2025-12-23T16:00:00Z",
    
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+1-555-0100",
      "address": "123 Business Ave, Tech City, TC 12345",
      "taxId": "12-3456789",
      "website": "https://acme.com",
      "industry": "Technology",
      "notes": null,
      "status": "active"
    },
    
    "projectManager": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "managerRole": "Senior Project Manager",
      "status": "active",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "name": "John Smith",
        "email": "john.smith@company.com",
        "avatar": "https://example.com/avatars/john.jpg"
      }
    }
  },
  "message": "Project created successfully"
}
```

---

## PUT /api/projects/{id}

### Request - Update Project Manager
```bash
curl -X PUT http://localhost:5000/api/projects/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{
    "projectManagerId": "550e8400-e29b-41d4-a716-446655440011",
    "status": "ON_HOLD",
    "progress": 55
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Website Redesign",
    "code": "WEB-2025",
    "description": "Complete website redesign project",
    "budget": 50000,
    "actualCost": 25000,
    "estimatedHours": 500,
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-06-30T00:00:00Z",
    "status": "ON_HOLD",
    "priority": "high",
    "clientId": "550e8400-e29b-41d4-a716-446655440002",
    "projectManagerId": "550e8400-e29b-41d4-a716-446655440011",
    "tags": ["design", "frontend", "backend"],
    "progress": 55,
    "createdAt": "2024-12-15T10:30:00Z",
    "updatedAt": "2025-12-23T16:10:00Z",
    
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+1-555-0100",
      "address": "123 Business Ave, Tech City, TC 12345",
      "taxId": "12-3456789",
      "website": "https://acme.com",
      "industry": "Technology",
      "notes": null,
      "status": "active"
    },
    
    "projectManager": {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "managerRole": "Project Manager",
      "status": "active",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440012",
        "name": "Emma Wilson",
        "email": "emma.wilson@company.com",
        "avatar": "https://example.com/avatars/emma.jpg"
      }
    }
  },
  "message": "Project updated successfully"
}
```

---

## DELETE /api/projects/{id}

### Request
```bash
curl -X DELETE http://localhost:5000/api/projects/550e8400-e29b-41d4-a716-446655440010 \
  -H "Content-Type: application/json"
```

### Response (Success)
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Response (Error - Has Related Records)
```json
{
  "success": false,
  "error": "Cannot delete project with related records. Please delete related tasks, timesheets, and time logs first."
}
```

---

## Error Responses

### Bad Request (Missing Required Field)
```json
{
  "success": false,
  "error": "Request validation failed: missing required field 'startDate'"
}
```

### Not Found
```json
{
  "success": false,
  "error": "Project not found"
}
```

### Duplicate Code
```json
{
  "success": false,
  "error": "Project with this code already exists"
}
```

---

## Key Differences from Previous Version

| Element | Before | After |
|---------|--------|-------|
| **projectManagerId** | Not present | ✅ Present |
| **projectManager.name** | Existed | ❌ Removed |
| **projectManager.user.name** | Not present | ✅ Present |
| **task.assignedTo** | Existed | ❌ Renamed |
| **task.assignee** | Not present | ✅ Present |
| **task.reportedBy** | Existed | ❌ Renamed |
| **task.reporter** | Not present | ✅ Present |
| **task.plannedStartDate** | Not included in response | ✅ Included |
| **task.plannedEndDate** | Not included in response | ✅ Included |
| **task.plannedProgressWeight** | Not included in response | ✅ Included |
| **task.actualProgress** | Not included in response | ✅ Included |

---

## Testing with cURL

### Tip 1: Format JSON Output
```bash
curl http://localhost:5000/api/projects | jq '.'
```

### Tip 2: Save Response to File
```bash
curl http://localhost:5000/api/projects > projects.json
```

### Tip 3: Include Headers in Response
```bash
curl -i http://localhost:5000/api/projects
```

### Tip 4: Follow Redirects
```bash
curl -L http://localhost:5000/api/projects
```

---

**Last Updated:** December 23, 2025  
**Version:** 1.0  
**Status:** Ready for Testing
