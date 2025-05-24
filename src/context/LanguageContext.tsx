import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// Import translations
import { translations } from '../translations';
import { useCountryOptional } from './CountryContext';

// Define available languages
export type LanguageCode = 'en' | 'nl' | 'de';

// Interface for translations
export interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  translations: Record<LanguageCode, Translations>;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  translations: { en: {}, nl: {}, de: {} }
});

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: LanguageCode;
}



export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children,
  initialLanguage = 'en'
}) => {
  // Use safe version that doesn't throw when context is not available (e.g., in 404 page)
  const countryContext = useCountryOptional();
  const countryCode = countryContext?.country?.code || null;

  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage);

  // Update language based on country code (only if country context is available)
  useEffect(() => {
    if (countryCode) {
      // Map country code to language code
      const countryToLanguage: Record<string, LanguageCode> = {
        'nl': 'nl',
        'uk': 'en',
        'de': 'de'
      };
      
      const newLanguage = countryToLanguage[countryCode] || 'en';
      setLanguageState(newLanguage);
      
      // Store in localStorage
      localStorage.setItem('language', newLanguage);
    }
  }, [countryCode]);

  // Translation function
  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  // Update language state
  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage,
      t,
      translations
    }}>
      {children}
    </LanguageContext.Provider>
  );
}; 