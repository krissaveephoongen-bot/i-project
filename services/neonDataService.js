/**
 * Neon Data API Service
 * Direct REST API access to Neon PostgreSQL database tables
 * Handles all CRUD operations without RLS restrictions
 */

import axios from 'axios';

const NEON_API_URL = process.env.REACT_APP_NEON_REST_API_ENDPOINT || 
  'https://ep-muddy-cherry-ah612m1a.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1';

// Create axios instance for Neon API
const neonClient = axios.create({
  baseURL: NEON_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
});

export const neonDataService = {
  /**
   * Get all records from a table
   * @param {string} tableName - Table name
   * @param {object} options - Query options (filters, ordering, limit)
   */
  async getAll(tableName, options = {}) {
    try {
      let url = `/${tableName}`;
      const params = new URLSearchParams();

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          params.append(`${key}`, `eq.${value}`);
        });
      }

      if (options.order) {
        params.append('order', options.order);
      }

      if (options.limit) {
        params.append('limit', options.limit);
      }

      if (options.offset) {
        params.append('offset', options.offset);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await neonClient.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Get a single record by ID
   * @param {string} tableName - Table name
   * @param {number|string} id - Record ID
   */
  async getById(tableName, id) {
    try {
      const response = await neonClient.get(`/${tableName}?id=eq.${id}`);
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error fetching ${tableName} with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get records with custom filter
   * @param {string} tableName - Table name
   * @param {object} filterObj - Filter object {columnName: value}
   */
  async getBy(tableName, filterObj) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filterObj).forEach(([key, value]) => {
        if (typeof value === 'string' && value.includes('%')) {
          params.append(`${key}`, `ilike.${value}`);
        } else {
          params.append(`${key}`, `eq.${value}`);
        }
      });

      const response = await neonClient.get(`/${tableName}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error querying ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Create a new record
   * @param {string} tableName - Table name
   * @param {object} data - Record data
   */
  async create(tableName, data) {
    try {
      const response = await neonClient.post(`/${tableName}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Update a record by ID
   * @param {string} tableName - Table name
   * @param {number|string} id - Record ID
   * @param {object} data - Updated data
   */
  async updateById(tableName, id, data) {
    try {
      const response = await neonClient.patch(
        `/${tableName}?id=eq.${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating ${tableName} with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update records with custom filter
   * @param {string} tableName - Table name
   * @param {object} filterObj - Filter object
   * @param {object} data - Updated data
   */
  async updateBy(tableName, filterObj, data) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filterObj).forEach(([key, value]) => {
        params.append(`${key}`, `eq.${value}`);
      });

      const response = await neonClient.patch(
        `/${tableName}?${params.toString()}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating records in ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Delete a record by ID
   * @param {string} tableName - Table name
   * @param {number|string} id - Record ID
   */
  async deleteById(tableName, id) {
    try {
      const response = await neonClient.delete(`/${tableName}?id=eq.${id}`);
      return response.status === 204 || response.data;
    } catch (error) {
      console.error(`Error deleting ${tableName} with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete records with custom filter
   * @param {string} tableName - Table name
   * @param {object} filterObj - Filter object
   */
  async deleteBy(tableName, filterObj) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filterObj).forEach(([key, value]) => {
        params.append(`${key}`, `eq.${value}`);
      });

      const response = await neonClient.delete(
        `/${tableName}?${params.toString()}`
      );
      return response.status === 204 || response.data;
    } catch (error) {
      console.error(`Error deleting records from ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Count records in a table
   * @param {string} tableName - Table name
   * @param {object} filters - Optional filters
   */
  async count(tableName, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('select', 'count()');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(`${key}`, `eq.${value}`);
        });
      }

      const response = await neonClient.get(`/${tableName}?${params.toString()}`);
      return parseInt(response.headers['content-range']?.split('/')[1] || 0);
    } catch (error) {
      console.error(`Error counting records in ${tableName}:`, error);
      throw error;
    }
  }
};

export default neonDataService;
