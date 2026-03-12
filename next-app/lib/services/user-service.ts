// User Service
// Handles all user-related database operations

import { prisma } from '../database'
import { BaseService, type BaseServiceOptions, type PaginationOptions, type PaginatedResult } from '../base-service'
import type { users, Prisma } from '@prisma/client'

type User = Prisma.usersGetPayload<{}>

export type UserCreateInput = Prisma.usersUncheckedCreateInput
export type UserUpdateInput = Prisma.usersUncheckedUpdateInput
export type UserWhereInput = Prisma.usersWhereInput
export type UserIncludeOptions = Prisma.usersInclude

export interface UserWithRelations extends User {
  projects?: any[]
  tasks?: any[]
  project_members?: any[]
}

export class UserService extends BaseService<User, UserCreateInput, UserUpdateInput> {
  constructor() {
    super(prisma.users)
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
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

  // Find user by username
  async findByUsername(username: string): Promise<User | null> {
    try {
      const result = await prisma.users.findFirst({
        where: { username }
      })
      return result
    } catch (error) {
      console.error(`Find by username failed:`, error)
      throw new Error(`Failed to find user by username: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get users with basic info only (for dropdown lists)
  async getBasicUsers(where?: UserWhereInput): Promise<Pick<User, 'id' | 'name' | 'email' | 'role' | 'department' | 'position'>[]> {
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
  async getUsersByRole(role: string, options?: BaseServiceOptions): Promise<User[]> {
    try {
      const result = await prisma.user.findMany({
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
  async getProjectManagers(): Promise<Pick<User, 'id' | 'name' | 'email' | 'department'>[]> {
    try {
      const result = await prisma.user.findMany({
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
      const result = await prisma.user.findUnique({
        where: { id },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
              progress: true
            }
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              dueDate: true
            }
          },
          project_members: {
            select: {
              id: true,
              role: true,
              projects: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })
      return result
    } catch (error) {
      console.error(`Find with relations failed:`, error)
      throw new Error(`Failed to find user with relations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Update user status
  async updateStatus(id: string, status: string): Promise<User> {
    try {
      const result = await prisma.user.update({
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
          lastLogin: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null
        }
      })
      return result
    } catch (error) {
      console.error(`Update last login failed:`, error)
      throw new Error(`Failed to update last login: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Increment failed login attempts
  async incrementFailedLogin(id: string): Promise<users> {
    try {
      const user = await this.findById(id)
      if (!user) throw new Error('User not found')

      const failedAttempts = (user.failedLoginAttempts || 0) + 1
      const maxAttempts = 5
      
      const updateData: any = {
        failedLoginAttempts: failedAttempts
      }

      // Lock account after max attempts
      if (failedAttempts >= maxAttempts) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
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
                { username: { contains: query, mode: 'insensitive' } },
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
