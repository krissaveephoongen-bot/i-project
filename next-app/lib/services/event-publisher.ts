// Event Publisher Service
// Helper service to trigger real-time events from other services

import { realTimeService, RealTimeEventType } from './realtime-service'

export class EventPublisher {
  // User events
  static async publishUserCreated(userData: any): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.USER_CREATED,
      data: {
        user: userData
      }
    })
  }

  static async publishUserUpdated(userId: string, updatedData: any): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.USER_UPDATED,
      data: {
        userId,
        updatedData
      }
    })
  }

  static async publishUserDeleted(userId: string): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.USER_DELETED,
      data: {
        userId
      }
    })
  }

  // Project events
  static async publishProjectCreated(projectData: any): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.PROJECT_CREATED,
      data: {
        project: projectData
      }
    })
  }

  static async publishProjectUpdated(projectId: string, updatedData: any): Promise<void> {
    await realTimeService.sendEventToProject(projectId, {
      type: RealTimeEventType.PROJECT_UPDATED,
      data: {
        projectId,
        updatedData
      }
    })
  }

  static async publishProjectDeleted(projectId: string): Promise<void> {
    await realTimeService.sendEventToProject(projectId, {
      type: RealTimeEventType.PROJECT_DELETED,
      data: {
        projectId
      }
    })
  }

  // Approval events
  static async publishApprovalCreated(approvalData: any, userId?: string): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.APPROVAL_CREATED,
      data: {
        approval: approvalData
      },
      userId
    })
  }

  static async publishApprovalUpdated(approvalId: string, approvalData: any, userId?: string): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.APPROVAL_UPDATED,
      data: {
        approvalId,
        approval: approvalData
      },
      userId
    })
  }

  // Task events
  static async publishTaskCreated(taskData: any, projectId?: string): Promise<void> {
    const event = {
      type: RealTimeEventType.TASK_CREATED,
      data: {
        task: taskData
      }
    }

    if (projectId) {
      await realTimeService.sendEventToProject(projectId, event)
    } else {
      await realTimeService.broadcastEvent(event)
    }
  }

  static async publishTaskUpdated(taskId: string, updatedData: any, projectId?: string): Promise<void> {
    const event = {
      type: RealTimeEventType.TASK_UPDATED,
      data: {
        taskId,
        updatedData
      }
    }

    if (projectId) {
      await realTimeService.sendEventToProject(projectId, event)
    } else {
      await realTimeService.broadcastEvent(event)
    }
  }

  static async publishTaskCompleted(taskId: string, projectId?: string): Promise<void> {
    const event = {
      type: RealTimeEventType.TASK_COMPLETED,
      data: {
        taskId,
        completedAt: new Date()
      }
    }

    if (projectId) {
      await realTimeService.sendEventToProject(projectId, event)
    } else {
      await realTimeService.broadcastEvent(event)
    }
  }

  // Expense events
  static async publishExpenseCreated(expenseData: any, userId?: string): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.EXPENSE_CREATED,
      data: {
        expense: expenseData
      },
      userId
    })
  }

  static async publishExpenseUpdated(expenseId: string, updatedData: any, userId?: string): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.EXPENSE_UPDATED,
      data: {
        expenseId,
        updatedData
      },
      userId
    })
  }

  // Timesheet events
  static async publishTimesheetSubmitted(timesheetData: any, userId?: string): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.TIMESHEET_SUBMITTED,
      data: {
        timesheet: timesheetData
      },
      userId
    })
  }

  static async publishTimesheetApproved(timesheetId: string, approvedData: any, userId?: string): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.TIMESHEET_APPROVED,
      data: {
        timesheetId,
        approvedData
      },
      userId
    })
  }

  // System notifications
  static async publishSystemNotification(message: string, data?: any, userId?: string): Promise<void> {
    await realTimeService.broadcastEvent({
      type: RealTimeEventType.SYSTEM_NOTIFICATION,
      data: {
        message,
        ...data
      },
      userId
    })
  }
}

export { EventPublisher as eventPublisher }
