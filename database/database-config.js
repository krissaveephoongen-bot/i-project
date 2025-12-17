// Database Configuration for Painai
// Using Neon PostgreSQL as the primary database provider

// Neon Database Configuration
const NEON_CONFIG = {
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6FSH4YyQIoeb@ep-muddy-cherry-ah612m1a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: true
};

// For now, we'll use Supabase-like configuration with Neon
// You can set up a proxy server or use Supabase hosting with Neon backend

// Database connection status
let isConnected = false;
let connectionError = null;

// Initialize database connection
async function initializeDatabase() {
  try {
    if (typeof window !== 'undefined') {
      // Client-side: Use Neon via API proxy
      console.log('Initializing Neon PostgreSQL connection (client-side proxy)...');
      isConnected = true; // Assume proxy handles connection
    } else {
      // Server-side: Use Neon PostgreSQL directly
      console.log('Initializing Neon PostgreSQL connection...');
      const { testConnection } = require('./neon-connection');
      const success = await testConnection();

      if (success) {
        isConnected = true;
        console.log('✅ Neon PostgreSQL connected successfully');
      } else {
        isConnected = false;
        console.error('❌ Failed to connect to Neon PostgreSQL');
      }
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    connectionError = error.message;
    isConnected = false;
  }
}


// Get connection status
function getConnectionStatus() {
  return {
    connected: isConnected,
    error: connectionError,
    provider: isConnected ? 'neon-postgresql' : 'none'
  };
}

// Database utilities
const DatabaseUtils = {
  // Convert database row to Trickle-compatible format
  transformRow: (table, row) => {
    return {
      objectId: row.object_id || row.id,
      objectData: row,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  },

  // Convert form data to database format
  prepareData: (data) => {
    const cleaned = { ...data };
    
    // Remove undefined values
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    
    return cleaned;
  },

  // Handle common field mappings
  mapFields: (data, mappings) => {
    const mapped = { ...data };
    
    Object.keys(mappings).forEach(fromField => {
      const toField = mappings[fromField];
      if (mapped[fromField] !== undefined) {
        mapped[toField] = mapped[fromField];
        delete mapped[fromField];
      }
    });
    
    return mapped;
  }
};

// Field mappings for table compatibility
const FIELD_MAPPINGS = {
  project: {
    'Name': 'name',
    'Code': 'code',
    'Description': 'description',
    'StartDate': 'start_date',
    'EndDate': 'end_date',
    'Budget': 'budget',
    'Status': 'status',
    'Progress': 'progress',
    'Objective': 'objective',
    'Scope': 'scope',
    'Stakeholders': 'stakeholders',
    'Customer': 'customer',
    'ProjectManager': 'project_manager',
    'TeamMembers': 'team_members',
    'Department': 'department',
    'Priority': 'priority',
    'RiskLevel': 'risk_level'
  },
  task: {
    'Name': 'name',
    'Description': 'description',
    'ProjectId': 'project_id',
    'Assignee': 'assignee',
    'Status': 'status',
    'Priority': 'priority',
    'Weight': 'weight',
    'Progress': 'progress',
    'DueDate': 'due_date',
    'EstimatedHours': 'estimated_hours',
    'PlannedStartDate': 'planned_start_date',
    'PlannedEndDate': 'planned_end_date'
  },
  user: {
    'Name': 'name',
    'Email': 'email',
    'Password': 'password',
    'Department': 'department',
    'Position': 'position',
    'Role': 'role',
    'HourlyRate': 'hourly_rate',
    'Status': 'status',
    'Phone': 'phone'
  },
  customer: {
    'Name': 'name',
    'ContactPerson': 'contact_person',
    'Email': 'email',
    'Phone': 'phone',
    'Address': 'address',
    'Type': 'type',
    'Status': 'status'
  },
  worklog: {
    'Date': 'date',
    'UserId': 'user_id',
    'UserName': 'user_name',
    'WorkType': 'work_type',
    'ProjectId': 'project_id',
    'TaskId': 'task_id',
    'Description': 'description',
    'StartTime': 'start_time',
    'EndTime': 'end_time',
    'Hours': 'hours',
    'Manday': 'manday',
    'Status': 'status'
  },
  expense: {
    'Date': 'date',
    'ProjectId': 'project_id',
    'Category': 'category',
    'Amount': 'amount',
    'Description': 'description',
    'UserId': 'user_id',
    'UserName': 'user_name',
    'Status': 'status'
  }
};

// Export for global use
if (typeof window !== 'undefined') {
  window.DatabaseConfig = {
    NEON_CONFIG,
    initializeDatabase,
    getConnectionStatus,
    DatabaseUtils,
    FIELD_MAPPINGS
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NEON_CONFIG,
    initializeDatabase,
    getConnectionStatus,
    DatabaseUtils,
    FIELD_MAPPINGS,
    // Add Neon connection module
    ...require('./neon-connection')
  };
}