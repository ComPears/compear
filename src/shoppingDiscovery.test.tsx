import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { CountryProvider, CountryCode } from './context/CountryContext';
import { LanguageProvider } from './context/LanguageContext';
import { DepartmentPage, JournalPage, ShoppingSpacePage, DealsPage } from './pages/ExplorePages';
import { BriefEntry } from './components/ShoppingEntry';
import { discoveryLink, discoveryShops } from './services/retailerDiscovery';
import { exploreCopy } from './translations/explore';
import theme from './theme';
afterEach(cleanup);

vi.mock('./api/shopping', async importOriginal => ({ ...await importOriginal<typeof import('./api/shopping')>(), fetchGuides: vi.fn().mockResolvedValue([]) }));
vi.mock('./api/deals', () => ({ fetchDeals: vi.fn().mockResolvedValue({ items: [], total: 0, offset: 0, limit: 24 }) }));
function page(element: React.ReactNode, route = '/uk/space', pattern = '/:countryCode/space', country: CountryCode = 'uk') {
  return render(<MemoryRouter initialEntries={[route]}><ThemeProvider theme={theme}><CountryProvider initialCountryCode={country}><LanguageProvider initialLanguage={country === 'uk' ? 'en' : country}><Routes><Route path={pattern} element={element} /></Routes></LanguageProvider></CountryProvider></ThemeProvider></MemoryRouter>);
}

describe('honest shopping discovery', () => {
  it('keeps marketplace links country-bound and query strings encoded', () => {
    for (const country of ['uk', 'nl', 'de'] as const) {
      const url = new URL(discoveryLink(country, `amazon-${country}`, 'milk & tag=intruder <script>')!);
      expect(url.hostname).toBe(country === 'uk' ? 'www.amazon.co.uk' : `www.amazon.${country}`);
      expect(url.searchParams.get('k')).toBe('milk & tag=intruder <script>');
      expect(url.searchParams.has('tag')).toBe(false);
      expect(discoveryLink(country, 'https://attacker.example')).toBeUndefined();
      expect(discoveryShops(country, 'electronics').every(shop => !['picnic-nl', 'picnic-de', 'crisp'].includes(shop.id))).toBe(true);
    }
    expect(discoveryLink('nl', 'amazon-uk', 'milk')).toBeUndefined();
  });
  it('has a complete translated discovery vocabulary', () => {
    for (const language of ['nl', 'de'] as const) expect(Object.keys(exploreCopy[language]).sort()).toEqual(Object.keys(exploreCopy.en).sort());
  });
  it('clearly separates external electronics searches from verified prices', async () => {
    page(<DepartmentPage />, '/uk/departments/electronics', '/:countryCode/departments/:departmentSlug');
    expect(screen.getByText(/Electronics price feeds are not connected yet/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'What are you looking for?' }), { target: { value: 'USB-C cable' } });
    expect(screen.getByRole('link', { name: 'Search at Amazon UK' })).toHaveAttribute('href', 'https://www.amazon.co.uk/s?k=USB-C+cable');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  });
  it('does not call a browser-linked shopping space a signed-in account', () => {
    page(<ShoppingSpacePage />);
    expect(screen.getByText(/not a signed-in account or cross-device sync/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Price watch/ })).toHaveAttribute('href', '/uk/alerts');
  });
  it('shows the offers empty state without inventing deals', async () => {
    page(<DealsPage />, '/uk/deals', '/:countryCode/deals');
    expect(await screen.findByText(/No current promotions match these filters/)).toBeInTheDocument();
    expect(screen.getByText(/Promotion conditions apply/)).toBeInTheDocument();
  });
  it('uses original localized journal content', () => {
    page(<JournalPage />, '/de/journal', '/:countryCode/journal', 'de');
    expect(screen.getByRole('heading', { name: 'Das Compears-Journal', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Die kleine Zahl/)).toBeInTheDocument();
  });
  it('opens a home-page brief as a real request', async () => {
    render(<MemoryRouter initialEntries={['/uk']}><CountryProvider initialCountryCode="uk"><LanguageProvider initialLanguage="en"><Routes><Route path="/uk" element={<BriefEntry />} /><Route path="/uk/brief" element={<p>Brief destination</p>} /></Routes></LanguageProvider></CountryProvider></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox', { name: 'What are you looking for?' }), { target: { value: 'milk under £2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check my brief' }));
    expect(await screen.findByText('Brief destination')).toBeInTheDocument();
  });
});
