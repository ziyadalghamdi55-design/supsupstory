/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Dictionary } from './types';
import { englishDictionary, arabicDictionary } from './translations';

interface BilingualContextProps {
  language: Language;
  direction: 'ltr' | 'rtl';
  dictionary: Dictionary;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const BilingualContext = createContext<BilingualContextProps | undefined>(undefined);

export const BilingualProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('shakhsi_language');
    if (saved === 'ar' || saved === 'en') return saved;
    return 'en'; // default to English
  });

  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [dictionary, setDictionary] = useState<Dictionary>(englishDictionary);

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(dir);
    setDictionary(language === 'ar' ? arabicDictionary : englishDictionary);
    localStorage.setItem('shakhsi_language', language);

    // Apply dir to document HTML
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <BilingualContext.Provider value={{ language, direction, dictionary, setLanguage, toggleLanguage }}>
      <div className={language === 'ar' ? 'font-sans' : 'font-sans'} style={{ direction }}>
        {children}
      </div>
    </BilingualContext.Provider>
  );
};

export const useBilingual = () => {
  const context = useContext(BilingualContext);
  if (!context) {
    throw new Error('useBilingual must be used within a BilingualProvider');
  }
  return context;
};
