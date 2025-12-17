/**
 * Enhanced Migration Script with Query Truncation Prevention
 * Addresses the "5543 characters will be truncated" issue
 */

class EnhancedMigrationTool {
    constructor() {
        this.queryManager = new QueryManager();
        this.migrationConfig = {
            batchSize: 50, // Smaller batch size to prevent truncation
            maxQueryLength: 45000, // Leave buffer below 50k limit
            enableProgressTracking: true,
            enableRollback: true
        };
        this.migrationLog = [];
    }

    /**
     * Enhanced migration with truncation prevention
     */
    async migrateWithTruncationProtection(sourceData, tableName, transformFunction) {
        console.log(`🚀 Starting protected migration for ${tableName}`);
        console.log(`📊 Total records: ${sourceData.length}`);
        
        // Transform data if needed
        const transformedData = sourceData.map(item => 
            transformFunction ? transformFunction(item) : item
        );

        // Create batches optimized for Neon Console
        const batches = this.queryManager.createBatchedQuery(
            tableName, 
            transformedData, 
            this.migrationConfig.batchSize
        );

        console.log(`📦 Created ${batches.length} batches (${this.migrationConfig.batchSize} records each)`);

        // Execute with progress tracking
        const results = await this.queryManager.executeBatchedQueries(
            batches, 
            (query) => this.executeQuerySafely(query)
        );

        // Generate detailed report
        const report = this.generateMigrationReport(tableName, results, batches);
        
        return {
            success: results.errors.length === 0,
            report,
            executionTime: this.calculateTotalTime(),
            nextSteps: this.getNextSteps(results)
        };
    }

    /**
     * Execute query with safety measures
     */
    async executeQuerySafely(query) {
        // Check query length before execution
        if (query.length > this.migrationConfig.maxQueryLength) {
            throw new Error(`Query too long (${query.length} chars). Max allowed: ${this.migrationConfig.maxQueryLength}`);
        }

        // Log query attempt
        this.migrationLog.push({
            type: 'query_attempt',
            length: query.length,
            timestamp: new Date().toISOString(),
            preview: query.substring(0, 100) + '...'
        });

        // In real implementation, this would execute against Neon
        // For now, we'll simulate execution
        await this.simulateQueryExecution(query);
        
        return { success: true, queryLength: query.length };
    }

    /**
     * Simulate query execution (replace with actual Neon execution)
     */
    async simulateQueryExecution(query) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        // Simulate occasional errors (5% chance)
        if (Math.random() < 0.05) {
            throw new Error('Simulated database error');
        }
    }

    /**
     * Generate comprehensive migration report
     */
    generateMigrationReport(tableName, results, batches) {
        const totalBatches = batches.length;
        const successfulBatches = results.results.length;
        const failedBatches = results.errors.length;
        const totalRecords = batches.reduce((sum, batch) => sum + batch.recordCount, 0);
        
        return {
            table: tableName,
            timestamp: new Date().toISOString(),
            summary: {
                totalBatches,
                successfulBatches,
                failedBatches,
                successRate: ((successfulBatches / totalBatches) * 100).toFixed(2) + '%',
                totalRecords,
                estimatedDuration: `${Math.round(totalBatches * 0.8)} seconds`
            },
            queryAnalysis: {
                averageBatchSize: Math.round(totalRecords / totalBatches),
                largestBatchLength: Math.max(...batches.map(b => b.query.length)),
                smallestBatchLength: Math.min(...batches.map(b => b.query.length)),
                truncationRisk: this.assessTruncationRisk(batches)
            },
            errors: results.errors,
            recommendations: this.getSpecificRecommendations(results, batches)
        };
    }

    /**
     * Assess truncation risk for future queries
     */
    assessTruncationRisk(batches) {
        const maxLength = Math.max(...batches.map(b => b.query.length));
        const maxHistoryLimit = 8000; // Neon Console history limit
        
        if (maxLength > maxHistoryLimit) {
            return {
                level: 'HIGH',
                message: 'Queries may exceed Neon Console display limits',
                action: 'Use external SQL files or command-line execution'
            };
        } else if (maxLength > 50000) {
            return {
                level: 'MEDIUM',
                message: 'Queries are large but should execute properly',
                action: 'Consider smaller batch sizes for better performance'
            };
        } else {
            return {
                level: 'LOW',
                message: 'Queries are within safe limits',
                action: 'Safe to execute in Neon Console'
            };
        }
    }

    /**
     * Get specific recommendations based on results
     */
    getSpecificRecommendations(results, batches) {
        const recommendations = [];
        
        if (results.errors.length > 0) {
            recommendations.push('Review failed batches and retry individually');
            recommendations.push('Check data integrity for failed records');
        }
        
        if (batches.length > 20) {
            recommendations.push('Consider increasing batch size if performance is good');
            recommendations.push('Monitor execution time for optimization opportunities');
        }
        
        const avgLength = batches.reduce((sum, b) => sum + b.query.length, 0) / batches.length;
        if (avgLength > 40000) {
            recommendations.push('Current batch size may be too large for optimal performance');
        }
        
        recommendations.push('Use Query Manager for future large migrations');
        recommendations.push('Keep backup of original data before migration');
        
        return recommendations;
    }

    /**
     * Calculate total migration time
     */
    calculateTotalTime() {
        const startTime = this.migrationLog.find(log => log.type === 'migration_start')?.timestamp;
        const endTime = this.migrationLog[this.migrationLog.length - 1]?.timestamp;
        
        if (startTime && endTime) {
            return Math.round((new Date(endTime) - new Date(startTime)) / 1000);
        }
        
        return 0;
    }

    /**
     * Get next steps based on migration results
     */
    getNextSteps(results) {
        if (results.errors.length === 0) {
            return [
                'Migration completed successfully!',
                'Verify data integrity in target table',
                'Update application configuration to use new database',
                'Consider implementing regular data validation'
            ];
        } else {
            return [
                `Review and retry ${results.errors.length} failed batches`,
                'Check data format and constraints',
                'Consider running smaller test batches first',
                'Contact support if errors persist'
            ];
        }
    }

    /**
     * Create Neon-optimized SQL files
     */
    createSQLFiles(tableName, sourceData, transformFunction) {
        const transformedData = sourceData.map(item => 
            transformFunction ? transformFunction(item) : item
        );

        const batches = this.queryManager.createBatchedQuery(
            tableName, 
            transformedData, 
            this.migrationConfig.batchSize
        );

        // Create main migration file
        let mainScript = `-- Enhanced Migration Script for ${tableName}\n`;
        mainScript += `-- Generated: ${new Date().toISOString()}\n`;
        mainScript += `-- Total records: ${sourceData.length}\n`;
        mainScript += `-- Batches: ${batches.length}\n`;
        mainScript += `-- This script is optimized for Neon PostgreSQL\n\n`;

        // Add individual batch files
        batches.forEach((batch, index) => {
            const filename = `batch_${String(index + 1).padStart(3, '0')}_${tableName}.sql`;
            const content = `-- Batch ${batch.batchNumber}/${batches.length}\n`;
            content += `-- Records ${batch.startIndex + 1} to ${batch.endIndex}\n`;
            content += `-- Length: ${batch.query.length} characters\n\n';
            content += batch.query + ';\n';

            // In a real implementation, you'd write these files
            console.log(`Created file: ${filename} (${content.length} chars)`);
        });

        // Add to main script
        batches.forEach((batch) => {
            mainScript += `-- Batch ${batch.batchNumber} (${batch.recordCount} records)\n`;
            mainScript += batch.query + ';\n\n';
        });

        return {
            mainScript,
            batchCount: batches.length,
            totalLength: mainScript.length,
            largestBatch: Math.max(...batches.map(b => b.query.length))
        };
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.EnhancedMigrationTool = EnhancedMigrationTool;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedMigrationTool;
}