import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-bg-dark font-inter overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar darkMode={darkMode} toggleTheme={toggleTheme} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNav darkMode={darkMode} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
