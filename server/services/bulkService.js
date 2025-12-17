const { pool } = require('../config/database');

class BulkService {
  /**
   * Execute multiple operations in a transaction
   * @param {Array} operations - Array of operations to execute
   * @returns {Promise<Object>} Results of the operations
   */
  async executeBulkOperations(operations) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const results = [];
      
      for (const op of operations) {
        try {
          const { type, data } = op;
          let result;
          
          switch (type) {
            case 'create':
              result = await this.createEntity(client, data);
              break;
              
            case 'update':
              result = await this.updateEntity(client, data);
              break;
              
            case 'delete':
              result = await this.deleteEntity(client, data);
              break;
              
            default:
              throw new Error(`Unsupported operation type: ${type}`);
          }
          
          results.push({
            operation: type,
            entity: data.entity,
            id: data.id || result.rows[0]?.id,
            success: true,
            result
          });
          
        } catch (error) {
          // Log the error but continue with other operations
          console.error(`Operation failed:`, error);
          results.push({
            operation: op.type,
            entity: op.data.entity,
            id: op.data.id,
            success: false,
            error: error.message
          });
        }
      }
      
      await client.query('COMMIT');
      return { success: true, results };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Bulk operation failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Create a new entity
   */
  async createEntity(client, { entity, data }) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${entity} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    return result.rows[0];
  }
  
  /**
   * Update an existing entity
   */
  async updateEntity(client, { entity, id, data }) {
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(data)) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    values.push(id);
    
    const query = `
      UPDATE ${entity}
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    return result.rows[0];
  }
  
  /**
   * Delete an entity
   */
  async deleteEntity(client, { entity, id, softDelete = true }) {
    if (softDelete) {
      const query = `
        UPDATE ${entity}
        SET is_deleted = true, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      const result = await client.query(query, [id]);
      return result.rows[0];
    } else {
      const query = `
        DELETE FROM ${entity}
        WHERE id = $1
        RETURNING *
      `;
      const result = await client.query(query, [id]);
      return result.rows[0];
    }
  }
  
  /**
   * Batch import data
   */
  async batchImport(entity, items) {
    if (!items || !items.length) {
      throw new Error('No items to import');
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get column names from the first item
      const columns = Object.keys(items[0]);
      const placeholders = items.map(
        (_, rowIndex) => `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
      ).join(', ');
      
      const values = [];
      items.forEach(item => {
        columns.forEach(col => {
          values.push(item[col]);
        });
      });
      
      const query = `
        INSERT INTO ${entity} (${columns.join(', ')})
        VALUES ${placeholders}
        ON CONFLICT (id) DO UPDATE
        SET ${columns.filter(col => !['id', 'created_at', 'created_by'].includes(col))
          .map((col, i) => `${col} = EXCLUDED.${col}`).join(', ')}
        RETURNING *
      `;
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      
      return {
        success: true,
        imported: result.rowCount,
        items: result.rows
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Batch import failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Export data with filters
   */
  async exportData(entity, filters = {}) {
    const whereClauses = [];
    const params = [];
    let paramIndex = 1;
    
    // Build where clause from filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          whereClauses.push(`${key} = ANY($${paramIndex++})`);
          params.push(value);
        } else {
          whereClauses.push(`${key} = $${paramIndex++}`);
          params.push(value);
        }
      }
    }
    
    const whereClause = whereClauses.length > 0 
      ? `WHERE ${whereClauses.join(' AND ')}` 
      : '';
    
    const query = `
      SELECT *
      FROM ${entity}
      ${whereClause}
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = new BulkService();
