import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type CountryCode = 'nl' | 'uk' | 'de';

// Valid country codes for the application
export const VALID_COUNTRY_CODES = ['nl', 'uk', 'de'];

export interface CountryInfo {
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
  getCountryByCode: (code: CountryCode) => CountryInfo;
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
  initialCountryCode?: CountryCode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({ 
  children,
  initialCountryCode = 'nl' // Default to Netherlands if not specified
}) => {
  // Find initial country without any URL or localStorage side effects
  const getInitialCountry = (): CountryInfo => {
    // Use the provided initialCountryCode prop
    return countries.find(c => c.code === initialCountryCode) || countries[0];
  };
  
  const [country, setCountryState] = useState<CountryInfo>(() => getInitialCountry());



  // Update country state, localStorage, and URL
  const setCountry = (countryCode: CountryCode) => {
    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
    setCountryState(selectedCountry);
    
    // Only update localStorage when user explicitly changes country (not from URL)
    localStorage.setItem('countryCode', countryCode);
    document.title = `ComPear - ${selectedCountry.name}`;
    
    // Update URL to match the selected country
    if (window.location.pathname !== `/${countryCode}`) {
      window.history.pushState(null, '', `/${countryCode}`);
    }
  };
  
  const isCountryAvailable = (countryCode: CountryCode): boolean => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.available : false;
  };
  
  const getCountryByCode = (code: CountryCode): CountryInfo => {
    return countries.find(c => c.code === code) || countries[0];
  };

  return (
    <CountryContext.Provider value={{ 
      country, 
      setCountry, 
      isCountryAvailable,
      getCountryByCode
    }}>
      {children}
    </CountryContext.Provider>
  );
}; 