import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLoginStore } from '../utils/useLoginStore';

export type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<SocketContextType>(null);
  const { profile } = useLoginStore();

  useEffect(() => {
    if (profile?.id) {
      // Replace with your server URL
      const newSocket = io('http://192.168.1.10:5000', {
        transports: ['websocket'],
        query: { userId: profile.id },
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [profile?.id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  return useContext(SocketContext);
};

