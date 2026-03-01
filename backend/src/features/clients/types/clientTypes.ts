/**
 * Client Types and Interfaces
 */

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientWithRelations extends Client {
  projectCount?: number;
  totalProjectValue?: number;
}

export interface CreateClientDTO {
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientDTO {
  name?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
}

export interface ClientFilters {
  search?: string;
  taxId?: string;
}

export interface ClientPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ClientListResult {
  clients: ClientWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
