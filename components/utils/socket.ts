import { io, Socket } from 'socket.io-client';
import Config from 'react-native-config';

let socketInstance: Socket | null = null;
const MASTER_URL = Config.ENV_MASTER_URL_SOCKET || Config.ENV_MASTER_URL_SOCKET_2;

export const initializeSocket = (): Socket => {
  if (socketInstance) return socketInstance;

  socketInstance = io(MASTER_URL, {
    withCredentials: true,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socketInstance;
};

export const getSocket = (): Socket => {
  if (!socketInstance) {
    return initializeSocket();
  }
  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

