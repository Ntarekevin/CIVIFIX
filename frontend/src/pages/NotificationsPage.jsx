import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import { useSocket } from '../store/SocketContext';
import { useLanguage } from '../store/LanguageContext';

export default function NotificationsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { notifications: liveNotifications } = useSocket();
  const [dbNotifications, setDbNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const myReports = JSON.parse(localStorage.getItem('civifix_my_reports') || '[]');
      const params = {};
      if (myReports.length > 0) {
        params.tokens = myReports.join(',');
      }
      
      const data = await getNotifications(params);
      setDbNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Merge live notifications with DB notifications (avoiding duplicates by ID)
  const allNotifications = [...liveNotifications, ...dbNotifications].reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      // Optimistic update
      setDbNotifications(prev => prev.map(n => n.id === id ? { ...n, is_unread: false } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const myReports = JSON.parse(localStorage.getItem('civifix_my_reports') || '[]');
    if (myReports.length === 0) return;

    try {
      await markAllNotificationsAsRead(myReports);
      setDbNotifications(prev => prev.map(n => ({ ...n, is_unread: false })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (notif.is_unread) {
      handleMarkAsRead(notif.id);
    }
    
    // Logic to navigate if notification contains report info
    if (notif.report_id) {
      const targetPath = notif.type === 'mention' ? '/mentions' : '/dashboard';
      navigate(`${targetPath}?id=${notif.report_id}`);
    } else {
      navigate('/dashboard');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'announcement':
        return (
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
        );
      case 'reply':
        return (
          <div className="p-2 bg-green-100 dark:bg-green-500/20 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'status_change':
        return (
          <div className="p-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 dark:bg-gray-500/20 text-gray-600 rounded-lg group-hover:bg-gray-600 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-outfit font-bold text-gray-900 dark:text-white">{t('notifications')}</h1>
        <button 
          onClick={handleMarkAllAsRead}
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5"
        >
          {t('markAllRead')}
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white dark:bg-surface-dark border dark:border-gray-800 rounded-2xl"></div>
            ))}
          </div>
        ) : allNotifications.length > 0 ? (
          allNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`flex gap-4 p-5 bg-white dark:bg-surface-dark border dark:border-gray-800 rounded-2xl transition-all cursor-pointer hover:shadow-lg group ${n.is_unread ? 'border-l-4 border-l-primary shadow-sm' : 'opacity-80'}`}
            >
              <div className="flex-shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">
                    {n.type?.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                  {n.content}
                </p>
              </div>
              {n.is_unread && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-3xl border dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">{t('noReportsFoundDefault')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
