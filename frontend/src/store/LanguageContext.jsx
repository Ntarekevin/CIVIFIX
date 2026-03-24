import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'English';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key) => {
    const langKey = language === 'Kinyarwanda' ? 'rw' : 'en';
    if (!translations[langKey]) return key;
    return translations[langKey][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
