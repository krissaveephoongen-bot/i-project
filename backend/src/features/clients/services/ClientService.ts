/**
 * Client Service - Business logic for client operations
 */

import { db } from '../../../shared/database/connection';
import { clients } from '../../../shared/database/schema';
import { eq, ilike, desc, sql } from 'drizzle-orm';
import {
  Client,
  ClientWithRelations,
  CreateClientDTO,
  UpdateClientDTO,
  ClientFilters,
  ClientPagination,
  ClientListResult,
} from '../types/clientTypes';

export class ClientService {
  /**
   * Get all clients with filtering and pagination
   */
  async getClients(
    filters: ClientFilters,
    pagination: ClientPagination
  ): Promise<ClientListResult> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any[] = [];

    if (filters.search) {
      whereConditions.push(
        ilike(clients.name, `%${filters.search}%`)
      );
    }

    if (filters.taxId) {
      whereConditions.push(eq(clients.taxId, filters.taxId));
    }

    const whereClause = whereConditions.length > 0 
      ? whereConditions.reduce((acc, cond) => acc || cond)
      : undefined;

    // Fetch total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clients)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    // Fetch data
    const clientList = await db
      .select()
      .from(clients)
      .where(whereClause)
      .orderBy(
        sortBy === 'name'
          ? sortOrder === 'asc'
            ? clients.name
            : desc(clients.name)
          : sortOrder === 'asc'
            ? clients.createdAt
            : desc(clients.createdAt)
      )
      .limit(limit)
      .offset(offset);

    return {
      clients: clientList as ClientWithRelations[],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get client by ID
   */
  async getClientById(id: string): Promise<ClientWithRelations> {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new Error('Client not found');
    }

    return result[0] as ClientWithRelations;
  }

  /**
   * Create new client
   */
  async createClient(data: CreateClientDTO): Promise<ClientWithRelations> {
    // Check for duplicate taxId if provided
    if (data.taxId) {
      const existing = await db
        .select()
        .from(clients)
        .where(eq(clients.taxId, data.taxId))
        .limit(1);

      if (existing.length > 0) {
        throw new Error('Client with this tax ID already exists');
      }
    }

    // Create client
    const result = await db
      .insert(clients)
      .values(data)
      .returning();

    if (result.length === 0) {
      throw new Error('Failed to create client');
    }

    return this.getClientById(result[0].id);
  }

  /**
   * Update client
   */
  async updateClient(id: string, data: UpdateClientDTO): Promise<ClientWithRelations> {
    // Check if client exists
    const existing = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Client not found');
    }

    // Check for duplicate taxId if updating
    if (data.taxId && data.taxId !== existing[0].taxId) {
      const duplicate = await db
        .select()
        .from(clients)
        .where(eq(clients.taxId, data.taxId))
        .limit(1);

      if (duplicate.length > 0) {
        throw new Error('Client with this tax ID already exists');
      }
    }

    // Update client
    const result = await db
      .update(clients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error('Failed to update client');
    }

    return this.getClientById(id);
  }

  /**
   * Delete client
   */
  async deleteClient(id: string): Promise<void> {
    const result = await db.delete(clients).where(eq(clients.id, id)).returning();

    if (result.length === 0) {
      throw new Error('Client not found');
    }
  }

  /**
   * Get client by email
   */
  async getClientByEmail(email: string): Promise<ClientWithRelations | null> {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.email, email))
      .limit(1);

    return result.length > 0 ? (result[0] as ClientWithRelations) : null;
  }

  /**
   * Search clients
   */
  async searchClients(query: string, limit: number = 10): Promise<ClientWithRelations[]> {
    return db
      .select()
      .from(clients)
      .where(ilike(clients.name, `%${query}%`))
      .limit(limit);
  }

  /**
   * Get clients count
   */
  async getClientsCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clients);

    return result[0]?.count || 0;
  }
}
