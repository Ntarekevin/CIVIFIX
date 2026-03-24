import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Connect to the backend socket
    const newSocket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
      
      // If user is already logged in, join admin room if they have role
      const user = JSON.parse(localStorage.getItem('civifix_user') || '{}');
      if (user.role && (user.role === 'admin' || user.role === 'official' || user.role === 'authority')) {
        newSocket.emit('join-admins');
      }
    });

    newSocket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    newSocket.on('report-escalated', (data) => {
      console.log('Report escalated:', data);
      // Handle report escalated event (e.g., refresh feed or show toast)
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
