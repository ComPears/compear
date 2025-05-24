import React, { useEffect, useState } from 'react';
import { CountryProvider, VALID_COUNTRY_CODES, CountryCode } from '../context/CountryContext';
import { LanguageProvider, LanguageCode } from '../context/LanguageContext';
import App from '../App';
import NotFoundPage from './NotFoundPage';

/**
 * Validate the current URL and return the appropriate country code and route validity
 */
const validateCurrentRoute = () => {
  try {
    // Extract country code from URL
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const urlCountryCode = pathSegments[0];
    
    // Handle missing country code
    if (!urlCountryCode) {
      // Only use localStorage if there's no URL country code
      const savedCountry = localStorage.getItem('countryCode') as CountryCode;
      const defaultCountry = VALID_COUNTRY_CODES.includes(savedCountry) ? savedCountry : 'nl';
      
      // Update URL with default country without refreshing
      window.history.replaceState(null, '', `/${defaultCountry}`);
      
      return {
        countryCode: defaultCountry,
        isInvalid: false,
        language: defaultCountry === 'nl' ? 'nl' as LanguageCode : defaultCountry === 'de' ? 'de' as LanguageCode : 'en' as LanguageCode
      };
    }
    
    // Check if country code is valid
    if (VALID_COUNTRY_CODES.includes(urlCountryCode)) {
      // Clear localStorage if it conflicts with URL to prevent interference
      const savedCountry = localStorage.getItem('countryCode');
      if (savedCountry && savedCountry !== urlCountryCode) {
        localStorage.removeItem('countryCode');
      }
      
      // Set language based on country
      const language = urlCountryCode === 'nl' ? 'nl' as LanguageCode : urlCountryCode === 'de' ? 'de' as LanguageCode : 'en' as LanguageCode;
      
      return {
        countryCode: urlCountryCode as CountryCode,
        isInvalid: false,
        language
      };
    } else {
      // Invalid country code - show 404
      return {
        countryCode: 'nl' as CountryCode, // fallback for type safety
        isInvalid: true,
        language: 'en' as LanguageCode
      };
    }
  } catch (error) {
    console.error('Error validating route:', error);
    // Default to Netherlands on error
    return {
      countryCode: 'nl' as CountryCode,
      isInvalid: false,
      language: 'nl' as LanguageCode
    };
  }
};

/**
 * AppRouter component that handles routing and country validation
 * This component acts as the entry point for the application
 */
const AppRouter: React.FC = () => {
  // Validate route synchronously during initialization to avoid loading flash
  const initialRouteState = validateCurrentRoute();
  
  // Track if page should show 404
  const [isInvalidRoute, setIsInvalidRoute] = useState(initialRouteState.isInvalid);
  // Store valid country code from URL
  const [countryCode, setCountryCode] = useState<CountryCode>(initialRouteState.countryCode);
  // Store initial language based on country
  const [initialLanguage, setInitialLanguage] = useState<LanguageCode>(initialRouteState.language);
  
  useEffect(() => {
    // Handle browser navigation events (back/forward buttons)
    const handlePopState = () => {
      const routeState = validateCurrentRoute();
      setIsInvalidRoute(routeState.isInvalid);
      setCountryCode(routeState.countryCode);
      setInitialLanguage(routeState.language);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // If URL contains invalid country code, show 404 page
  if (isInvalidRoute) {
    return <NotFoundPage />;
  }
  
  // Otherwise, render the application with the validated country code
  return (
    <CountryProvider initialCountryCode={countryCode}>
      <LanguageProvider initialLanguage={initialLanguage}>
        <App />
      </LanguageProvider>
    </CountryProvider>
  );
};

export default AppRouter; 