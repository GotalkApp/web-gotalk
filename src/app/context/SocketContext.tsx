'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { socketService } from '../services/socketService';

interface SocketContextData {
  socket: typeof socketService;
}

const SocketContext = createContext<SocketContextData | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }
    
    // Cleanup on unmount (though this context likely mounts once)
    return () => {
      // socketService.disconnect(); 
      // Keep persistent across navigations, only disconnect on logout
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket: socketService }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
