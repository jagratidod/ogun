import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) { socket.close(); setSocket(null); }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });

    newSocket.on('connect', () => console.log('[Socket] Connected to server'));
    newSocket.on('connect_error', (err) => console.error('[Socket] Connection error:', err));
    newSocket.connect();
    setSocket(newSocket);

    return () => { newSocket.disconnect(); };
  }, [isAuthenticated, user?._id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
