import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CountryProvider } from './context/CountryContext';
import { LanguageProvider } from './context/LanguageContext';
import { countries } from './context/CountryContext';
import theme from './theme';
import App from './App';

vi.mock('./api/client', () => ({
  fetchProducts: vi.fn().mockResolvedValue([]),
  fetchProduct: vi.fn(),
  fetchStores: vi.fn().mockResolvedValue([]),
}));

vi.mock('./services/supermarketService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services/supermarketService')>();
  return {
    ...actual,
    fetchPricesForGrocery: vi.fn().mockResolvedValue([]),
  };
});

function renderApp(countryCode: 'nl' | 'uk' | 'de' = 'nl', language: 'en' | 'nl' | 'de' = 'nl') {
  return render(
    <MemoryRouter initialEntries={[`/${countryCode}`]}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CountryProvider initialCountryCode={countryCode}>
          <LanguageProvider initialLanguage={language}>
            <Routes>
              <Route path="/:countryCode" element={<App />} />
            </Routes>
          </LanguageProvider>
        </CountryProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('App', () => {
  it('renders the ComPear title in the navigation bar', () => {
    renderApp();
    expect(screen.getByRole('link', { name: 'Naar home' })).toHaveTextContent('ComPear');
    cleanup();
  });

  it('marks Germany as an available live market', () => {
    expect(countries.find((c) => c.code === 'de')?.available).toBe(true);
    renderApp('de', 'de');
    expect(screen.queryByText(/kommt bald/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zur Startseite' })).toHaveTextContent('ComPear');
    cleanup();
  });
});
