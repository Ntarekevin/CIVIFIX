import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-bg-dark font-inter">
      {/* Left Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <TopNav />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-bg-dark">
          <div className="max-w-7xl mx-auto flex gap-6">
            {/* Left Column (Feed) */}
            <div className="flex-1 space-y-6">
              {children}
            </div>

            {/* Right Sidebar (Optional - can be passed as children or handled here) */}
          </div>
        </main>
      </div>
    </div>
  );
}
