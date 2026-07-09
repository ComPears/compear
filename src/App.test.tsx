import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CountryProvider } from './context/CountryContext';
import { LanguageProvider } from './context/LanguageContext';
import theme from './theme';
import App from './App';

vi.mock('./api/client', () => ({
  fetchProducts: vi.fn().mockResolvedValue([]),
}));

vi.mock('./services/supermarketService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services/supermarketService')>();
  return {
    ...actual,
    fetchPricesForGrocery: vi.fn().mockResolvedValue([]),
  };
});

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/nl']}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CountryProvider initialCountryCode="nl">
          <LanguageProvider initialLanguage="nl">
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
    expect(screen.getByText('ComPear')).toBeInTheDocument();
    cleanup();
  });
});
