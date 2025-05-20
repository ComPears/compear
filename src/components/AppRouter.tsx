import React, { useEffect, useState } from 'react';
import { CountryProvider, VALID_COUNTRY_CODES, CountryCode } from '../context/CountryContext';
import { LanguageProvider, LanguageCode } from '../context/LanguageContext';
import App from '../App';
import NotFoundPage from './NotFoundPage';

/**
 * AppRouter component that handles routing and country validation
 * This component acts as the entry point for the application
 */
const AppRouter: React.FC = () => {
  // Track if page should show 404
  const [isInvalidRoute, setIsInvalidRoute] = useState(false);
  // Store valid country code from URL
  const [countryCode, setCountryCode] = useState<CountryCode>('nl');
  // Store initial language based on country
  const [initialLanguage, setInitialLanguage] = useState<LanguageCode>('en');
  
  useEffect(() => {
    // Function to validate URL and update state
    const validateRoute = () => {
      try {
        // Extract country code from URL
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const urlCountryCode = pathSegments[0];
        
        // Handle missing country code
        if (!urlCountryCode) {
          // Get country from localStorage or default to 'nl'
          const savedCountry = localStorage.getItem('countryCode') as CountryCode;
          const defaultCountry = VALID_COUNTRY_CODES.includes(savedCountry) ? savedCountry : 'nl';
          
          // Update URL with default country without refreshing
          window.history.replaceState(null, '', `/${defaultCountry}`);
          setCountryCode(defaultCountry);
          
          // Set initial language based on country
          const countryToLanguage: Record<string, LanguageCode> = {
            'nl': 'nl',
            'uk': 'en',
            'de': 'de'
          };
          setInitialLanguage(countryToLanguage[defaultCountry] || 'en');
          
          setIsInvalidRoute(false);
          return;
        }
        
        // Check if country code is valid
        if (VALID_COUNTRY_CODES.includes(urlCountryCode)) {
          setCountryCode(urlCountryCode as CountryCode);
          
          // Set initial language based on country
          const countryToLanguage: Record<string, LanguageCode> = {
            'nl': 'nl',
            'uk': 'en',
            'de': 'de'
          };
          setInitialLanguage(countryToLanguage[urlCountryCode] || 'en');
          
          setIsInvalidRoute(false);
        } else {
          // Invalid country code - don't redirect
          setIsInvalidRoute(true);
        }
      } catch (error) {
        console.error('Error validating route:', error);
        // Default to Netherlands on error
        setCountryCode('nl');
        setInitialLanguage('nl');
        setIsInvalidRoute(false);
      }
    };
    
    // Initialize validation
    validateRoute();
    
    // Handle browser navigation events
    const handlePopState = () => {
      validateRoute();
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