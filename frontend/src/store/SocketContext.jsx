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
      
      // 1. Join admin room if applicable
      const user = JSON.parse(localStorage.getItem('civifix_user') || '{}');
      if (user.role && (user.role === 'admin' || user.role === 'official' || user.role === 'authority')) {
        newSocket.emit('join-admins');
      }

      // 2. Join rooms for my reports (tracking tokens)
      const myReports = JSON.parse(localStorage.getItem('civifix_my_reports') || '[]');
      myReports.forEach(token => {
        newSocket.emit('join-token-room', token);
      });
    });

    newSocket.on('notification', (notif) => {
      console.log('New notification:', notif);
      setNotifications(prev => [notif, ...prev]);
      
      // Optional: Play sound or show browser notification
      if (Notification.permission === 'granted') {
        new Notification('CivicFIX Update', { body: notif.content });
      }
    });

    newSocket.on('report-updated', (data) => {
      console.log('Report updated:', data);
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
