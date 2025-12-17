import { toast } from 'react-hot-toast';
import { Task, Project, Activity } from './dataService';
import { APP_CONFIG } from '../config/constants';

// Real-time Collaboration Service
class CollaborationService {
    private subscribers: Map<string, Function[]> = new Map();
    private connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' = 'disconnected';
    private userPresence: Map<string, { userId: string; lastActive: string; status: string }> = new Map();
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number;
    private reconnectDelay: number;
    private messageHistory: any[] = [];
    private maxMessageHistory: number;

    // Real WebSocket connection
    private webSocket: WebSocket | null = null;

    constructor() {
        // Initialize from configuration
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = APP_CONFIG.COLLABORATION.RECONNECT_DELAY;
        this.maxMessageHistory = APP_CONFIG.COLLABORATION.MESSAGE_HISTORY_LIMIT;

        // Initialize real WebSocket connection
        this.connect();
    }

    // Connect to collaboration service with real WebSocket
    connect(): void {
        if (this.connectionStatus === 'connected' || this.connectionStatus === 'connecting') {
            console.log('Connection attempt already in progress');
            return;
        }

        this.connectionStatus = 'connecting';
        this.reconnectAttempts = 0;

        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/api/ws`;
            const token = localStorage.getItem('accessToken');

            if (!token) {
                throw new Error('No access token available');
            }

            this.webSocket = new WebSocket(`${wsUrl}?token=${token}`);

            this.webSocket.onopen = () => {
                this.connectionStatus = 'connected';
                this.reconnectAttempts = 0;
                console.log('Connected to collaboration service');

                // Restore any pending messages
                if (this.messageHistory.length > 0) {
                    console.log(`Restoring ${this.messageHistory.length} pending messages`);
                    this.messageHistory.forEach(message => {
                        this.webSocket?.send(JSON.stringify(message));
                    });
                    this.messageHistory = [];
                }

                toast.success('Connected to real-time collaboration service');
            };

            this.webSocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    const { type, data } = message;

                    // Notify local subscribers
                    if (this.subscribers.has(type)) {
                        this.subscribers.get(type)?.forEach(callback => {
                            try {
                                callback(data);
                            } catch (error) {
                                console.error('Error in collaboration callback:', error);
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error processing collaboration message:', error);
                }
            };

            this.webSocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.handleConnectionFailure();
            };

            this.webSocket.onclose = () => {
                this.connectionStatus = 'disconnected';
                console.log('Disconnected from collaboration service');
                this.handleConnectionFailure();
            };
        } catch (error) {
            console.error('Connection error:', error);
            this.handleConnectionFailure();
        }
    }

    // Handle connection failures with retry logic
    private handleConnectionFailure(): void {
        this.reconnectAttempts++;

        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
            this.connectionStatus = 'reconnecting';
            console.warn(`Connection attempt ${this.reconnectAttempts} failed, retrying in ${this.reconnectDelay}ms...`);

            // Exponential backoff
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            setTimeout(() => this.connect(), delay);
        } else {
            this.connectionStatus = 'disconnected';
            console.error('Max reconnection attempts reached');
            toast.error('Failed to connect to collaboration service. Check your connection.');
        }
    }

    // Disconnect from collaboration service
    disconnect(): void {
        this.connectionStatus = 'disconnected';
        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = null;
        }
    }

    // Get current connection status
    getConnectionStatus(): string {
        return this.connectionStatus;
    }

    // Subscribe to real-time updates
    subscribe(eventType: string, callback: Function): () => void {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType)?.push(callback);

        return () => this.unsubscribe(eventType, callback);
    }

    // Unsubscribe from real-time updates
    unsubscribe(eventType: string, callback: Function): void {
        const callbacks = this.subscribers.get(eventType);
        if (callbacks) {
            this.subscribers.set(
                eventType,
                callbacks.filter(cb => cb !== callback)
            );
        }
    }

    // Publish real-time event with message queuing and error handling
    publish(eventType: string, data: any): void {
        const message = {
            type: eventType,
            data,
            timestamp: new Date().toISOString()
        };

        try {
            // Validate message
            if (!eventType || typeof eventType !== 'string') {
                throw new Error('Invalid event type');
            }

            // Notify local subscribers
            if (this.subscribers.has(eventType)) {
                this.subscribers.get(eventType)?.forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error('Error in collaboration callback:', error);
                    }
                });
            }

            // Queue message if not connected
            if (this.connectionStatus !== 'connected') {
                if (this.messageHistory.length >= this.maxMessageHistory) {
                    this.messageHistory.shift(); // Remove oldest message
                }
                this.messageHistory.push(message);
                console.log(`Queued message (${this.messageHistory.length}/${this.maxMessageHistory}):`, eventType);
            }

            // Send via WebSocket if connected
            if (this.connectionStatus === 'connected' && this.webSocket) {
                this.webSocket.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error('Error publishing collaboration event:', error);
            // Queue the message for retry
            if (this.messageHistory.length >= this.maxMessageHistory) {
                this.messageHistory.shift();
            }
            this.messageHistory.push(message);
        }
    }

    // Update user presence
    updateUserPresence(userId: string, status: string): void {
        const presenceData = {
            userId,
            lastActive: new Date().toISOString(),
            status
        };

        this.userPresence.set(userId, presenceData);
        this.publish('presence:update', presenceData);
    }

    // Get active users
    getActiveUsers(): Array<{ userId: string; lastActive: string; status: string }> {
        return Array.from(this.userPresence.values());
    }

    // Real-time task updates
    updateTaskInRealTime(taskId: string, updates: Partial<Task>): void {
        this.publish('task:update', {
            taskId,
            updates,
            timestamp: new Date().toISOString()
        });
    }

    // Real-time project updates
    updateProjectInRealTime(projectId: string, updates: Partial<Project>): void {
        this.publish('project:update', {
            projectId,
            updates,
            timestamp: new Date().toISOString()
        });
    }

    // Real-time comment/activity
    addRealTimeActivity(activity: Activity): void {
        this.publish('activity:new', {
            activity,
            timestamp: new Date().toISOString()
        });
    }

    // Real-time chat messaging
    sendChatMessage(projectId: string, message: {
        senderId: string;
        content: string;
        timestamp?: string;
    }): void {
        const chatMessage = {
            ...message,
            timestamp: message.timestamp || new Date().toISOString(),
            projectId
        };

        this.publish('chat:message', chatMessage);
    }

    // Start live document collaboration
    startDocumentCollaboration(documentId: string, initialContent: string): void {
        this.publish('document:start', {
            documentId,
            initialContent,
            timestamp: new Date().toISOString()
        });
    }

    // Update document content in real-time
    updateDocumentContent(documentId: string, delta: any, source: string): void {
        this.publish('document:update', {
            documentId,
            delta,
            source,
            timestamp: new Date().toISOString()
        });
    }
}


export const collaborationService = new CollaborationService();