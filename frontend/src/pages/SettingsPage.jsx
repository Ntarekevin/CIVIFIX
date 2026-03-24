import React from 'react';
import { useLanguage } from '../store/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('civifix_auth_token');
    localStorage.removeItem('civifix_user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-outfit font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account preferences and application settings.</p>
      </div>

      <div className="space-y-6">
        {/* Preferences Section */}
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border dark:border-gray-800 space-y-6">
          <h2 className="text-xl font-outfit font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-4">
            Preferences
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200">Application Language</p>
              <p className="text-xs text-gray-500">Select your preferred language for the interface.</p>
            </div>
            <select 
              value={language} 
              onChange={handleLanguageChange}
              className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
            >
              <option value="English">English</option>
              <option value="Kinyarwanda">Kinyarwanda</option>
            </select>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border dark:border-gray-800 space-y-6">
          <h2 className="text-xl font-outfit font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-4">
            Account Management
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            <button className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <span className="font-bold text-gray-700 dark:text-gray-300">Edit Profile Details</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <span className="font-bold text-gray-700 dark:text-gray-300">Privacy & Security</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleLogout}
              className="w-full py-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-[0.98]"
            >
              Sign Out from CivicFIX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
