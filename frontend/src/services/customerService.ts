/**
 * Customer Service
 * Handles all customer/client related API calls
 */

export interface Customer {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: 'government' | 'private' | 'individual';
  status?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export const customerService = {
  /**
   * Get all customers
   */
  async getCustomers(): Promise<{ success: boolean; data: Customer[]; message?: string }> {
    try {
      const response = await fetch('/api/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch customers: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data || [],
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch customers',
      };
    }
  },

  /**
   * Get customer by ID
   */
  async getCustomer(id: string): Promise<{ success: boolean; data?: Customer; message?: string }> {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch customer: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('Error fetching customer:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch customer',
      };
    }
  },

  /**
   * Create new customer
   */
  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Customer; message?: string }> {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create customer: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create customer',
      };
    }
  },

  /**
   * Update customer
   */
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<{ success: boolean; data?: Customer; message?: string }> {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update customer: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update customer',
      };
    }
  },

  /**
   * Delete customer
   */
  async deleteCustomer(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete customer: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete customer',
      };
    }
  },
};
