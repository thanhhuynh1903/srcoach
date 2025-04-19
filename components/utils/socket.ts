import { io, Socket } from 'socket.io-client';
import Config from 'react-native-config';

let socketInstance: Socket | null = null;
const MASTER_URL = Config.ENV_MASTER_URL_SOCKET || Config.ENV_MASTER_URL_SOCKET_2;

export const initializeSocket = (): Socket => {
  console.log('Connecting to socket at:', MASTER_URL);
  if (socketInstance && socketInstance.connected) return socketInstance;

  socketInstance = io(MASTER_URL, {
    transports: ['websocket'], // Match with server
    forceNew: true, // Create new connection each time
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true, // Ensure it connects immediately
    query: {}, // Add any auth parameters if needed
    withCredentials: false // Set to false unless you need cookies
  });

  // Add connection event listeners for debugging
  socketInstance.on('connect', () => {
    console.log('Socket connected:', socketInstance?.id);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socketInstance.on('connect_error', (err) => {
    console.log('Socket connection error:', err.message);
  });

  return socketInstance;
};

export const getSocket = (): Socket => {
  if (!socketInstance || !socketInstance.connected) {
    return initializeSocket();
  }
  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.off(); // Remove all listeners
    socketInstance.disconnect();
    socketInstance = null;
  }
};