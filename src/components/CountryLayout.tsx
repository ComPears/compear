import React, { useLayoutEffect } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { CountryProvider, VALID_COUNTRY_CODES, CountryCode } from '../context/CountryContext';
import { LanguageProvider, LanguageCode } from '../context/LanguageContext';
import InstallPrompt from './InstallPrompt';
import NotFoundPage from './NotFoundPage';
import { useComparisonStore } from '../store/comparisonStore';
import { useBasketStore } from '../store/basketStore';
import { Seo, SITE_URL, sitePath } from './Seo';

const LIST_COUNTRY_KEY = 'compear-list-country';

const CountryScopedState: React.FC<{ countryCode: CountryCode }> = ({ countryCode }) => {
  const comparisonCount = useComparisonStore((state) => state.items.length);
  const basketCount = useBasketStore((state) => state.items.length);
  const clearComparison = useComparisonStore((state) => state.clear);
  const clearBasket = useBasketStore((state) => state.clear);

  useLayoutEffect(() => {
    let storedCountry: string | null = null;
    try {
      storedCountry = localStorage.getItem(LIST_COUNTRY_KEY);
    } catch {
      return;
    }

    // Lists contain country-specific product IDs and prices. Clear legacy or
    // foreign-country state instead of showing Dutch products with UK prices.
    if (
      (storedCountry && storedCountry !== countryCode) ||
      (!storedCountry && (comparisonCount > 0 || basketCount > 0))
    ) {
      clearComparison();
      clearBasket();
    }

    localStorage.setItem(LIST_COUNTRY_KEY, countryCode);
  }, [basketCount, clearBasket, clearComparison, comparisonCount, countryCode]);

  return null;
};

const DefaultRouteSeo: React.FC<{ countryCode: CountryCode }> = ({ countryCode }) => {
  const location = useLocation();
  const routeTail = location.pathname.replace(/^\/(uk|nl|de)/, '');
  if (/^\/(products|product|categories)\//.test(routeTail)) return null;

  const privateRoute = /^\/(basket|receipts|shared|search)(\/|$)/.test(routeTail);
  const isUk = countryCode === 'uk';
  const isDe = countryCode === 'de';
  const title = isUk
    ? 'Compare UK Supermarket Prices | ComPear'
    : isDe
      ? 'Supermarktpreise vergleichen | ComPear'
      : 'Vergelijk Supermarktprijzen | ComPear';
  const description = isUk
    ? 'Compare current grocery prices across Tesco, Sainsbury’s, Asda, Morrisons, Aldi and Lidl, then build the cheapest shopping plan.'
    : isDe
      ? 'ComPear kommt bald nach Deutschland. Tragen Sie sich in die Warteliste ein.'
      : 'Vergelijk actuele boodschappenprijzen van Nederlandse supermarkten en maak de voordeligste boodschappenplanning.';
  const structuredData = routeTail === '' || routeTail === '/'
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'ComPear',
          url: sitePath(`/${countryCode}`),
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/${countryCode}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'ComPear',
          url: SITE_URL,
          logo: `${SITE_URL}/logo512.png`,
        },
      ]
    : undefined;

  return (
    <Seo
      title={title}
      description={description}
      path={location.pathname}
      country={countryCode}
      noIndex={privateRoute}
      structuredData={structuredData}
    />
  );
};

export const CountryLayout: React.FC = () => {
  const { countryCode } = useParams<{ countryCode: string }>();

  if (!countryCode || !VALID_COUNTRY_CODES.includes(countryCode)) {
    return <NotFoundPage />;
  }

  const language: LanguageCode =
    countryCode === 'nl' ? 'nl' : countryCode === 'de' ? 'de' : 'en';

  return (
    <CountryProvider initialCountryCode={countryCode as CountryCode}>
      <LanguageProvider initialLanguage={language}>
        <CountryScopedState countryCode={countryCode as CountryCode} />
        <DefaultRouteSeo countryCode={countryCode as CountryCode} />
        <Outlet />
        <InstallPrompt />
      </LanguageProvider>
    </CountryProvider>
  );
};
