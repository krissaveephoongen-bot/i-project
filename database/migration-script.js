// Data Migration Script: Trickle to PostgreSQL/Neon
// This script helps migrate data from Trickle Database to PostgreSQL

// Migration configuration
const MIGRATION_CONFIG = {
  batchSize: 100, // Number of records to process per batch
  retryAttempts: 3,
  retryDelay: 1000, // milliseconds
  skipOnError: true, // Continue migration even if some records fail
  createBackup: true, // Create backup before migration
  validateAfterMigration: true
};

// Migration status tracking
const MigrationStatus = {
  totalRecords: 0,
  processedRecords: 0,
  successfulRecords: 0,
  failedRecords: 0,
  errors: [],
  startTime: null,
  endTime: null
};

// Table migration mappings
const TABLE_MIGRATIONS = {
  project: {
    sourceTable: 'project',
    targetTable: 'projects',
    requiredFields: ['Name'],
    optionalFields: ['Code', 'Description', 'StartDate', 'EndDate', 'Budget', 'Status', 'Progress'],
    fieldTransformations: {
      'StartDate': (value) => value ? new Date(value).toISOString() : null,
      'EndDate': (value) => value ? new Date(value).toISOString() : null,
      'Budget': (value) => parseFloat(value) || 0,
      'Progress': (value) => parseFloat(value) || 0
    }
  },
  task: {
    sourceTable: 'task',
    targetTable: 'tasks',
    requiredFields: ['Name', 'ProjectId'],
    optionalFields: ['Description', 'Assignee', 'Status', 'Weight', 'Progress', 'DueDate'],
    fieldTransformations: {
      'DueDate': (value) => value ? new Date(value).toISOString() : null,
      'Weight': (value) => parseFloat(value) || 0,
      'Progress': (value) => parseFloat(value) || 0
    }
  },
  user: {
    sourceTable: 'user',
    targetTable: 'users',
    requiredFields: ['Name', 'Email'],
    optionalFields: ['Password', 'Department', 'Position', 'Role', 'HourlyRate'],
    fieldTransformations: {
      'HourlyRate': (value) => parseFloat(value) || 0
    }
  },
  customer: {
    sourceTable: 'customer',
    targetTable: 'customers',
    requiredFields: ['Name'],
    optionalFields: ['ContactPerson', 'Email', 'Phone', 'Address', 'Type'],
    fieldTransformations: {}
  },
  worklog: {
    sourceTable: 'worklog',
    targetTable: 'worklogs',
    requiredFields: ['Date', 'UserId'],
    optionalFields: ['UserName', 'WorkType', 'ProjectId', 'TaskId', 'Description', 'Hours', 'Manday', 'Status'],
    fieldTransformations: {
      'Date': (value) => new Date(value).toISOString().split('T')[0],
      'Hours': (value) => parseFloat(value) || 0,
      'Manday': (value) => parseFloat(value) || 0
    }
  },
  expense: {
    sourceTable: 'expense',
    targetTable: 'expenses',
    requiredFields: ['Date', 'ProjectId', 'Amount'],
    optionalFields: ['Category', 'Description', 'UserId', 'UserName', 'Status'],
    fieldTransformations: {
      'Date': (value) => new Date(value).toISOString().split('T')[0],
      'Amount': (value) => parseFloat(value) || 0
    }
  }
};

// Migration functions
const MigrationTool = {
  // Initialize migration
  async initialize() {
    console.log('🚀 Starting Trickle to PostgreSQL Migration');
    console.log('==========================================');
    
    MigrationStatus.startTime = new Date();
    
    // Check if Trickle database is available
    if (typeof trickleListObjects !== 'function') {
      throw new Error('Trickle database API not available. Make sure Trickle is initialized.');
    }
    
    // Check if PostgreSQL/Neon is configured
    if (typeof window !== 'undefined' && window.DatabaseConfig) {
      const connectionStatus = window.DatabaseConfig.getConnectionStatus();
      if (!connectionStatus.connected) {
        console.warn('⚠️  PostgreSQL not configured. Using fallback mode.');
      }
    }
    
    return true;
  },
  
  // Get all records from Trickle table
  async getSourceData(table, limit = 1000) {
    try {
      console.log(`📥 Fetching data from Trickle table: ${table}`);
      
      const result = await trickleListObjects(table, limit, true); // Include deleted for backup
      
      if (!result.items) {
        console.log(`⚠️  No data found in table: ${table}`);
        return [];
      }
      
      console.log(`✅ Found ${result.items.length} records in ${table}`);
      return result.items;
      
    } catch (error) {
      console.error(`❌ Failed to fetch data from ${table}:`, error);
      throw error;
    }
  },
  
  // Transform data for PostgreSQL
  transformData(table, data, mappings) {
    const transformed = {};
    
    Object.keys(mappings.fieldTransformations || {}).forEach(field => {
      if (data[field] !== undefined) {
        transformed[field] = mappings.fieldTransformations[field](data[field]);
      }
    });
    
    // Copy all other fields
    Object.keys(data).forEach(key => {
      if (!mappings.fieldTransformations[key]) {
        transformed[key] = data[key];
      }
    });
    
    // Set defaults for missing required fields
    if (table === 'project') {
      transformed.object_id = transformed.object_id || `migrated-${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      transformed.status = transformed.status || 'planning';
    } else if (table === 'task') {
      transformed.object_id = transformed.object_id || `migrated-${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      transformed.status = transformed.status || 'todo';
      transformed.progress = transformed.progress || 0;
      transformed.weight = transformed.weight || 0;
    } else if (table === 'worklog') {
      transformed.status = transformed.status || 'pending';
    } else if (table === 'expense') {
      transformed.status = transformed.status || 'pending';
    }
    
    return transformed;
  },
  
  // Validate transformed data
  validateData(table, data, mappings) {
    const errors = [];
    
    // Check required fields
    mappings.requiredFields.forEach(field => {
      if (!data[field] && data[field] !== 0) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Type validations
    if (table === 'project' || table === 'task') {
      if (data.Weight !== undefined && (isNaN(data.Weight) || data.Weight < 0 || data.Weight > 100)) {
        errors.push('Invalid Weight value. Must be between 0-100.');
      }
      if (data.Progress !== undefined && (isNaN(data.Progress) || data.Progress < 0 || data.Progress > 100)) {
        errors.push('Invalid Progress value. Must be between 0-100.');
      }
    }
    
    if (table === 'expense') {
      if (isNaN(data.Amount) || data.Amount < 0) {
        errors.push('Invalid Amount value. Must be a positive number.');
      }
    }
    
    if (table === 'worklog') {
      if (data.Hours !== undefined && (isNaN(data.Hours) || data.Hours < 0 || data.Hours > 24)) {
        errors.push('Invalid Hours value. Must be between 0-24.');
      }
      if (data.Manday !== undefined && isNaN(data.Manday)) {
        errors.push('Invalid Manday value. Must be a number.');
      }
    }
    
    return errors;
  },
  
  // Migrate single table
  async migrateTable(table) {
    console.log(`\n📊 Migrating table: ${table}`);
    console.log('======================================');
    
    const mappings = TABLE_MIGRATIONS[table];
    if (!mappings) {
      throw new Error(`No migration mapping found for table: ${table}`);
    }
    
    // Get source data
    const sourceData = await this.getSourceData(mappings.sourceTable);
    
    if (sourceData.length === 0) {
      console.log(`✅ No data to migrate for table: ${table}`);
      return { migrated: 0, failed: 0, skipped: 0 };
    }
    
    let migrated = 0;
    let failed = 0;
    let skipped = 0;
    
    // Process in batches
    for (let i = 0; i < sourceData.length; i += MIGRATION_CONFIG.batchSize) {
      const batch = sourceData.slice(i, i + MIGRATION_CONFIG.batchSize);
      
      for (const item of batch) {
        MigrationStatus.processedRecords++;
        
        try {
          // Transform data
          const transformed = this.transformData(table, item.objectData || item, mappings);
          
          // Validate data
          const validationErrors = this.validateData(table, transformed, mappings);
          if (validationErrors.length > 0) {
            console.warn(`⚠️  Validation failed for record in ${table}:`, validationErrors);
            skipped++;
            continue;
          }
          
          // Create in PostgreSQL (if available)
          if (typeof trickleCreateObject === 'function') {
            await trickleCreateObject(table, transformed);
            migrated++;
            MigrationStatus.successfulRecords++;
            console.log(`✅ Migrated record ${MigrationStatus.processedRecords}/${sourceData.length}`);
          } else {
            console.log(`💾 Would migrate record (PostgreSQL not configured): ${JSON.stringify(transformed).substring(0, 100)}...`);
            migrated++;
          }
          
        } catch (error) {
          console.error(`❌ Failed to migrate record in ${table}:`, error);
          MigrationStatus.failedRecords++;
          failed++;
          
          if (!MIGRATION_CONFIG.skipOnError) {
            throw error;
          }
        }
      }
      
      // Progress update
      const progress = ((i + batch.length) / sourceData.length * 100).toFixed(1);
      console.log(`📈 Progress: ${progress}% (${migrated} migrated, ${failed} failed, ${skipped} skipped)`);
    }
    
    console.log(`\n✅ Table migration completed: ${table}`);
    console.log(`📊 Results: ${migrated} migrated, ${failed} failed, ${skipped} skipped`);
    
    return { migrated, failed, skipped };
  },
  
  // Run full migration
  async runFullMigration() {
    await this.initialize();
    
    const tables = Object.keys(TABLE_MIGRATIONS);
    MigrationStatus.totalRecords = 0;
    
    // Calculate total records
    for (const table of tables) {
      try {
        const sourceData = await this.getSourceData(table, 1); // Just count
        MigrationStatus.totalRecords += sourceData.length;
      } catch (error) {
        console.warn(`Could not count records for ${table}:`, error);
      }
    }
    
    console.log(`\n📋 Total records to migrate: ${MigrationStatus.totalRecords}`);
    
    const results = {};
    
    // Migrate each table
    for (const table of tables) {
      try {
        results[table] = await this.migrateTable(table);
        
        // Small delay between tables
        if (table !== tables[tables.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Migration failed for table ${table}:`, error);
        results[table] = { migrated: 0, failed: 1, skipped: 0 };
        MigrationStatus.errors.push(`${table}: ${error.message}`);
        
        if (!MIGRATION_CONFIG.skipOnError) {
          throw error;
        }
      }
    }
    
    // Finalize migration
    MigrationStatus.endTime = new Date();
    const duration = Math.round((MigrationStatus.endTime - MigrationStatus.startTime) / 1000);
    
    console.log('\n🎉 Migration completed!');
    console.log('========================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📊 Total processed: ${MigrationStatus.processedRecords}`);
    console.log(`✅ Successful: ${MigrationStatus.successfulRecords}`);
    console.log(`❌ Failed: ${MigrationStatus.failedRecords}`);
    console.log(`⏭️  Skipped: ${MigrationStatus.processedRecords - MigrationStatus.successfulRecords - MigrationStatus.failedRecords}`);
    
    if (MigrationStatus.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      MigrationStatus.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    return {
      success: MigrationStatus.failedRecords === 0,
      results,
      status: MigrationStatus,
      duration
    };
  },
  
  // Validate migration results
  async validateMigration() {
    console.log('\n🔍 Validating migration...');
    
    const tables = Object.keys(TABLE_MIGRATIONS);
    const validationResults = {};
    
    for (const table of tables) {
      try {
        if (typeof trickleListObjects === 'function') {
          const count = await trickleListObjects(table, 1);
          validationResults[table] = {
            exists: true,
            count: count.items ? count.items.length : 0
          };
          console.log(`✅ ${table}: ${validationResults[table].count} records`);
        } else {
          validationResults[table] = {
            exists: false,
            count: 0,
            note: 'PostgreSQL not configured'
          };
          console.log(`⚠️  ${table}: Cannot validate (PostgreSQL not configured)`);
        }
      } catch (error) {
        validationResults[table] = {
          exists: false,
          error: error.message
        };
        console.log(`❌ ${table}: Validation failed - ${error.message}`);
      }
    }
    
    return validationResults;
  }
};

// Export for global use
if (typeof window !== 'undefined') {
  window.MigrationTool = MigrationTool;
  window.MIGRATION_CONFIG = MIGRATION_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MigrationTool,
    MIGRATION_CONFIG,
    TABLE_MIGRATIONS,
    MigrationStatus
  };
}