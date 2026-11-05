import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CountryProvider } from './context/CountryContext';
import { LanguageProvider } from './context/LanguageContext';
import { Product } from './api/client';
import * as shopping from './api/shopping';
import { ProductInsights } from './components/ProductInsights';
import { ProductLabelPanel } from './components/ProductLabelPanel';
import { ShoppingBriefPage } from './pages/ShoppingBriefPage';
import { AlertsPage } from './pages/AlertsPage';
import { GuideShelf } from './components/GuideShelf';
import theme from './theme';

vi.mock('./api/shopping', async original => ({ ...await original<typeof import('./api/shopping')>(), searchBrief: vi.fn(), fetchInsightsFeatures: vi.fn(), fetchPriceHistory: vi.fn(), createPriceAlert: vi.fn(), performAlertAction: vi.fn(), fetchGuides: vi.fn() }));
vi.mock('./api/client', async original => ({ ...await original<typeof import('./api/client')>(), fetchStores: vi.fn().mockResolvedValue([{ id: 'fixture', name: 'Fixture', slug: 'fixture', availability: 'available' }]) }));

const product = { id: 'milk', productName: 'Fixture milk', canonicalName: 'milk', store: 'Fixture', packageSize: '1 l', originalPrice: 1.5, effectivePrice: 1.5, promoType: null, productUrl: 'https://www.tesco.com/groceries/en-GB/products/123456789' } as Product;
function view(ui: React.ReactNode, route = '/uk') {
  return render(<MemoryRouter initialEntries={[route]}><ThemeProvider theme={theme}><CountryProvider initialCountryCode="uk"><LanguageProvider initialLanguage="en">{ui}</LanguageProvider></CountryProvider></ThemeProvider></MemoryRouter>);
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(shopping.fetchInsightsFeatures).mockResolvedValue({ history: true, alerts: true, email: false, retentionDays: 180 });
  vi.mocked(shopping.fetchPriceHistory).mockResolvedValue([]);
  vi.mocked(shopping.createPriceAlert).mockResolvedValue({ id: 'watch', productId: 'milk', country: 'uk', targetPrice: 1.2, channel: 'inapp', confirmed: true, enabled: true });
});

describe('shopping brief and evidence flows', () => {
  it('keeps missing label evidence explicit and renders source text without markup', () => {
    const rendered = view(<ProductLabelPanel product={product} />);
    expect(screen.getByText(/will not infer it from the product name/)).toBeInTheDocument();
    rendered.unmount();
    view(<ProductLabelPanel product={{ ...product, labelEvidence: { version: 1, sourceUrl: product.productUrl!, method: 'json_ld', observedAt: new Date().toISOString(), claims: [], ingredients: '<img src=x onerror=alert(1)>', nutrients: { basis: '100ml', servingSize: '100 ml', sugarG: 0 } } }} />);
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText('0g')).toBeInTheDocument();
  });
  it('does not create alerts until the user gives explicit consent', async () => {
    view(<ProductInsights product={product} />);
    const target = await screen.findByRole('spinbutton', { name: 'Target pack price' });
    fireEvent.change(target, { target: { value: '1.20' } });
    const save = screen.getByRole('button', { name: 'Watch this listing' });
    expect(save).toBeDisabled();
    expect(shopping.createPriceAlert).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(save);
    await waitFor(() => expect(shopping.createPriceAlert).toHaveBeenCalledWith('milk', 1.2, 'uk', 'inapp', undefined));
    expect(await screen.findByText(/Alert saved/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.queryByRole('img')).not.toBeInTheDocument(); // no invented history
  });
  it('opening an email action link alone never confirms a subscription', async () => {
    vi.mocked(shopping.performAlertAction).mockResolvedValue();
    window.history.replaceState(null, '', '/#id=fixture&token=capability');
    view(<Routes><Route path="/uk/alerts/:action" element={<AlertsPage />} /></Routes>, '/uk/alerts/confirm');
    const confirm = await screen.findByRole('button', { name: 'Confirm email alert' });
    expect(shopping.performAlertAction).not.toHaveBeenCalled();
    fireEvent.click(confirm);
    await waitFor(() => expect(shopping.performAlertAction).toHaveBeenCalledWith('confirm', 'fixture', 'capability'));
    expect(await screen.findByText('Your request has been saved.')).toBeInTheDocument();
    expect(window.location.hash).toBe('');
  });
  it('shows unknown results separately and lets the user remove a condition', async () => {
    const response: shopping.BriefResponse = { brief: { query: 'milk', constraints: [{ kind: 'claim', value: 'vegan' }], warnings: [] }, evaluated: 1, candidateLimit: 500, counts: { matches: 0, unknown: 1, excluded: 0 }, matches: [], unknown: [{ product, status: 'unknown', assessments: [{ status: 'unknown', code: 'claim-not-evidenced', constraint: { kind: 'claim', value: 'vegan' } }] }], excluded: [], unitLeaders: [] };
    vi.mocked(shopping.searchBrief).mockResolvedValue(response);
    view(<ShoppingBriefPage />);
    fireEvent.change(screen.getByLabelText('What are you looking for?'), { target: { value: 'vegan milk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check my brief' }));
    expect(await screen.findByRole('tab', { name: 'Needs more evidence (1)' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Meets the checks (0)' })).toBeInTheDocument();
    expect(screen.getByText('Fixture milk')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Remove condition'));
    await waitFor(() => expect(shopping.searchBrief).toHaveBeenLastCalledWith('milk', 'uk', [], [], expect.any(AbortSignal), undefined));
  });
  it('guide cards expose actual sample counts and stay within their category', async () => {
    vi.mocked(shopping.fetchGuides).mockResolvedValue([{ slug: 'milk', title: 'Milk', query: 'milk', section: 'breakfast', basis: 'l', offerCount: 4, storeCount: 2, lowPackPrice: 1.2, knownUnitCount: 3 }]);
    view(<GuideShelf />);
    expect(await screen.findByText('4 sampled offers')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Milk/ })).toHaveAttribute('href', '/uk/guides/milk');
    fireEvent.click(screen.getByRole('tab', { name: 'Around the home' }));
    expect(screen.queryByText('4 sampled offers')).not.toBeInTheDocument();
  });
});
