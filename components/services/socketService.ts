import io, { Socket, ManagerOptions, SocketOptions } from 'socket.io-client';
import { Platform } from 'react-native';

type EventHandler = (data: any) => void;

interface Listener {
  eventPrefix: string;
  handler: EventHandler;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Listener[] = [];
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(url: string, options: Partial<ManagerOptions & SocketOptions> = {}): void {
    if (this.socket?.connected) return;

    const defaultOptions: ManagerOptions & SocketOptions = {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      path: '/api/socket.io',
      ...options,
    };

    if (url.startsWith('http')) {
      defaultOptions.secure = true
      defaultOptions.rejectUnauthorized = true
    }

    this.socket = io(url, defaultOptions);

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  public emitEvent(prefix: string, eventType: string, data: any): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    const fullEventName = `${prefix}:${eventType}`;
    this.socket.emit(fullEventName, data);
  }

  public addListener(prefix: string, handler: EventHandler): void {
    if (!this.socket) return;

    const listener = (data: any) => {
      if (typeof data === 'object' && data.eventType) {
        handler(data.data);
      } else {
        handler(data);
      }
    };

    this.socket.on(prefix, listener);
    this.listeners.push({ eventPrefix: prefix, handler: listener });
  }

  public removeListener(prefix: string, handler?: EventHandler): void {
    if (!this.socket) return;

    if (handler) {
      this.socket.off(prefix, handler);
      this.listeners = this.listeners.filter(
        l => !(l.eventPrefix === prefix && l.handler === handler)
      );
    } else {
      this.socket.off(prefix);
      this.listeners = this.listeners.filter(l => l.eventPrefix !== prefix);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners = [];
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default SocketService.getInstance();