// Base Data Service Class
// Provides common CRUD operations and error handling

import { prisma } from './database'

export interface BaseServiceOptions {
  include?: any
  select?: any
  orderBy?: any
  where?: any
  skip?: number
  take?: number
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export abstract class BaseService<T, CreateInput, UpdateInput> {
  protected model: any

  constructor(model: any) {
    this.model = model
  }

  // Create operation
  async create(data: CreateInput, options?: BaseServiceOptions): Promise<T> {
    try {
      const result = await this.model.create({
        data,
        ...options
      })
      return result as T
    } catch (error) {
      console.error(`Create operation failed:`, error)
      throw new Error(`Failed to create record: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Read operations
  async findById(id: string, options?: BaseServiceOptions): Promise<T | null> {
    try {
      const result = await this.model.findUnique({
        where: { id },
        ...options
      })
      return result as T | null
    } catch (error) {
      console.error(`Find by ID operation failed:`, error)
      throw new Error(`Failed to find record: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async findMany(options?: BaseServiceOptions): Promise<T[]> {
    try {
      const result = await this.model.findMany(options)
      return result as T[]
    } catch (error) {
      console.error(`Find many operation failed:`, error)
      throw new Error(`Failed to find records: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async findFirst(options?: BaseServiceOptions): Promise<T | null> {
    try {
      const result = await this.model.findFirst(options)
      return result as T | null
    } catch (error) {
      console.error(`Find first operation failed:`, error)
      throw new Error(`Failed to find record: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Update operations
  async update(id: string, data: UpdateInput, options?: BaseServiceOptions): Promise<T> {
    try {
      const result = await this.model.update({
        where: { id },
        data,
        ...options
      })
      return result as T
    } catch (error) {
      console.error(`Update operation failed:`, error)
      throw new Error(`Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateMany(where: any, data: UpdateInput): Promise<{ count: number }> {
    try {
      const result = await this.model.updateMany({
        where,
        data
      })
      return result
    } catch (error) {
      console.error(`Update many operation failed:`, error)
      throw new Error(`Failed to update records: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Delete operations
  async delete(id: string, options?: BaseServiceOptions): Promise<T> {
    try {
      const result = await this.model.delete({
        where: { id },
        ...options
      })
      return result as T
    } catch (error) {
      console.error(`Delete operation failed:`, error)
      throw new Error(`Failed to delete record: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    try {
      const result = await this.model.deleteMany({
        where
      })
      return result
    } catch (error) {
      console.error(`Delete many operation failed:`, error)
      throw new Error(`Failed to delete records: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Count operations
  async count(where?: any): Promise<number> {
    try {
      const result = await this.model.count({
        where
      })
      return result
    } catch (error) {
      console.error(`Count operation failed:`, error)
      throw new Error(`Failed to count records: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Pagination
  async findPaginated(
    pagination: PaginationOptions,
    options?: BaseServiceOptions
  ): Promise<PaginatedResult<T>> {
    const page = pagination.page || 1
    const limit = pagination.limit || 10
    const skip = (page - 1) * limit

    const orderBy = pagination.sortBy 
      ? { [pagination.sortBy]: pagination.sortOrder || 'asc' }
      : options?.orderBy

    try {
      const [data, total] = await Promise.all([
        this.model.findMany({
          ...options,
          skip,
          take: limit,
          orderBy
        }),
        this.count(options?.where)
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        data: data as T[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      console.error(`Paginated find operation failed:`, error)
      throw new Error(`Failed to find paginated records: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Check existence
  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.model.findUnique({
        where: { id },
        select: { id: true }
      })
      return !!result
    } catch (error) {
      console.error(`Exists check failed:`, error)
      return false
    }
  }

  // Bulk operations
  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    try {
      const result = await this.model.createMany({
        data
      })
      return result
    } catch (error) {
      console.error(`Create many operation failed:`, error)
      throw new Error(`Failed to create records: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
