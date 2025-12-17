/**
 * Trickle to Neon PostgreSQL Migration Tool
 * Based on the schema structure in trickle/database/tables.json
 */

class TrickleToNeonMigrator {
    constructor() {
        this.queryManager = new QueryManager();
        this.schema = null;
        this.migrationLog = [];
        this.fieldMappings = this.createFieldMappings();
        this.typeMappings = this.createTypeMappings();
    }

    /**
     * Load Trickle schema from tables.json
     */
    async loadTrickleSchema() {
        try {
            // In a real implementation, this would fetch from the actual file
            // For now, we'll simulate loading the schema we saw
            this.schema = [
                {
                    name: "project",
                    fields: [
                        { name: "Name", type: "text" },
                        { name: "Description", type: "text" },
                        { name: "StartDate", type: "datetime" },
                        { name: "EndDate", type: "datetime" },
                        { name: "Budget", type: "number" },
                        { name: "Status", type: "text" },
                        { name: "Progress", type: "number" },
                        { name: "Objective", type: "rich_text" },
                        { name: "Scope", type: "rich_text" },
                        { name: "Stakeholders", type: "text" },
                        { name: "Customer", type: "text" },
                        { name: "ProjectManager", type: "text" },
                        { name: "Code", type: "text" },
                        { name: "TeamMembers", type: "text" },
                        { name: "Department", type: "text" },
                        { name: "Priority", type: "text" },
                        { name: "ContractAmount", type: "number" }
                    ]
                },
                {
                    name: "task",
                    fields: [
                        { name: "Name", type: "text" },
                        { name: "Description", type: "text" },
                        { name: "ProjectId", type: "text" },
                        { name: "Assignee", type: "text" },
                        { name: "Status", type: "text" },
                        { name: "Priority", type: "text" },
                        { name: "Weight", type: "number" },
                        { name: "Progress", type: "number" },
                        { name: "DueDate", type: "datetime" },
                        { name: "EstimatedHours", type: "number" },
                        { name: "PlannedStartDate", type: "datetime" },
                        { name: "PlannedEndDate", type: "datetime" }
                    ]
                },
                {
                    name: "worklog",
                    fields: [
                        { name: "Date", type: "datetime" },
                        { name: "UserId", type: "text" },
                        { name: "UserName", type: "text" },
                        { name: "WorkType", type: "text" },
                        { name: "ProjectId", type: "text" },
                        { name: "TaskId", type: "text" },
                        { name: "Description", type: "text" },
                        { name: "Hours", type: "number" },
                        { name: "Manday", type: "number" },
                        { name: "Status", type: "text" }
                    ]
                },
                {
                    name: "expense",
                    fields: [
                        { name: "Date", type: "datetime" },
                        { name: "ProjectId", type: "text" },
                        { name: "Category", type: "text" },
                        { name: "Amount", type: "number" },
                        { name: "Description", type: "text" },
                        { name: "UserId", type: "text" },
                        { name: "UserName", type: "text" },
                        { name: "Status", type: "text" }
                    ]
                },
                {
                    name: "user",
                    fields: [
                        { name: "Name", type: "text" },
                        { name: "Email", type: "text" },
                        { name: "Department", type: "text" },
                        { name: "Position", type: "text" },
                        { name: "Role", type: "text" },
                        { name: "HourlyRate", type: "number" },
                        { name: "Status", type: "text" },
                        { name: "Phone", type: "text" },
                        { name: "Password", type: "text" }
                    ]
                },
                {
                    name: "customer",
                    fields: [
                        { name: "Name", type: "text" },
                        { name: "ContactPerson", type: "text" },
                        { name: "Email", type: "text" },
                        { name: "Phone", type: "text" },
                        { name: "Address", type: "text" },
                        { name: "Type", type: "text" },
                        { name: "Status", type: "text" }
                    ]
                }
            ];

            console.log('✅ Trickle schema loaded successfully');
            console.log(`📊 Found ${this.schema.length} tables:`, this.schema.map(t => t.name).join(', '));
            
            return this.schema;
        } catch (error) {
            console.error('❌ Failed to load Trickle schema:', error);
            throw error;
        }
    }

    /**
     * Create field mappings from Trickle to Neon schema
     */
    createFieldMappings() {
        return {
            project: {
                'Name': 'name',
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
                'Code': 'code',
                'TeamMembers': 'team_members',
                'Department': 'department',
                'Priority': 'priority',
                'ContractAmount': 'contract_amount'
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
            worklog: {
                'Date': 'date',
                'UserId': 'user_id',
                'UserName': 'user_name',
                'WorkType': 'work_type',
                'ProjectId': 'project_id',
                'TaskId': 'task_id',
                'Description': 'description',
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
            },
            user: {
                'Name': 'name',
                'Email': 'email',
                'Department': 'department',
                'Position': 'position',
                'Role': 'role',
                'HourlyRate': 'hourly_rate',
                'Status': 'status',
                'Phone': 'phone',
                'Password': 'password'
            },
            customer: {
                'Name': 'name',
                'ContactPerson': 'contact_person',
                'Email': 'email',
                'Phone': 'phone',
                'Address': 'address',
                'Type': 'type',
                'Status': 'status'
            }
        };
    }

    /**
     * Create type mappings from Trickle to PostgreSQL
     */
    createTypeMappings() {
        return {
            'text': 'TEXT',
            'number': 'DECIMAL(15,2)',
            'datetime': 'TIMESTAMP WITH TIME ZONE',
            'rich_text': 'TEXT',
            'boolean': 'BOOLEAN'
        };
    }

    /**
     * Transform Trickle data to Neon format
     */
    transformTrickleData(tableName, trickleData) {
        const mappings = this.fieldMappings[tableName];
        if (!mappings) {
            throw new Error(`No field mappings found for table: ${tableName}`);
        }

        const transformed = {};
        
        // Map fields according to the schema
        Object.keys(trickleData).forEach(trickleField => {
            const neonField = mappings[trickleField];
            if (neonField && trickleData[trickleField] !== undefined) {
                transformed[neonField] = this.transformValue(
                    trickleData[trickleField], 
                    this.getFieldType(tableName, trickleField)
                );
            }
        });

        // Add required fields with defaults
        transformed.object_id = `migrated-${tableName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        if (tableName === 'project') {
            transformed.status = transformed.status || 'planning';
            transformed.progress = transformed.progress || 0;
        } else if (tableName === 'task') {
            transformed.status = transformed.status || 'todo';
            transformed.progress = transformed.progress || 0;
            transformed.weight = transformed.weight || 0;
        } else if (tableName === 'user') {
            transformed.status = transformed.status || 'active';
        }

        return transformed;
    }

    /**
     * Transform individual values
     */
    transformValue(value, type) {
        if (value === null || value === undefined) return null;
        
        switch (type) {
            case 'datetime':
                if (value instanceof Date) return value.toISOString();
                if (typeof value === 'string') {
                    // Handle various date formats from Trickle
                    const date = new Date(value);
                    return isNaN(date.getTime()) ? null : date.toISOString();
                }
                return value;
                
            case 'number':
                const num = parseFloat(value);
                return isNaN(num) ? 0 : num;
                
            case 'rich_text':
                return typeof value === 'string' ? value : JSON.stringify(value);
                
            default:
                return value;
        }
    }

    /**
     * Get field type from schema
     */
    getFieldType(tableName, fieldName) {
        const table = this.schema.find(t => t.name === tableName);
        if (!table) return 'text';
        
        const field = table.fields.find(f => f.name === fieldName);
        return field ? field.type : 'text';
    }

    /**
     * Generate migration SQL for a table
     */
    generateMigrationSQL(tableName, sourceData) {
        const transformedData = sourceData.map(item => 
            this.transformTrickleData(tableName, item.objectData || item)
        );

        // Use Query Manager to create safe batches
        const batches = this.queryManager.createBatchedQuery(
            `${tableName}s`, // Convert 'project' to 'projects'
            transformedData,
            50 // Batch size
        );

        let sql = `-- Migration from Trickle to Neon PostgreSQL\n`;
        sql += `-- Table: ${tableName}\n`;
        sql += `-- Generated: ${new Date().toISOString()}\n`;
        sql += `-- Records: ${sourceData.length}\n`;
        sql += `-- Batches: ${batches.length}\n\n`;

        batches.forEach((batch, index) => {
            sql += `-- Batch ${batch.batchNumber}/${batches.length} (${batch.recordCount} records)\n`;
            sql += batch.query + ';\n\n';
        });

        return {
            sql: sql,
            batches: batches,
            recordCount: sourceData.length,
            batchCount: batches.length
        };
    }

    /**
     * Create CSV import template
     */
    createCSVImportTemplate(tableName) {
        const mappings = this.fieldMappings[tableName];
        if (!mappings) return null;

        const headers = Object.keys(mappings);
        const csvHeaders = headers.join(',');
        
        let template = `# CSV Import Template for ${tableName}\n`;
        template += `# Generated: ${new Date().toISOString()}\n`;
        template += `# Required columns: ${csvHeaders}\n`;
        template += `# Transform to: ${Object.values(mappings).join(', ')}\n\n`;
        template += csvHeaders + '\n';
        
        // Add sample row
        const sampleData = this.getSampleData(tableName);
        const sampleRow = headers.map(header => sampleData[header] || '').join(',');
        template += sampleRow + '\n';

        return template;
    }

    /**
     * Get sample data for CSV template
     */
    getSampleData(tableName) {
        const samples = {
            project: {
                'Name': 'Sample Project',
                'Description': 'Project description',
                'StartDate': '2025-01-01',
                'EndDate': '2025-12-31',
                'Budget': '500000',
                'Status': 'active',
                'Progress': '50',
                'Objective': 'Project objectives',
                'Scope': 'Project scope',
                'Stakeholders': 'Key stakeholders',
                'Customer': 'Customer name',
                'ProjectManager': 'Manager name',
                'Code': 'PRJ-001',
                'TeamMembers': 'Team member 1, Team member 2',
                'Department': 'Development',
                'Priority': 'high',
                'ContractAmount': '550000'
            },
            task: {
                'Name': 'Sample Task',
                'Description': 'Task description',
                'ProjectId': 'project-id-here',
                'Assignee': 'Assignee name',
                'Status': 'progress',
                'Priority': 'high',
                'Weight': '25',
                'Progress': '50',
                'DueDate': '2025-02-28',
                'EstimatedHours': '40',
                'PlannedStartDate': '2025-01-15',
                'PlannedEndDate': '2025-02-15'
            },
            user: {
                'Name': 'John Doe',
                'Email': 'john@example.com',
                'Department': 'Development',
                'Position': 'Developer',
                'Role': 'employee',
                'HourlyRate': '400',
                'Status': 'active',
                'Phone': '02-123-4567',
                'Password': 'password123'
            }
        };

        return samples[tableName] || {};
    }

    /**
     * Process CSV file data
     */
    processCSVData(tableName, csvData) {
        const lines = csvData.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const mappings = this.fieldMappings[tableName];
        
        if (!mappings) {
            throw new Error(`No mappings found for table: ${tableName}`);
        }

        // Create reverse mapping (CSV header -> Trickle field)
        const reverseMappings = {};
        Object.keys(mappings).forEach(trickleField => {
            const neonField = mappings[trickleField];
            const csvIndex = headers.indexOf(neonField);
            if (csvIndex !== -1) {
                reverseMappings[csvIndex] = trickleField;
            }
        });

        const processedData = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const record = {};
            
            Object.keys(reverseMappings).forEach(index => {
                const fieldName = reverseMappings[index];
                const value = values[parseInt(index)];
                if (value) {
                    record[fieldName] = value;
                }
            });
            
            if (Object.keys(record).length > 0) {
                processedData.push(record);
            }
        }

        return processedData;
    }

    /**
     * Create migration summary
     */
    createMigrationSummary() {
        if (!this.schema) {
            return { error: 'Schema not loaded' };
        }

        const summary = {
            tables: [],
            totalTables: this.schema.length,
            estimatedRecords: {},
            recommendations: []
        };

        this.schema.forEach(table => {
            const mappingCount = Object.keys(this.fieldMappings[table.name] || {}).length;
            summary.tables.push({
                name: table.name,
                fieldCount: table.fields.length,
                mappedFields: mappingCount,
                neonTable: `${table.name}s`,
                status: mappingCount > 0 ? 'Ready' : 'No mapping'
            });
        });

        summary.recommendations = [
            'Load actual Trickle data before running migration',
            'Use batch processing for large datasets',
            'Test with sample data first',
            'Backup existing data before migration',
            'Verify data integrity after migration'
        ];

        return summary;
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.TrickleToNeonMigrator = TrickleToNeonMigrator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrickleToNeonMigrator;
}