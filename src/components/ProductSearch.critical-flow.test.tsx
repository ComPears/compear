import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { CountryProvider } from '../context/CountryContext';
import { LanguageProvider } from '../context/LanguageContext';
import { useBasketStore } from '../store/basketStore';
import { useComparisonStore } from '../store/comparisonStore';
import theme from '../theme';
import ProductSearch from './ProductSearch';
import { fetchProducts, Product } from '../api/client';

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>();
  return { ...actual, fetchProducts: vi.fn() };
});

vi.mock('./BarcodeScanner', () => ({
  BarcodeScanButton: () => <button type="button">Scan barcode</button>,
}));

const mockedFetchProducts = vi.mocked(fetchProducts);
const result: Product = {
  id: 'ah-melk-1',
  canonicalName: 'halfvolle melk',
  productName: 'Test Halfvolle Melk',
  brand: 'Testmerk',
  store: 'Albert Heijn',
  packageSize: '1 l',
  weightInGrams: 1000,
  originalPrice: 1.49,
  effectivePrice: 1.29,
  unitPrice: 1.49,
  effectiveUnitPrice: 1.29,
  promoType: 'PERCENTAGE',
  promoValue: 0.13,
  promoValidUntil: null,
  category: 'Dairy & Eggs',
  barcode: '8712345678906',
  identityKey: 'ean:8712345678906',
};

function renderSearch() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <CountryProvider initialCountryCode="nl">
          <LanguageProvider initialLanguage="nl">
            <ProductSearch
              onAddGrocery={(grocery) => useComparisonStore.getState().add(grocery)}
            />
          </LanguageProvider>
        </CountryProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('search to comparison and basket critical flow', () => {
  beforeEach(() => {
    localStorage.clear();
    useBasketStore.getState().clear();
    useComparisonStore.getState().clear();
    mockedFetchProducts.mockReset();
    mockedFetchProducts.mockResolvedValue([result]);
  });

  afterEach(() => {
    useBasketStore.getState().clear();
    useComparisonStore.getState().clear();
  });

  it('searches after debounce and adds the chosen product to both stores', async () => {
    renderSearch();

    fireEvent.change(
      screen.getByPlaceholderText(/zoek producten/i),
      { target: { value: 'melk' } }
    );

    await waitFor(() => {
      expect(mockedFetchProducts).toHaveBeenCalledWith(
        { search: 'melk' },
        'nl',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });
    const groupTitle = await screen.findByText('Halfvolle Melk');
    const productCard = groupTitle.closest('.MuiPaper-root');
    expect(productCard).not.toBeNull();
    const addButton = within(productCard as HTMLElement).getByRole('button', {
      name: 'Toevoegen',
    });
    fireEvent.click(addButton);

    expect(useComparisonStore.getState().items).toHaveLength(1);
    expect(useComparisonStore.getState().items[0]).toMatchObject({
      name: 'Test Halfvolle Melk',
      productId: 'ah-melk-1',
      canonicalName: 'halfvolle melk',
      barcode: '8712345678906',
    });
    expect(useBasketStore.getState().items).toEqual([{ product: result, quantity: 1 }]);
    expect(screen.queryByText('Halfvolle Melk')).not.toBeInTheDocument();
  });
});
