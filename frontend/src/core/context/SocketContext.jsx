import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('[Socket] Connected to server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
