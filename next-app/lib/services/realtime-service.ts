// Real-time Service
// Handles WebSocket/SSE connections for real-time updates

import { prisma } from '../database'

// Event types for real-time updates
export enum RealTimeEventType {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  APPROVAL_CREATED = 'approval_created',
  APPROVAL_UPDATED = 'approval_updated',
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  EXPENSE_CREATED = 'expense_created',
  EXPENSE_UPDATED = 'expense_updated',
  TIMESHEET_SUBMITTED = 'timesheet_submitted',
  TIMESHEET_APPROVED = 'timesheet_approved',
  SYSTEM_NOTIFICATION = 'system_notification'
}

// Base event interface
export interface RealTimeEvent {
  id: string
  type: RealTimeEventType
  timestamp: Date
  data: any
  userId?: string // Target user if event is user-specific
  projectId?: string // Target project if event is project-specific
}

// Client connection interface
export interface ClientConnection {
  id: string
  userId?: string
  lastPing: Date
  response: any // Response object for SSE
}

export class RealTimeService {
  private connections: Map<string, ClientConnection> = new Map()
  private eventQueue: RealTimeEvent[] = []
  private isProcessing = false

  // Register a new client connection
  registerConnection(connectionId: string, response: any, userId?: string): void {
    const connection: ClientConnection = {
      id: connectionId,
      userId,
      lastPing: new Date(),
      response
    }

    this.connections.set(connectionId, connection)
    console.log(`Client ${connectionId} connected${userId ? ` (user: ${userId})` : ''}`)
  }

  // Unregister a client connection
  unregisterConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (connection) {
      connection.response.end()
      this.connections.delete(connectionId)
      console.log(`Client ${connectionId} disconnected`)
    }
  }

  // Broadcast event to all connected clients
  async broadcastEvent(event: Omit<RealTimeEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: RealTimeEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    }

    this.eventQueue.push(fullEvent)
    
    if (!this.isProcessing) {
      await this.processEventQueue()
    }
  }

  // Send event to specific user
  async sendEventToUser(userId: string, event: Omit<RealTimeEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: RealTimeEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      userId
    }

    this.eventQueue.push(fullEvent)
    
    if (!this.isProcessing) {
      await this.processEventQueue()
    }
  }

  // Send event to project members
  async sendEventToProject(projectId: string, event: Omit<RealTimeEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: RealTimeEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      projectId
    }

    this.eventQueue.push(fullEvent)
    
    if (!this.isProcessing) {
      await this.processEventQueue()
    }
  }

  // Process event queue
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing) return
    
    this.isProcessing = true

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!
        await this.deliverEvent(event)
      }
    } catch (error) {
      console.error('Error processing event queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Deliver event to appropriate clients
  private async deliverEvent(event: RealTimeEvent): Promise<void> {
    const deadConnections: string[] = []

    for (const [connectionId, connection] of this.connections) {
      try {
        // Check if this client should receive the event
        if (this.shouldReceiveEvent(connection, event)) {
          const data = `data: ${JSON.stringify(event)}\n\n`
          connection.response.write(data)
        }
      } catch (error) {
        console.error(`Failed to send event to client ${connectionId}:`, error)
        deadConnections.push(connectionId)
      }
    }

    // Clean up dead connections
    for (const connectionId of deadConnections) {
      this.unregisterConnection(connectionId)
    }
  }

  // Check if client should receive event
  private shouldReceiveEvent(connection: ClientConnection, event: RealTimeEvent): boolean {
    // User-specific events
    if (event.userId && connection.userId !== event.userId) {
      return false
    }

    // Project-specific events (would need to check if user is project member)
    if (event.projectId && connection.userId) {
      // TODO: Check if user is member of project
      // For now, send to all users for project events
      return true
    }

    // System events and general events go to all connected clients
    return true
  }

  // Generate unique event ID
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Clean up inactive connections
  cleanupInactiveConnections(): void {
    const now = new Date()
    const deadConnections: string[] = []

    for (const [connectionId, connection] of this.connections) {
      // Remove connections inactive for more than 5 minutes
      if (now.getTime() - connection.lastPing.getTime() > 5 * 60 * 1000) {
        deadConnections.push(connectionId)
      }
    }

    for (const connectionId of deadConnections) {
      this.unregisterConnection(connectionId)
    }

    if (deadConnections.length > 0) {
      console.log(`Cleaned up ${deadConnections.length} inactive connections`)
    }
  }

  // Get connection statistics
  getConnectionStats(): {
    totalConnections: number
    authenticatedConnections: number
    connectionsByUser: Record<string, number>
  } {
    const stats = {
      totalConnections: this.connections.size,
      authenticatedConnections: 0,
      connectionsByUser: {} as Record<string, number>
    }

    for (const connection of this.connections.values()) {
      if (connection.userId) {
        stats.authenticatedConnections++
        stats.connectionsByUser[connection.userId] = (stats.connectionsByUser[connection.userId] || 0) + 1
      }
    }

    return stats
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService()

// Start cleanup interval
setInterval(() => {
  realTimeService.cleanupInactiveConnections()
}, 60000) // Every minute
