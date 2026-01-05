import axios from 'axios';

export interface SystemSetting {
  id: number;
  key: string;
  value: any;
  type: 'string' | 'boolean' | 'number' | 'json';
  description?: string;
  created_at: string;
  updated_at: string;
}

class SettingsService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get a setting by key
   */
  async getSetting(key: string): Promise<any> {
    // Check cache first
    const cached = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);
    if (cached && expiry && expiry > Date.now()) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseURL}/settings/${key}`);
      const value = response.data.value;
      
      // Cache the value
      this.cache.set(key, value);
      this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
      
      return value;
    } catch (error) {
      console.error(`Failed to get setting: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get multiple settings
   */
  async getSettings(keys: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    
    for (const key of keys) {
      result[key] = await this.getSetting(key);
    }
    
    return result;
  }

  /**
   * Update a setting
   */
  async updateSetting(key: string, value: any): Promise<void> {
    try {
      await axios.put(`${this.baseURL}/settings/${key}`, {
        value,
        type: typeof value,
      });
      
      // Invalidate cache
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } catch (error) {
      console.error(`Failed to update setting: ${key}`, error);
      throw error;
    }
  }

  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(featureName: string): Promise<boolean> {
    try {
      const setting = await this.getSetting(`feature.${featureName}.enabled`);
      return setting?.enabled === true;
    } catch {
      return false;
    }
  }

  /**
   * Get all settings matching a pattern
   */
  async getSettingsByPattern(pattern: string): Promise<Record<string, any>> {
    try {
      const response = await axios.get(`${this.baseURL}/settings?pattern=${pattern}`);
      return response.data.reduce((acc: any, setting: SystemSetting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
    } catch (error) {
      console.error(`Failed to get settings by pattern: ${pattern}`, error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Invalidate cache for a specific key
   */
  invalidateCache(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }
}

export const settingsService = new SettingsService();
