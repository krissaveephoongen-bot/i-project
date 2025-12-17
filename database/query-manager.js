/**
 * Query Manager for Neon PostgreSQL
 * Handles large queries and prevents truncation issues
 */

class QueryManager {
    constructor() {
        this.maxQueryLength = 50000; // Safe limit for most clients
        this.batchSize = 100; // Records per batch
        this.executionLog = [];
        this.currentQuery = '';
    }

    /**
     * Split large queries into smaller batches
     */
    createBatchedQuery(baseQuery, data, batchSize = this.batchSize) {
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchQuery = this.buildInsertQuery(baseQuery, batch);
            batches.push({
                query: batchQuery,
                batchNumber: Math.floor(i / batchSize) + 1,
                recordCount: batch.length,
                startIndex: i,
                endIndex: i + batch.length
            });
        }
        return batches;
    }

    /**
     * Build INSERT query for a batch of records
     */
    buildInsertQuery(table, records) {
        if (records.length === 0) return '';
        
        const columns = Object.keys(records[0]);
        const values = records.map(record => {
            return '(' + columns.map(col => {
                const value = record[col];
                if (value === null || value === undefined) return 'NULL';
                if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                if (typeof value === 'number') return value;
                if (value instanceof Date) return `'${value.toISOString()}'`;
                return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            }).join(', ') + ')';
        }).join(', ');

        return `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values}`;
    }

    /**
     * Create migration script with query logging
     */
    createOptimizedMigrationScript(tableName, sourceData) {
        const batches = this.createBatchedQuery(tableName, sourceData);
        let script = `-- Optimized Migration Script for ${tableName}\n`;
        script += `-- Generated: ${new Date().toISOString()}\n`;
        script += `-- Total records: ${sourceData.length}\n`;
        script += `-- Batches: ${batches.length}\n\n`;

        batches.forEach((batch, index) => {
            script += `-- Batch ${batch.batchNumber}/${batches.length} (${batch.recordCount} records)\n`;
            script += `-- Records ${batch.startIndex + 1} to ${batch.endIndex}\n`;
            script += batch.query + ';\n\n';
        });

        return script;
    }

    /**
     * Execute queries with progress tracking
     */
    async executeBatchedQueries(batches, executeCallback) {
        const results = [];
        const errors = [];
        
        for (const batch of batches) {
            try {
                console.log(`Executing batch ${batch.batchNumber}/${batches.length}...`);
                
                const startTime = Date.now();
                const result = await executeCallback(batch.query);
                const duration = Date.now() - startTime;
                
                results.push({
                    batch: batch.batchNumber,
                    success: true,
                    duration,
                    recordCount: batch.recordCount,
                    query: batch.query.substring(0, 200) + '...' // Log truncated query
                });

                this.logExecution({
                    type: 'success',
                    batch: batch.batchNumber,
                    duration,
                    recordCount: batch.recordCount,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                errors.push({
                    batch: batch.batchNumber,
                    error: error.message,
                    query: batch.query.substring(0, 200) + '...'
                });

                this.logExecution({
                    type: 'error',
                    batch: batch.batchNumber,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        return { results, errors };
    }

    /**
     * Monitor query execution
     */
    logExecution(execution) {
        this.executionLog.push(execution);
        
        if (execution.type === 'success') {
            console.log(`✅ Batch ${execution.batch} completed: ${execution.duration}ms, ${execution.recordCount} records`);
        } else {
            console.error(`❌ Batch ${execution.batch} failed: ${execution.error}`);
        }
    }

    /**
     * Generate migration report
     */
    generateReport() {
        const totalBatches = this.executionLog.length;
        const successful = this.executionLog.filter(log => log.type === 'success').length;
        const failed = this.executionLog.filter(log => log.type === 'error').length;
        const totalRecords = this.executionLog
            .filter(log => log.type === 'success')
            .reduce((sum, log) => sum + (log.recordCount || 0), 0);

        return {
            summary: {
                totalBatches,
                successful,
                failed,
                successRate: totalBatches > 0 ? (successful / totalBatches * 100).toFixed(2) + '%' : '0%',
                totalRecords
            },
            executionLog: this.executionLog,
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get recommendations to avoid truncation
     */
    getRecommendations() {
        return [
            'Use batch size of 100 or less for complex queries',
            'Split queries longer than 50,000 characters',
            'Use the Neon Console SQL editor for queries under 8KB',
            'Export large queries to .sql files and run via CLI',
            'Monitor query execution time to identify performance issues',
            'Use WHERE clauses to limit result sets',
            'Consider using COPY for very large data imports'
        ];
    }

    /**
     * Create summary for Neon Console
     */
    createConsoleSummary() {
        return {
            status: 'Query Manager Initialized',
            maxQueryLength: this.maxQueryLength,
            recommendedBatchSize: this.batchSize,
            executionLogCount: this.executionLog.length,
            timestamp: new Date().toISOString()
        };
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.QueryManager = QueryManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QueryManager;
}