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
  { code: 'uk', name: 'United Kingdom', available: true },
  { code: 'de', name: 'Germany', available: true }
];

interface CountryContextType {
  country: CountryInfo;
  setCountry: (countryCode: CountryCode) => void;
  isCountryAvailable: (countryCode: CountryCode) => boolean;
  getCountryByCode: (code: CountryCode) => CountryInfo;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

function resolveCountry(countryCode: CountryCode): CountryInfo {
  return countries.find((c) => c.code === countryCode) || countries[0];
}

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

// Safe version of useCountry that returns null when context is not available
export const useCountryOptional = () => {
  const context = useContext(CountryContext);
  return context || null;
};

interface CountryProviderProps {
  children: ReactNode;
  initialCountryCode?: CountryCode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({ 
  children,
  initialCountryCode = 'nl' // Default to Netherlands if not specified
}) => {
  const [country, setCountryState] = useState<CountryInfo>(() => resolveCountry(initialCountryCode));

  // Keep context in sync when the route param changes (e.g. footer / deep links).
  // CountryLayout reuses this provider instance across /nl → /uk navigations.
  useEffect(() => {
    const selected = resolveCountry(initialCountryCode);
    setCountryState(selected);
    localStorage.setItem('countryCode', selected.code);
  }, [initialCountryCode]);

  // State + persistence only. Callers (nav/footer) own React Router navigation.
  const setCountry = (countryCode: CountryCode) => {
    const selectedCountry = resolveCountry(countryCode);
    setCountryState(selectedCountry);
    localStorage.setItem('countryCode', countryCode);
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
