'use client';

import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { Locale } from '../i18n/messages';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useTranslation();

  const toggleLanguage = () => {
    const newLocale: Locale = locale === 'en' ? 'vi' : 'en';
    setLocale(newLocale);
  };

  return (
    <button 
      onClick={toggleLanguage} 
      className="language-switcher"
      title={locale === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
    >
      <Globe size={20} />
      <span>{locale === 'en' ? 'EN' : 'VI'}</span>
    </button>
  );
};
