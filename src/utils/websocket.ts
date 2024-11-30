// websocketManager.ts
type MessageHandler = (data: any) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number = 1000;

  constructor(private url: string) {}

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("Connected to WebSocket");
      this.reconnectAttempts = 0;
      this.emit("connection", { status: "connected" });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const action = data.action;

        if (this.messageHandlers.has(action)) {
          this.messageHandlers.get(action)?.forEach((handler) => handler(data));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      this.emit("connection", { status: "disconnected" });
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.emit("error", { error });
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );
      setTimeout(() => this.connect(), this.reconnectTimeout * this.reconnectAttempts);
    }
  }

  on(action: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(action)) {
      this.messageHandlers.set(action, []);
    }
    this.messageHandlers.get(action)?.push(handler);
  }

  off(action: string, handler: MessageHandler) {
    if (this.messageHandlers.has(action)) {
      const handlers = this.messageHandlers.get(action) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(action: string, data: any = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action,
          ...data,
        }),
      );
    } else {
      console.warn("WebSocket is not connected. Message not sent:", { action, data });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance for the game
export const gameSocket = new WebSocketManager("ws://localhost:8080/ws/1/interlinked");
