import React, { useState, useEffect } from 'react';
import { getNotifications } from '../services/api';
import { useSocket } from '../store/SocketContext';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications: liveNotifications } = useSocket() || { notifications: [] };

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifs();
  }, []);

  // Merge live notifications with fetched ones
  const allNotifications = [...liveNotifications, ...notifications];

  const getIcon = (type) => {
    switch(type) {
      case 'mention': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      );
      case 'alert': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
      case 'resolved': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
      default: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    }
  };

  const getColorClass = (type) => {
    switch(type) {
      case 'alert': return 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400';
      case 'resolved': return 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400';
      case 'mention': return 'bg-blue-100 text-blue-600 dark:bg-primary/10 dark:text-primary';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-outfit font-bold text-gray-900 dark:text-white">Notifications</h1>
        <button className="text-sm font-bold text-primary hover:underline transition-all">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : allNotifications.length > 0 ? (
          allNotifications.map((n, i) => (
            <div 
              key={n.id || i} 
              className={`flex items-start gap-4 p-4 bg-white dark:bg-surface-dark rounded-2xl shadow-sm border dark:border-gray-800 transition-all hover:shadow-md cursor-pointer ${n.is_unread ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColorClass(n.type)}`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[15px] text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: n.content }}></p>
                <p className="text-xs text-gray-500">{new Date(n.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
              {n.is_unread && (
                <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2"></div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border dark:border-gray-800 border-dashed text-gray-500">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
