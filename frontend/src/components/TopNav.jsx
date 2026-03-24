import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSocket } from '../store/SocketContext';

const navTabs = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Reports', path: '/reports' },
  { name: 'Analytics', path: '/analytics' },
];

export default function TopNav() {
  const { notifications } = useSocket() || { notifications: [] };
  const unreadCount = notifications.length;

  return (
    <header className="h-16 bg-white dark:bg-surface-dark border-b dark:border-gray-800 flex items-center justify-between px-8 z-10">
      <div className="flex items-center gap-8">
        <h2 className="text-xl font-outfit font-bold text-gray-900 dark:text-white md:hidden">
          <span className="text-primary italic">Civic</span>FIX
        </h2>
        
        <nav className="hidden lg:flex items-center gap-6 h-16">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `h-full flex items-center px-1 border-b-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`
            }
          >
            Dashboard
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-6 justify-end">
        <div className="flex items-center gap-4">
          <NavLink to="/notifications" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full relative transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
            )}
          </NavLink>
          
          <div className="flex items-center gap-3 border-l dark:border-gray-800 pl-4 cursor-pointer">
            <img
              src="https://ui-avatars.com/api/?name=Jane+Doe&background=2d5bff&color=fff"
              alt="User"
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
