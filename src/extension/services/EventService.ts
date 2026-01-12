import { EventSource } from 'eventsource';
import { AuthService } from './AuthService';

/**
 * Event types from SSE
 */
export interface TaskStartedEvent {
  type: 'task-started';
  specId: string;
  taskId: string;
  taskTitle: string;
}

export interface TaskProgressEvent {
  type: 'task-progress';
  specId: string;
  taskId: string;
  message: string;
  percent?: number;
}

export interface TaskCompletedEvent {
  type: 'task-completed';
  specId: string;
  taskId: string;
  summary: string;
}

export interface ApprovalCreatedEvent {
  type: 'approval-created';
  approvalId: string;
  specId: string;
  title: string;
}

export interface ApprovalRespondedEvent {
  type: 'approval-responded';
  approvalId: string;
  status: string;
}

export type SSEEvent =
  | TaskStartedEvent
  | TaskProgressEvent
  | TaskCompletedEvent
  | ApprovalCreatedEvent
  | ApprovalRespondedEvent;

/**
 * Event Service for SSE (Server-Sent Events) real-time updates
 */
export class EventService {
  private eventSource: InstanceType<typeof EventSource> | null = null;
  private listeners: Map<string, Set<(data: SSEEvent) => void>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentProjectId: string | null = null;
  private apiUrl: string;

  constructor(
    private readonly authService: AuthService,
    apiUrl: string
  ) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
  }

  /**
   * Update API URL
   */
  setApiUrl(apiUrl: string): void {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    // Reconnect if currently connected
    if (this.currentProjectId) {
      this.disconnect();
      this.connect(this.currentProjectId);
    }
  }

  /**
   * Connect to SSE for a project
   */
  async connect(projectId: string): Promise<void> {
    // Disconnect existing connection
    this.disconnect();

    const accessToken = await this.authService.getAccessToken();
    if (!accessToken) {
      console.error('[EventService] Cannot connect: not authenticated');
      return;
    }

    this.currentProjectId = projectId;
    // SSE uses token in query param since EventSource doesn't support custom headers
    const url = `${this.apiUrl}/api/v1/projects/${projectId}/events?token=${encodeURIComponent(accessToken)}`;

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[EventService] SSE connection opened');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSEEvent;
          this.notifyListeners(data.type, data);
        } catch (error) {
          console.error('[EventService] Failed to parse SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('[EventService] SSE error:', error);
        this.handleError();
      };

      // Listen for specific event types
      const eventTypes = [
        'task-started',
        'task-progress',
        'task-completed',
        'approval-created',
        'approval-responded',
      ];

      eventTypes.forEach((eventType) => {
        this.eventSource!.addEventListener(eventType, (event: Event) => {
          const messageEvent = event as MessageEvent;
          try {
            const data = JSON.parse(messageEvent.data) as SSEEvent;
            this.notifyListeners(eventType, data);
          } catch (error) {
            console.error(`[EventService] Failed to parse ${eventType} event:`, error);
          }
        });
      });
    } catch (error) {
      console.error('[EventService] Failed to create EventSource:', error);
      this.handleError();
    }
  }

  /**
   * Disconnect from SSE
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('[EventService] SSE connection closed');
    }

    this.currentProjectId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to event types
   */
  on(eventType: string, callback: (data: SSEEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  /**
   * Subscribe to all events
   */
  onAny(callback: (data: SSEEvent) => void): () => void {
    return this.on('*', callback);
  }

  /**
   * Handle SSE errors and reconnection
   */
  private handleError(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentProjectId) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`[EventService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      this.reconnectTimeout = setTimeout(() => {
        if (this.currentProjectId) {
          this.connect(this.currentProjectId);
        }
      }, delay);
    } else {
      console.error('[EventService] Max reconnect attempts reached');
    }
  }

  /**
   * Notify listeners of an event
   */
  private notifyListeners(eventType: string, data: SSEEvent): void {
    // Notify type-specific listeners
    const typeListeners = this.listeners.get(eventType);
    if (typeListeners) {
      typeListeners.forEach((callback) => callback(data));
    }

    // Notify wildcard listeners
    const anyListeners = this.listeners.get('*');
    if (anyListeners) {
      anyListeners.forEach((callback) => callback(data));
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === 1; // 1 = OPEN
  }

  /**
   * Get current project ID
   */
  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }
}
