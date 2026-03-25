import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../store/LanguageContext';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [notifications, setNotifications] = useState(() => localStorage.getItem('civifix_notifications') !== 'false');
  const [saved, setSaved] = useState(false);

  const user = JSON.parse(localStorage.getItem('civifix_user') || 'null');

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('civifix_notifications', String(next));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('civifix_auth_token');
    localStorage.removeItem('civifix_user');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-outfit font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
        <p className="text-gray-500 mt-2">{t('selectLanguage')}</p>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border dark:border-gray-800 space-y-5">
        <h2 className="text-xl font-outfit font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-4">{t('preferences')}</h2>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-200">{t('darkMode')}</p>
            <p className="text-xs text-gray-500">{t('lightMode')}</p>
          </div>
          <button
            onClick={toggleDark}
            className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-200">{t('applicationLanguage')}</p>
            <p className="text-xs text-gray-500">{t('selectLanguage')}</p>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
          >
            <option value="English">English</option>
            <option value="Kinyarwanda">Kinyarwanda</option>
            <option value="French">French</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border dark:border-gray-800 space-y-5">
        <h2 className="text-xl font-outfit font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-4">{t('notifications')}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-200">{t('enableNotifications')}</p>
            <p className="text-xs text-gray-500">{t('notifications')}</p>
          </div>
          <button
            onClick={toggleNotifications}
            className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border dark:border-gray-800 space-y-5">
        <h2 className="text-xl font-outfit font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-4">{t('account')}</h2>

        {user ? (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {user.username?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{user.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role} {t('account')}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">{t('noReportsFoundDefault')}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              {t('loginAsAdmin')}
            </button>
          </div>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-[0.98]"
          >
            {t('signOut')}
          </button>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-bold transition-all ${saved ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}
      >
        {saved ? t('settingsSaved') : t('saveSettings')}
      </button>
    </div>
  );
}
