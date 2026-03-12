// Project Service
// Handles all project-related database operations

import { prisma } from '../database'
import { BaseService, type BaseServiceOptions, type PaginationOptions, type PaginatedResult } from '../base-service'
import type { projects, Status, Prisma } from '@prisma/client'

export type ProjectCreateInput = Prisma.projectsUncheckedCreateInput
export type ProjectUpdateInput = Prisma.projectsUncheckedUpdateInput
export type ProjectWhereInput = Prisma.projectsWhereInput

export interface ProjectWithRelations extends projects {
  manager?: any
  client?: any
  tasks?: any[]
  milestones?: any[]
  timeEntries?: any[]
  expenses?: any[]
  members?: any[]
  risks?: any[]
  progressHistory?: any[]
}

export class ProjectService extends BaseService<projects, ProjectCreateInput, ProjectUpdateInput> {
  constructor() {
    super(prisma.projects)
  }

  // Find project by code
  async findByCode(code: string): Promise<projects | null> {
    try {
      const result = await prisma.projects.findUnique({
        where: { code }
      })
      return result
    } catch (error) {
      console.error(`Find by code failed:`, error)
      throw new Error(`Failed to find project by code: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get projects with basic info (for dropdown lists)
  async getBasicProjects(where?: ProjectWhereInput): Promise<Pick<projects, 'id' | 'name' | 'code' | 'status' | 'progress'>[]> {
    try {
      const result = await prisma.projects.findMany({
        where: {
          ...where,
          isArchived: false
        },
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          progress: true
        },
        orderBy: {
          name: 'asc'
        }
      })
      return result
    } catch (error) {
      console.error(`Get basic projects failed:`, error)
      throw new Error(`Failed to get basic projects: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get active projects
  async getActiveProjects(options?: BaseServiceOptions): Promise<projects[]> {
    try {
      const result = await prisma.projects.findMany({
        where: {
          isArchived: false
        },
        ...options
      })
      return result
    } catch (error) {
      console.error(`Get active projects failed:`, error)
      throw new Error(`Failed to get active projects: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get projects by status
  async getProjectsByStatus(status: Status, options?: BaseServiceOptions): Promise<projects[]> {
    try {
      const result = await prisma.projects.findMany({
        where: {
          status,
          isArchived: false
        },
        ...options
      })
      return result
    } catch (error) {
      console.error(`Get projects by status failed:`, error)
      throw new Error(`Failed to get projects by status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get projects with full relations
  async findWithRelations(id: string): Promise<ProjectWithRelations | null> {
    try {
      const result = await prisma.projects.findUnique({
        where: { id },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true,
              assignedTo: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          milestones: {
            select: {
              id: true,
              title: true,
              status: true,
              progress: true,
              dueDate: true
            },
            orderBy: {
              dueDate: 'asc'
            }
          },
          members: {
            select: {
              id: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          risks: {
            select: {
              id: true,
              title: true,
              status: true,
              probability: true,
              riskScore: true
            }
          },
          progressHistory: {
            select: {
              id: true,
              progress: true,
              weekDate: true
            },
            orderBy: {
              weekDate: 'desc'
            }
          }
        }
      })
      return result
    } catch (error) {
      console.error(`Find with relations failed:`, error)
      throw new Error(`Failed to find project with relations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Update project progress
  async updateProgress(id: string, progress: number): Promise<projects> {
    try {
      const result = await prisma.projects.update({
        where: { id },
        data: { 
          progress,
          updatedAt: new Date()
        }
      })
      return result
    } catch (error) {
      console.error(`Update project progress failed:`, error)
      throw new Error(`Failed to update project progress: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Archive project
  async archiveProject(id: string): Promise<projects> {
    try {
      const result = await prisma.projects.update({
        where: { id },
        data: {
          isArchived: true,
          updatedAt: new Date()
        }
      })
      return result
    } catch (error) {
      console.error(`Archive project failed:`, error)
      throw new Error(`Failed to archive project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Restore project
  async restoreProject(id: string): Promise<projects> {
    try {
      const result = await prisma.projects.update({
        where: { id },
        data: {
          isArchived: false,
          updatedAt: new Date()
        }
      })
      return result
    } catch (error) {
      console.error(`Restore project failed:`, error)
      throw new Error(`Failed to restore project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Update budget
  async updateBudget(id: string, budget: number, spent?: number): Promise<projects> {
    try {
      const updateData: any = {
        budget,
        updatedAt: new Date()
      }
      
      if (spent !== undefined) {
        updateData.spent = spent
        updateData.remaining = budget - spent
      } else {
        const currentProject = await this.findById(id)
        if (currentProject) {
          updateData.remaining = budget - currentProject.spent
        }
      }

      const result = await prisma.projects.update({
        where: { id },
        data: updateData
      })
      return result
    } catch (error) {
      console.error(`Update budget failed:`, error)
      throw new Error(`Failed to update budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get project statistics
  async getProjectStats(id: string): Promise<{
    totalTasks: number
    completedTasks: number
    totalExpenses: number
    totalHours: number
    budgetUsed: number
    budgetRemaining: number
  }> {
    try {
      const project = await this.findById(id)
      if (!project) {
        throw new Error('Project not found')
      }

      const [tasksResult, expensesResult, timeEntriesResult] = await Promise.all([
        prisma.tasks.count({
          where: { projectId: id }
        }),
        prisma.tasks.count({
          where: { 
          projectId: id,
          status: 'done'
        }
        }),
        prisma.expenses.aggregate({
          where: { projectId: id },
          _sum: { amount: true }
        }),
        prisma.time_entries.aggregate({
          where: { projectId: id },
          _sum: { hours: true }
        })
      ])

      return {
        totalTasks: tasksResult,
        completedTasks: tasksResult,
        totalExpenses: expensesResult._sum.amount || 0,
        totalHours: timeEntriesResult._sum.hours || 0,
        budgetUsed: project.spent,
        budgetRemaining: project.remaining
      }
    } catch (error) {
      console.error(`Get project stats failed:`, error)
      throw new Error(`Failed to get project statistics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Search projects
  async searchProjects(query: string, options?: BaseServiceOptions): Promise<projects[]> {
    try {
      const result = await prisma.projects.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } }
              ]
            },
            {
              isArchived: false
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
      console.error(`Search projects failed:`, error)
      throw new Error(`Failed to search projects: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get projects by manager
  async getProjectsByManager(managerId: string, options?: BaseServiceOptions): Promise<projects[]> {
    try {
      const result = await prisma.projects.findMany({
        where: {
          managerId,
          isArchived: false
        },
        ...options
      })
      return result
    } catch (error) {
      console.error(`Get projects by manager failed:`, error)
      throw new Error(`Failed to get projects by manager: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get projects by client
  async getProjectsByClient(clientId: string, options?: BaseServiceOptions): Promise<projects[]> {
    try {
      const result = await prisma.projects.findMany({
        where: {
          clientId,
          isArchived: false
        },
        ...options
      })
      return result
    } catch (error) {
      console.error(`Get projects by client failed:`, error)
      throw new Error(`Failed to get projects by client: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService()
