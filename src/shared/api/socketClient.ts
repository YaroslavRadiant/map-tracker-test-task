type Handlers<T> = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: unknown) => void;
  onMessage?: (data: T) => void;
};

export class SocketClient<T = unknown> {
  private socket: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private manuallyClosed = false;

  constructor(
    private getUrl: () => string,
    private handlers: Handlers<T>,
  ) {}

  connect() {
    if (this.socket) {
      return;
    }

    this.manuallyClosed = false;

    const url = this.getUrl();
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.handlers.onOpen?.();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T;
        this.handlers.onMessage?.(data);
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    this.socket.onerror = (err) => {
      this.handlers.onError?.(err);
    };

    this.socket.onclose = () => {
      this.socket = null;
      this.handlers.onClose?.();

      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  disconnect() {
    this.manuallyClosed = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      return;
    }

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 2000);
  }
}
