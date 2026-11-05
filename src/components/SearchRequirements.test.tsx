import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { CountryProvider, CountryCode } from '../context/CountryContext';
import { LanguageProvider } from '../context/LanguageContext';
import { fetchProducts } from '../api/client';
import { searchBrief, BriefResponse, Constraint } from '../api/shopping';
import { ShoppingBriefPage } from '../pages/ShoppingBriefPage';
import { briefSearchParams, positiveAmount, readBriefChecks } from '../utils/briefNavigation';
import { requirementsCopy } from '../translations/requirements';
import theme from '../theme';
import ProductSearch from './ProductSearch';
import { SearchRequirements } from './SearchRequirements';

vi.mock('../api/client', async original => ({ ...await original<typeof import('../api/client')>(), fetchProducts: vi.fn().mockResolvedValue([]), fetchStores: vi.fn().mockResolvedValue([]) }));
vi.mock('../api/shopping', async original => ({ ...await original<typeof import('../api/shopping')>(), searchBrief: vi.fn() }));
vi.mock('./BarcodeScanner', () => ({ BarcodeScanButton: ({ onDetected, disabled }: { onDetected: (code: string) => void; disabled: boolean }) => <button disabled={disabled} onClick={() => onDetected('8712345678906')}>Scan</button> }));

const packCheck: Constraint[] = [{ kind: 'price', maximum: 2.5 }];
const empty: BriefResponse = { brief: { query: 'milk', constraints: packCheck, warnings: [] }, evaluated: 0, candidateLimit: 500, counts: { matches: 0, unknown: 0, excluded: 0 }, matches: [], unknown: [], excluded: [], unitLeaders: [] };
function Location() { return <output data-testid="location">{useLocation().search}</output>; }
function view(element: React.ReactNode, route = '/uk', country: CountryCode = 'uk') {
  return render(<MemoryRouter initialEntries={[route]}><ThemeProvider theme={theme}><CountryProvider initialCountryCode={country}><LanguageProvider initialLanguage={country === 'uk' ? 'en' : country}><Routes><Route path="/:countryCode" element={element} /><Route path="/:countryCode/brief" element={<ShoppingBriefPage />} /></Routes><Location /></LanguageProvider></CountryProvider></ThemeProvider></MemoryRouter>);
}
function open() { fireEvent.click(screen.getByRole('button', { name: 'Add requirements (optional)' })); }
beforeEach(() => { vi.clearAllMocks(); vi.mocked(searchBrief).mockResolvedValue(empty); });
afterEach(cleanup);

describe('one search with optional requirements', () => {
  it('starts collapsed, reuses the original product name and leaves Scan available', () => {
    view(<ProductSearch onAddGrocery={vi.fn()} showRequirements />);
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Scan' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Add requirements (optional)' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'milk' } });
    open();
    expect(screen.getByRole('form', { name: 'Narrow your product search' })).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(2); // amounts, never a second product box
    expect(screen.getByRole('combobox', { name: 'Search products' })).toHaveValue('milk');
    expect(screen.getByRole('button', { name: 'Scan' })).toBeEnabled();
    open();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Search products' })).toHaveValue('milk');
  });

  it('applies pack, unit and label checks to the existing product name', async () => {
    view(<ProductSearch onAddGrocery={vi.fn()} showRequirements />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: ' milk ' } }); open();
    fireEvent.change(screen.getByLabelText('Maximum pack price'), { target: { value: '2,50' } });
    fireEvent.change(screen.getByLabelText('Maximum unit price'), { target: { value: '1.2500' } });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Per' }));
    fireEvent.click(await screen.findByRole('option', { name: 'kg' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Retailer label requirement' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Vegan' }));
    fireEvent.submit(screen.getByRole('form', { name: 'Narrow your product search' }));
    const checks: Constraint[] = [...packCheck, { kind: 'unit-price', maximum: 1.25, basis: 'kg' }, { kind: 'claim', value: 'vegan' }];
    await waitFor(() => expect(searchBrief).toHaveBeenCalledWith('milk', 'uk', checks, [], expect.any(AbortSignal), undefined));
    expect(readBriefChecks(new URLSearchParams(screen.getByTestId('location').textContent!).get('checks'))).toEqual(checks);
  });

  it('requires a product and a valid nonempty requirement, and can clear the draft', () => {
    view(<SearchRequirements productQuery="" />); open();
    const apply = screen.getByRole('button', { name: 'Check requirements' });
    expect(apply).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Maximum pack price'), { target: { value: '2' } });
    expect(apply).toBeDisabled();
    expect(screen.getByText(/Enter a product name above/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear requirements' }));
    expect(screen.getByLabelText('Maximum pack price')).toHaveValue('');
    expect(apply).toBeDisabled();
  });

  it('can check requirements without waiting for the background name search', async () => {
    vi.mocked(fetchProducts).mockImplementationOnce(() => new Promise(() => undefined));
    view(<ProductSearch onAddGrocery={vi.fn()} showRequirements />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'milk' } }); open();
    fireEvent.change(screen.getByLabelText('Maximum pack price'), { target: { value: '2.5' } });
    await waitFor(() => expect(fetchProducts).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Scan' })).toBeDisabled(); // original scanner behaviour
    const apply = screen.getByRole('button', { name: 'Check requirements' });
    expect(apply).toBeEnabled(); fireEvent.click(apply);
    await waitFor(() => expect(searchBrief).toHaveBeenCalledWith('milk', 'uk', packCheck, [], expect.any(AbortSignal), undefined));
  });

  it.each(['0', '-1', '1e2', 'NaN', 'Infinity', '100001', '£2', '1.234'])('does not submit invalid pack amount %s', value => {
    view(<SearchRequirements productQuery="milk" />); open();
    fireEvent.change(screen.getByLabelText('Maximum pack price'), { target: { value } });
    expect(screen.getByRole('button', { name: 'Check requirements' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('form'));
    expect(searchBrief).not.toHaveBeenCalled();
  });

  it('retains the barcode API flow without sending any requirements', async () => {
    view(<ProductSearch onAddGrocery={vi.fn()} showRequirements />); open();
    fireEvent.change(screen.getByLabelText('Maximum pack price'), { target: { value: '2.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Scan' }));
    await waitFor(() => expect(fetchProducts).toHaveBeenCalledWith({ barcode: '8712345678906' }, 'uk', undefined));
    expect(searchBrief).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Add requirements (optional)' })).not.toBeInTheDocument());
  });

  it.each(['nl', 'de'] as const)('uses local copy and euros for %s', country => {
    view(<SearchRequirements productQuery="milk" />, `/${country}`, country);
    fireEvent.click(screen.getByRole('button', { name: requirementsCopy[country]['requirements.add'] }));
    expect(screen.getAllByText('€')).toHaveLength(2);
    expect(screen.queryByText('£')).not.toBeInTheDocument();
    expect(Object.keys(requirementsCopy[country]).sort()).toEqual(Object.keys(requirementsCopy.en).sort());
  });
});

describe('shared requirements do not silently disappear', () => {
  it('reloads explicit checks and retains them when resubmitting or editing the product', async () => {
    view(<p />, `/uk/brief?${briefSearchParams('milk', packCheck)}`);
    await waitFor(() => expect(searchBrief).toHaveBeenCalledTimes(1));
    const request = screen.getByLabelText('What are you looking for?', { selector: 'textarea' });
    fireEvent.change(request, { target: { value: 'oat milk' } });
    fireEvent.submit(request.closest('form')!);
    await waitFor(() => expect(searchBrief).toHaveBeenLastCalledWith('oat milk', 'uk', packCheck, [], expect.any(AbortSignal), undefined));
    expect(new URLSearchParams(screen.getByTestId('location').textContent!).get('q')).toBe('oat milk');
    expect(readBriefChecks(new URLSearchParams(screen.getByTestId('location').textContent!).get('checks'))).toEqual(packCheck);
    await screen.findByTitle('Remove condition');
    fireEvent.click(screen.getByTitle('Remove condition'));
    await waitFor(() => expect(searchBrief).toHaveBeenLastCalledWith('milk', 'uk', [], [], expect.any(AbortSignal), undefined));
    expect(new URLSearchParams(screen.getByTestId('location').textContent!).get('checks')).toBe('[]');
  });

  it.each(['not-json', '{}', JSON.stringify(Array(11).fill({ kind: 'price', maximum: 2 })), ' '.repeat(2401)])('fails closed for malformed shared checks', async checks => {
    view(<p />, `/uk/brief?${new URLSearchParams({ q: 'milk', checks })}`);
    expect(await screen.findByText(/We could not check this brief/)).toBeInTheDocument();
    expect(searchBrief).not.toHaveBeenCalled();
  });

  it('does not show stale matches after checking a changed request fails', async () => {
    view(<p />, `/uk/brief?${briefSearchParams('milk', packCheck)}`);
    await screen.findByRole('heading', { name: 'Your brief, unpacked' });
    vi.mocked(searchBrief).mockRejectedValueOnce(new Error('Unavailable'));
    fireEvent.submit(screen.getByLabelText('What are you looking for?', { selector: 'textarea' }).closest('form')!);
    expect(await screen.findByText(/We could not check this brief/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Your brief, unpacked' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Meets the checks/ })).not.toBeInTheDocument();
  });

  it('keeps natural-language requests without explicit checks backwards compatible', async () => {
    view(<p />, '/uk/brief?q=milk%20under%20%C2%A32');
    await waitFor(() => expect(searchBrief).toHaveBeenCalledWith('milk under £2', 'uk', undefined, [], expect.any(AbortSignal), undefined));
    expect(positiveAmount('0,0001', 4)).toBe(0.0001);
    expect(positiveAmount('1.234')).toBeUndefined();
    expect(readBriefChecks(null)).toBeUndefined();
  });
});
