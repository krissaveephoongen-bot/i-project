// Trickle API Wrapper for PostgreSQL/Supabase
// This file provides compatibility with existing Trickle API calls
// while using PostgreSQL as the backend database

// Import database configuration
const { SUPABASE_CONFIG, DatabaseUtils, FIELD_MAPPINGS } = window.DatabaseConfig;

// API endpoint base URL for Supabase
const API_BASE = `${SUPABASE_CONFIG.url}/rest/v1`;

// HTTP headers for API requests
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_CONFIG.anonKey,
    'Prefer': 'return=representation'
  };
  
  if (includeAuth) {
    headers['Authorization'] = `Bearer ${SUPABASE_CONFIG.anonKey}`;
  }
  
  return headers;
};

// Error handling
function handleApiError(error, fallback = null) {
  console.error('Database API Error:', error);
  
  if (error.message.includes('fetch')) {
    console.log('Network error - falling back to local data');
    return fallback;
  }
  
  return fallback;
}

// Check if database is available
function isDatabaseAvailable() {
  return SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && 
         SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
}

// Helper function to convert table name
function getTableName(table) {
  // Map old Trickle table names to PostgreSQL table names
  const tableMap = {
    'project': 'projects',
    'task': 'tasks',
    'user': 'users',
    'customer': 'customers',
    'worklog': 'worklogs',
    'expense': 'expenses',
    'scurve': 'scurve',
    'attendance': 'attendance',
    'invoice': 'invoices'
  };
  
  return tableMap[table] || table;
}

// List objects (equivalent to trickleListObjects)
async function trickleListObjects(table, limit = 50, includeDeleted = false) {
  try {
    if (!isDatabaseAvailable()) {
      console.log('Database not configured, returning empty result');
      return { items: [] };
    }

    const tableName = getTableName(table);
    let url = `${API_BASE}/${tableName}?select=*`;
    
    // Add limit
    if (limit) {
      url += `&limit=${limit}`;
    }
    
    // Filter out deleted items if not included
    if (!includeDeleted) {
      url += `&is_deleted=eq.false`;
    }
    
    // Add ordering
    url += `&order=created_at.desc`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform to Trickle-compatible format
    const items = data.map(row => DatabaseUtils.transformRow(table, row));
    
    return {
      items,
      count: items.length
    };
    
  } catch (error) {
    return handleApiError(error, { items: [] });
  }
}

// Get single object (equivalent to trickleGetObject)
async function trickleGetObject(table, id) {
  try {
    if (!isDatabaseAvailable()) {
      console.log('Database not configured');
      return null;
    }

    const tableName = getTableName(table);
    const url = `${API_BASE}/${tableName}?select=*&or=(object_id.eq.${id},id.eq.${id})&is_deleted=eq.false&limit=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }
    
    return DatabaseUtils.transformRow(table, data[0]);
    
  } catch (error) {
    return handleApiError(error, null);
  }
}

// Create object (equivalent to trickleCreateObject)
async function trickleCreateObject(table, data) {
  try {
    if (!isDatabaseAvailable()) {
      console.log('Database not configured, cannot create object');
      throw new Error('Database not available');
    }

    const tableName = getTableName(table);
    
    // Map field names if needed
    const fieldMappings = FIELD_MAPPINGS[table] || {};
    const mappedData = DatabaseUtils.mapFields(data, fieldMappings);
    
    // Prepare data for database
    const dbData = DatabaseUtils.prepareData(mappedData);
    
    // Add metadata
    dbData.created_at = new Date().toISOString();
    dbData.updated_at = new Date().toISOString();
    
    // Generate object_id if not provided
    if (!dbData.object_id) {
      dbData.object_id = `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const response = await fetch(`${API_BASE}/${tableName}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dbData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    const created = Array.isArray(result) ? result[0] : result;
    
    return DatabaseUtils.transformRow(table, created);
    
  } catch (error) {
    console.error('Create object failed:', error);
    throw error;
  }
}

// Update object (equivalent to trickleUpdateObject)
async function trickleUpdateObject(table, id, data) {
  try {
    if (!isDatabaseAvailable()) {
      console.log('Database not configured, cannot update object');
      throw new Error('Database not available');
    }

    const tableName = getTableName(table);
    
    // Map field names if needed
    const fieldMappings = FIELD_MAPPINGS[table] || {};
    const mappedData = DatabaseUtils.mapFields(data, fieldMappings);
    
    // Prepare data for database
    const dbData = DatabaseUtils.prepareData(mappedData);
    
    // Add metadata
    dbData.updated_at = new Date().toISOString();
    
    // Build query URL - try both object_id and id
    const url = `${API_BASE}/${tableName}?or=(object_id.eq.${id},id.eq.${id})`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(dbData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    const updated = Array.isArray(result) ? result[0] : result;
    
    if (!updated) {
      throw new Error('Object not found or not updated');
    }
    
    return DatabaseUtils.transformRow(table, updated);
    
  } catch (error) {
    console.error('Update object failed:', error);
    throw error;
  }
}

// Delete object (equivalent to trickleDeleteObject)
async function trickleDeleteObject(table, id) {
  try {
    if (!isDatabaseAvailable()) {
      console.log('Database not configured, cannot delete object');
      throw new Error('Database not available');
    }

    const tableName = getTableName(table);
    
    // Soft delete by setting is_deleted = true
    const response = await fetch(`${API_BASE}/${tableName}?or=(object_id.eq.${id},id.eq.${id})`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Delete object failed:', error);
    throw error;
  }
}

// Utility functions for database operations
const DatabaseAPI = {
  // Execute custom SQL query (for complex operations)
  async query(sql, params = []) {
    try {
      // This would require a server-side endpoint or use Supabase RPC
      console.log('Custom query would require server-side execution');
      throw new Error('Custom queries require server-side implementation');
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  },
  
  // Get table schema
  async getSchema(table) {
    try {
      if (!isDatabaseAvailable()) {
        return null;
      }
      
      const tableName = getTableName(table);
      const response = await fetch(`${API_BASE}/${tableName}?select=*&limit=1`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data.length > 0 ? Object.keys(data[0]) : [];
      
    } catch (error) {
      console.error('Schema fetch failed:', error);
      return null;
    }
  },
  
  // Get database statistics
  async getStats() {
    try {
      if (!isDatabaseAvailable()) {
        return null;
      }
      
      const tables = ['projects', 'tasks', 'users', 'customers', 'worklogs', 'expenses'];
      const stats = {};
      
      for (const table of tables) {
        const response = await fetch(`${API_BASE}/${table}?select=count&is_deleted=eq.false`, {
          method: 'GET',
          headers: getHeaders()
        });
        
        if (response.ok) {
          // Note: Supabase doesn't return count in this format, this is simplified
          stats[table] = 'count available via headers';
        }
      }
      
      return stats;
      
    } catch (error) {
      console.error('Stats fetch failed:', error);
      return null;
    }
  }
};

// Export all functions for global use
if (typeof window !== 'undefined') {
  window.trickleListObjects = trickleListObjects;
  window.trickleGetObject = trickleGetObject;
  window.trickleCreateObject = trickleCreateObject;
  window.trickleUpdateObject = trickleUpdateObject;
  window.trickleDeleteObject = trickleDeleteObject;
  window.DatabaseAPI = DatabaseAPI;
  window.isDatabaseAvailable = isDatabaseAvailable;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    trickleListObjects,
    trickleGetObject,
    trickleCreateObject,
    trickleUpdateObject,
    trickleDeleteObject,
    DatabaseAPI,
    isDatabaseAvailable
  };
}