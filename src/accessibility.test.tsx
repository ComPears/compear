import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AppNavBar from './components/AppNavBar';
import { ProductGroupList } from './components/ProductGroupList';
import { ProductSortBar } from './components/ProductSortBar';
import { CountryProvider, CountryCode } from './context/CountryContext';
import { LanguageProvider, LanguageCode } from './context/LanguageContext';
import { Product } from './api/client';
import theme from './theme';

function renderWithProviders(
  ui: React.ReactNode,
  country: CountryCode = 'nl',
  language: LanguageCode = 'nl'
) {
  return render(
    <MemoryRouter initialEntries={[`/${country}`]}>
      <ThemeProvider theme={theme}>
        <CountryProvider initialCountryCode={country}>
          <LanguageProvider initialLanguage={language}>{ui}</LanguageProvider>
        </CountryProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

const milk: Product = {
  id: 'milk-1',
  canonicalName: 'milk',
  productName: 'Halfvolle melk',
  brand: null,
  store: 'Albert Heijn',
  packageSize: '1 l',
  weightInGrams: 1000,
  originalPrice: 1.25,
  effectivePrice: 1.25,
  unitPrice: 1.25,
  effectiveUnitPrice: 1.25,
  promoType: null,
  promoValue: null,
  promoValidUntil: null,
};

describe('accessibility and translations', () => {
  it('exposes the navigation menu state and localized accessible name', () => {
    renderWithProviders(<AppNavBar />);

    const menuButton = screen.getByRole('button', { name: 'Navigatiemenu openen' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('combobox', { name: 'Land' })).toBeInTheDocument();
  });

  it('renders English sort controls without Dutch fallback text', () => {
    renderWithProviders(<ProductSortBar value="relevance" onChange={() => undefined} />, 'uk', 'en');

    expect(screen.getByRole('group', { name: 'Sort' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Relevance' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Relevantie')).not.toBeInTheDocument();
  });

  it('uses semantic buttons and product-specific names for product actions', () => {
    renderWithProviders(
      <ProductGroupList
        groups={[{
          key: 'milk',
          displayName: 'Halfvolle melk',
          packageSize: '1 l',
          products: [milk],
          storeOffers: [milk],
          cheapest: milk,
        }]}
      />
    );

    expect(screen.getAllByRole('button', { name: 'Halfvolle melk bekijken' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Toevoegen' })).toBeInTheDocument();
  });
});
