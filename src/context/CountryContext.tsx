import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CountryCode = 'nl' | 'uk' | 'de';

interface CountryInfo {
  code: CountryCode;
  name: string;
  available: boolean;
}

export const countries: CountryInfo[] = [
  { code: 'nl', name: 'Netherlands', available: true },
  { code: 'uk', name: 'United Kingdom', available: false },
  { code: 'de', name: 'Germany', available: false }
];

interface CountryContextType {
  country: CountryInfo;
  setCountry: (countryCode: CountryCode) => void;
  isCountryAvailable: (countryCode: CountryCode) => boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

interface CountryProviderProps {
  children: ReactNode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({ children }) => {
  // Helper function to get country code from URL
  const getCountryCodeFromUrl = (): CountryCode | null => {
    try {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const countryCode = pathSegments[0] as CountryCode;
      
      if (countryCode && ['nl', 'uk', 'de'].includes(countryCode)) {
        return countryCode as CountryCode;
      }
    } catch (error) {
      console.warn('Error getting country from URL:', error);
    }
    return null;
  };
  
  // Get initial country from URL, localStorage, or default to Netherlands
  const getInitialCountry = (): CountryInfo => {
    // First priority: URL path
    const urlCountryCode = getCountryCodeFromUrl();
    if (urlCountryCode) {
      return countries.find(c => c.code === urlCountryCode) || countries[0];
    }
    
    // Second priority: localStorage
    const savedCountryCode = localStorage.getItem('countryCode') as CountryCode;
    if (savedCountryCode && ['nl', 'uk', 'de'].includes(savedCountryCode)) {
      return countries.find(c => c.code === savedCountryCode) || countries[0];
    }
    
    // Default to Netherlands
    return countries[0];
  };
  
  const [country, setCountryState] = useState<CountryInfo>(getInitialCountry());

  // Update localStorage when country changes
  const setCountry = (countryCode: CountryCode) => {
    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
    setCountryState(selectedCountry);
    localStorage.setItem('countryCode', countryCode);
    
    // Update the window title to reflect the selected country
    document.title = `ComPear - ${selectedCountry.name}`;
  };
  
  // Set document title on first render
  useEffect(() => {
    document.title = `ComPear - ${country.name}`;
  }, [country.name]);
  
  const isCountryAvailable = (countryCode: CountryCode): boolean => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.available : false;
  };

  return (
    <CountryContext.Provider value={{ country, setCountry, isCountryAvailable }}>
      {children}
    </CountryContext.Provider>
  );
}; 