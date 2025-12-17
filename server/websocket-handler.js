/**
 * WebSocket Handler
 * Real-time collaboration and notifications
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class WebSocketHandler {
  constructor() {
    this.connections = new Map(); // userId -> Set of WebSocket connections
    this.subscriptions = new Map(); // eventType -> Set of userIds
    this.messageQueue = new Map(); // userId -> Array of messages
    this.maxQueueSize = 100;
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    try {
      // Extract token from query parameters
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Missing authentication token');
        return;
      }

      // Verify token
      let user;
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        ws.close(1008, 'Invalid token');
        return;
      }

      // Store connection
      if (!this.connections.has(user.id)) {
        this.connections.set(user.id, new Set());
      }
      this.connections.get(user.id).add(ws);

      // Attach user info to socket
      ws.user = user;

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection:established',
        data: {
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString()
        }
      }));

      // Handle incoming messages
      ws.on('message', (data) => this.handleMessage(ws, data));

      // Handle disconnection
      ws.on('close', () => this.handleDisconnection(ws, user.id));

      // Handle errors
      ws.on('error', (error) => this.handleError(ws, error));

      console.log(`✅ WebSocket connected: ${user.name} (${user.id})`);
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);
      const { type, payload } = message;

      switch (type) {
        case 'subscribe':
          this.handleSubscribe(ws.user.id, payload.eventType);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(ws.user.id, payload.eventType);
          break;

        case 'publish':
          this.broadcastEvent(payload.eventType, payload.data, ws.user);
          break;

        case 'presence:update':
          this.broadcastPresence(ws.user, payload.status);
          break;

        case 'task:update':
          this.broadcastTaskUpdate(payload, ws.user);
          break;

        case 'chat:message':
          this.broadcastChatMessage(payload, ws.user);
          break;

        case 'notification':
          this.sendNotification(payload.userId, payload);
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        default:
          console.warn('Unknown message type:', type);
      }
    } catch (error) {
      console.error('❌ Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message',
        error: error.message
      }));
    }
  }

  /**
   * Handle user subscription to event type
   */
  handleSubscribe(userId, eventType) {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType).add(userId);
    console.log(`📡 User ${userId} subscribed to ${eventType}`);
  }

  /**
   * Handle user unsubscription from event type
   */
  handleUnsubscribe(userId, eventType) {
    if (this.subscriptions.has(eventType)) {
      this.subscriptions.get(eventType).delete(userId);
    }
    console.log(`📡 User ${userId} unsubscribed from ${eventType}`);
  }

  /**
   * Broadcast event to subscribed users
   */
  broadcastEvent(eventType, data, sender) {
    const subscribers = this.subscriptions.get(eventType) || new Set();

    subscribers.forEach(userId => {
      const userConnections = this.connections.get(userId);
      if (userConnections) {
        const message = JSON.stringify({
          type: eventType,
          data,
          sender: {
            id: sender.id,
            name: sender.name
          },
          timestamp: new Date().toISOString()
        });

        userConnections.forEach(ws => {
          if (ws.readyState === 1) { // WebSocket.OPEN
            ws.send(message);
          }
        });
      }
    });
  }

  /**
   * Broadcast user presence update
   */
  broadcastPresence(user, status) {
    const presenceMessage = {
      type: 'presence:update',
      data: {
        userId: user.id,
        userName: user.name,
        status,
        timestamp: new Date().toISOString()
      }
    };

    this.connections.forEach((userConnections, userId) => {
      userConnections.forEach(ws => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify(presenceMessage));
        }
      });
    });
  }

  /**
   * Broadcast task update
   */
  broadcastTaskUpdate(payload, sender) {
    const updateMessage = {
      type: 'task:update',
      data: {
        taskId: payload.taskId,
        projectId: payload.projectId,
        updates: payload.updates,
        updatedBy: sender.name,
        timestamp: new Date().toISOString()
      }
    };

    this.connections.forEach((userConnections, userId) => {
      userConnections.forEach(ws => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify(updateMessage));
        }
      });
    });
  }

  /**
   * Broadcast chat message
   */
  broadcastChatMessage(payload, sender) {
    const chatMessage = {
      type: 'chat:message',
      data: {
        projectId: payload.projectId,
        senderId: sender.id,
        senderName: sender.name,
        content: payload.content,
        timestamp: new Date().toISOString()
      }
    };

    this.connections.forEach((userConnections, userId) => {
      userConnections.forEach(ws => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify(chatMessage));
        }
      });
    });
  }

  /**
   * Send notification to specific user
   */
  sendNotification(userId, notification) {
    const userConnections = this.connections.get(userId);

    if (userConnections) {
      const message = JSON.stringify({
        type: 'notification',
        data: {
          ...notification,
          timestamp: new Date().toISOString()
        }
      });

      userConnections.forEach(ws => {
        if (ws.readyState === 1) {
          ws.send(message);
        } else {
          // Queue message for offline user
          this.queueMessage(userId, message);
        }
      });
    } else {
      // Queue message for offline user
      this.queueMessage(userId, JSON.stringify({
        type: 'notification',
        data: {
          ...notification,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }

  /**
   * Queue message for offline user
   */
  queueMessage(userId, message) {
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }

    const queue = this.messageQueue.get(userId);
    if (queue.length >= this.maxQueueSize) {
      queue.shift(); // Remove oldest message
    }
    queue.push(message);
  }

  /**
   * Get queued messages for user
   */
  getQueuedMessages(userId) {
    const messages = this.messageQueue.get(userId) || [];
    this.messageQueue.delete(userId);
    return messages;
  }

  /**
   * Handle user disconnection
   */
  handleDisconnection(ws, userId) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }

    console.log(`❌ WebSocket disconnected: ${userId}`);

    // Broadcast user offline status
    this.broadcastPresence({ id: userId }, 'offline');
  }

  /**
   * Handle WebSocket error
   */
  handleError(ws, error) {
    console.error('❌ WebSocket error:', error);
    ws.close(1011, 'Internal server error');
  }

  /**
   * Get active users count
   */
  getActiveUsersCount() {
    return this.connections.size;
  }

  /**
   * Get active users list
   */
  getActiveUsers() {
    return Array.from(this.connections.keys());
  }
}

module.exports = WebSocketHandler;
