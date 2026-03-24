import React from 'react';
import { NavLink } from 'react-router-dom';

const sidebarLinks = [
  { name: 'Posts', path: '/dashboard', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z', roles: ['any'] },
  { name: 'Mentions', path: '/mentions', icon: 'M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207', roles: ['admin', 'official', 'authority'] },
  { name: 'Notifications', path: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', roles: ['any'] },
  { name: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', roles: ['any'] },
];

export default function Sidebar({ darkMode, toggleTheme }) {
  return (
    <aside className="w-64 bg-white dark:bg-surface-dark border-r dark:border-gray-800 hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-outfit font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-primary italic">Civic</span>FIX
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-inter">ID: #3412003</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {sidebarLinks
          .filter(link => {
            const user = JSON.parse(localStorage.getItem('civifix_user') || '{}');
            return link.roles.includes('any') || link.roles.includes(user.role);
          })
          .map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-primary dark:bg-primary/10'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
              </svg>
              {link.name}
            </NavLink>
          ))}
      </nav>

      <div className="p-4 border-t dark:border-gray-800 space-y-4">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white w-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {darkMode ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            )}
          </svg>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {JSON.parse(localStorage.getItem('civifix_user') || '{}').username?.slice(0, 2).toUpperCase() || 'AC'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {JSON.parse(localStorage.getItem('civifix_user') || '{}').fullName || JSON.parse(localStorage.getItem('civifix_user') || '{}').username || 'Anonymous Citizen'}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">
              {localStorage.getItem('civifix_user') ? `#ID-${JSON.parse(localStorage.getItem('civifix_user')).id}` : '#PUBLIC-USER'}
            </p>
          </div>
          {localStorage.getItem('civifix_user') && (
            <button 
              onClick={() => {
                localStorage.removeItem('civifix_auth_token');
                localStorage.removeItem('civifix_user');
                window.location.href = '/login';
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
