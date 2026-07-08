import React from 'react';
import { Outlet, useParams, Navigate } from 'react-router-dom';
import { CountryProvider, VALID_COUNTRY_CODES, CountryCode } from '../context/CountryContext';
import { LanguageProvider, LanguageCode } from '../context/LanguageContext';

export const CountryLayout: React.FC = () => {
  const { countryCode } = useParams<{ countryCode: string }>();

  if (!countryCode || !VALID_COUNTRY_CODES.includes(countryCode)) {
    return <Navigate to="/nl" replace />;
  }

  const language: LanguageCode =
    countryCode === 'nl' ? 'nl' : countryCode === 'de' ? 'de' : 'en';

  return (
    <CountryProvider initialCountryCode={countryCode as CountryCode}>
      <LanguageProvider initialLanguage={language}>
        <Outlet />
      </LanguageProvider>
    </CountryProvider>
  );
};
