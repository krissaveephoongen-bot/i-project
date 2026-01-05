/**
 * Real-time Notifications Service
 * Handles WebSocket connections and notification management
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  actionUrl?: string;
}

export interface NotificationPreference {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
  categories: {
    projects: boolean;
    tasks: boolean;
    comments: boolean;
    team: boolean;
    system: boolean;
  };
}

type NotificationCallback = (notification: Notification) => void;
type ConnectionCallback = (connected: boolean) => void;

class NotificationService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private callbacks: Map<string, Set<NotificationCallback>> = new Map();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private isManuallyDisconnected = false;
  private userId: string | null = null;
  private token: string | null = null;

  constructor(baseUrl: string = '') {
    this.url = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    if (!this.url.includes('localhost')) {
      this.url = this.url + '/ws';
    }
  }

  /**
   * Connect to WebSocket server
   */
  public connect(userId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        this.token = token;
        this.isManuallyDisconnected = false;

        const wsUrl = `${this.url}/notifications?userId=${userId}&token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.notifyConnectionChange(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const notification: Notification = JSON.parse(event.data);
            this.handleNotification(notification);
          } catch (error) {
            console.error('Failed to parse notification:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.notifyConnectionChange(false);
          if (!this.isManuallyDisconnected) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.isManuallyDisconnected = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyConnectionChange(false);
  }

  /**
   * Subscribe to notifications of a specific type
   */
  public subscribe(type: string, callback: NotificationCallback): () => void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set());
    }
    this.callbacks.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.get(type)?.delete(callback);
    };
  }

  /**
   * Subscribe to connection changes
   */
  public onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  /**
   * Send notification to server
   */
  public async sendNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'created_at'>
  ): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify({
      type: 'send_notification',
      payload: { ...notification, userId }
    }));
  }

  /**
   * Mark notification as read
   */
  public async markAsRead(notificationId: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected, falling back to HTTP');
      await this.markAsReadViaHttp(notificationId);
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'mark_as_read',
      payload: { notificationId }
    }));
  }

  /**
   * Mark all notifications as read
   */
  public async markAllAsRead(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected, falling back to HTTP');
      await this.markAllAsReadViaHttp();
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'mark_all_as_read',
      payload: {}
    }));
  }

  /**
   * Get notification preferences
   */
  public async getPreferences(): Promise<NotificationPreference | null> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/notifications/preferences`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return null;
    }
  }

  /**
   * Update notification preferences
   */
  public async updatePreferences(preferences: Partial<NotificationPreference>): Promise<void> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  public async getUnreadCount(): Promise<number> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Private methods
   */

  private handleNotification(notification: Notification): void {
    // Call all subscribers for this type
    const typeCallbacks = this.callbacks.get(notification.type);
    if (typeCallbacks) {
      typeCallbacks.forEach(callback => callback(notification));
    }

    // Call all subscribers for 'all'
    const allCallbacks = this.callbacks.get('all');
    if (allCallbacks) {
      allCallbacks.forEach(callback => callback(notification));
    }
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (this.userId && this.token && !this.isManuallyDisconnected) {
        this.connect(this.userId, this.token).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  private async markAsReadViaHttp(notificationId: string): Promise<void> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  private async markAllAsReadViaHttp(): Promise<void> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
let instance: NotificationService | null = null;

export function createNotificationService(baseUrl?: string): NotificationService {
  if (!instance) {
    instance = new NotificationService(baseUrl);
  }
  return instance;
}

export function getNotificationService(): NotificationService {
  if (!instance) {
    instance = new NotificationService();
  }
  return instance;
}
