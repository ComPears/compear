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

// Safe version of useCountry that returns null when context is not available
export const useCountryOptional = () => {
  const context = useContext(CountryContext);
  return context || null;
};

interface CountryProviderProps {
  children: ReactNode;
  initialCountryCode?: CountryCode;
}

// Helper function to update document meta information
const updateDocumentMeta = (country: CountryInfo) => {
  // Update document title
  document.title = `ComPear - ${country.name}`;
  
  // Update meta description based on country
  const metaDescriptions = {
    'nl': 'Compare grocery prices across Dutch supermarkets. Find the best deals and save money on your shopping.',
    'uk': 'Compare grocery prices across UK supermarkets. Find the best deals and save money on your shopping.',
    'de': 'Compare grocery prices across German supermarkets. Find the best deals and save money on your shopping.'
  };
  
  const metaDescription = metaDescriptions[country.code];
  const descriptionMeta = document.querySelector('meta[name="description"]');
  
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', metaDescription);
  }
};

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

  // Update document meta information when country changes
  useEffect(() => {
    updateDocumentMeta(country);
  }, [country]);

  // Update country state, localStorage, and URL
  const setCountry = (countryCode: CountryCode) => {
    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
    setCountryState(selectedCountry);
    
    // Only update localStorage when user explicitly changes country (not from URL)
    localStorage.setItem('countryCode', countryCode);
    
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