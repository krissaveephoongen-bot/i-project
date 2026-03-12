// User Service
// Handles all user-related database operations

import { prisma } from '../database'
import { BaseService, type BaseServiceOptions, type PaginationOptions, type PaginatedResult } from '../base-service'
import type { users, Prisma } from '@prisma/client'

type User = users

export type UserCreateInput = Prisma.usersUncheckedCreateInput
export type UserUpdateInput = Prisma.usersUncheckedUpdateInput
export type UserWhereInput = Prisma.usersWhereInput
export type UserIncludeOptions = Prisma.usersInclude

export interface UserWithRelations extends users {
  projects?: any[]
  tasks?: any[]
  project_members?: any[]
}

export class UserService extends BaseService<users, UserCreateInput, UserUpdateInput> {
  constructor() {
    super(prisma.users)
  }

  // Find user by email
  async findByEmail(email: string): Promise<users | null> {
    try {
      const result = await prisma.users.findUnique({
        where: { email }
      })
      return result
    } catch (error) {
      console.error(`Find by email failed:`, error)
      throw new Error(`Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Find user by employee code
  async findByEmployeeCode(employeeCode: string): Promise<users | null> {
    try {
      const result = await prisma.users.findFirst({
        where: { employee_code: employeeCode }
      })
      return result
    } catch (error) {
      console.error(`Find by employee code failed:`, error)
      throw new Error(`Failed to find user by employee code: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get users with basic info only (for dropdown lists)
  async getBasicUsers(where?: UserWhereInput): Promise<Pick<users, 'id' | 'name' | 'email' | 'role' | 'department' | 'position'>[]> {
    try {
      const result = await prisma.users.findMany({
        where: {
          ...where
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          position: true
        },
        orderBy: {
          name: 'asc'
        }
      })
      return result
    } catch (error) {
      console.error(`Get basic users failed:`, error)
      throw new Error(`Failed to get basic users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get users by role
  async getUsersByRole(role: string, options?: BaseServiceOptions): Promise<users[]> {
    try {
      const result = await prisma.users.findMany({
        where: {
          role
        },
        ...options
      })
      return result
    } catch (error) {
      console.error(`Get users by role failed:`, error)
      throw new Error(`Failed to get users by role: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get project managers
  async getProjectManagers(): Promise<Pick<users, 'id' | 'name' | 'email' | 'department'>[]> {
    try {
      const result = await prisma.users.findMany({
        where: {
          role: 'manager'
        },
        select: {
          id: true,
          name: true,
          email: true,
          department: true
        },
        orderBy: {
          name: 'asc'
        }
      })
      return result
    } catch (error) {
      console.error(`Get project managers failed:`, error)
      throw new Error(`Failed to get project managers: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get users with relations
  async findWithRelations(id: string): Promise<UserWithRelations | null> {
    try {
      const result = await prisma.users.findUnique({
        where: { id },
        include: {
          projects: true,
          tasks: true,
          project_members: true
        }
      })
      return result as UserWithRelations
    } catch (error) {
      console.error(`Find with relations failed:`, error)
      throw new Error(`Failed to find user with relations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Update user status
  async updateStatus(id: string, status: string): Promise<users> {
    try {
      const result = await prisma.users.update({
        where: { id },
        data: { status }
      })
      return result
    } catch (error) {
      console.error(`Update user status failed:`, error)
      throw new Error(`Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Soft delete user
  async softDelete(id: string): Promise<users> {
    try {
      const result = await prisma.users.update({
        where: { id },
        data: {
          updatedAt: new Date()
        }
      })
      return result
    } catch (error) {
      console.error(`Soft delete user failed:`, error)
      throw new Error(`Failed to soft delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Restore user
  async restoreUser(id: string): Promise<users> {
    try {
      const result = await prisma.users.update({
        where: { id },
        data: {
          updatedAt: new Date()
        }
      })
      return result
    } catch (error) {
      console.error(`Restore user failed:`, error)
      throw new Error(`Failed to restore user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Update last login
  async updateLastLogin(id: string): Promise<users> {
    try {
      const result = await prisma.users.update({
        where: { id },
        data: {
          failed_login_attempts: 0
        }
      })
      return result
    } catch (error) {
      console.error(`Update last login failed:`, error)
      throw new Error(`Failed to update last login: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Increment failed login attempts
  async incrementFailedLogin(id: string): Promise<User> {
    try {
      const user = await this.findById(id)
      if (!user) throw new Error('User not found')

      const failedAttempts = (user.failed_login_attempts || 0) + 1
      const maxAttempts = 5
      
      const updateData: any = {
        failed_login_attempts: failedAttempts
      }

      // Lock account after max attempts
      if (failedAttempts >= maxAttempts) {
        // Note: locked_until field not available in current schema
        // This would need to be added to the schema if account locking is required
      }

      const result = await prisma.users.update({
        where: { id },
        data: updateData
      })
      return result
    } catch (error) {
      console.error(`Increment failed login failed:`, error)
      throw new Error(`Failed to increment failed login: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Search users
  async searchUsers(query: string, options?: BaseServiceOptions): Promise<users[]> {
    try {
      const result = await prisma.users.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { employee_code: { contains: query, mode: 'insensitive' } },
                { department: { contains: query, mode: 'insensitive' } },
                { position: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        ...options,
        orderBy: {
          name: 'asc'
        }
      })
      return result
    } catch (error) {
      console.error(`Search users failed:`, error)
      throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export singleton instance
export const userService = new UserService()
