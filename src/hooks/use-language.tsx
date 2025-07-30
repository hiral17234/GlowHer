"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
        const savedLanguage = localStorage.getItem('glowher-language') as Language | null;
        if (savedLanguage) {
          setLanguageState(savedLanguage);
        }
    } catch (error) {
        console.error("Could not read language from localStorage", error);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    try {
        setLanguageState(newLanguage);
        localStorage.setItem('glowher-language', newLanguage);
    } catch (error) {
        console.error("Could not save language to localStorage", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
