import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { Grocery } from '../types';
import { fetchProducts, Product } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useBasketStore } from '../store/basketStore';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ProductSearchBar } from './ProductSearchBar';
import { ProductSortBar } from './ProductSortBar';
import { FilterChipBar } from './FilterChipBar';
import { ProductGroupList } from './ProductGroupList';
import { BarcodeScanButton } from './BarcodeScanner';
import {
  SortMode,
  buildSuggestions,
  filterBySearch,
  groupProducts,
  groupProductsByBarcode,
  sortGroups,
} from '../utils/productGrouping';
import { extractFilterChips, filterByChip } from '../utils/filterChips';

interface ProductSearchProps {
  onAddGrocery: (grocery: Grocery) => void;
  onResetComparison?: () => void;
}

function productToGrocery(product: Product): Grocery {
  let unit: Grocery['unit'] = 'piece';
  const sizeStr = product.packageSize.toLowerCase();

  if (sizeStr.includes('kg')) unit = 'kg';
  else if (sizeStr.includes('g')) unit = 'gram';
  else if (sizeStr.includes('l') && !sizeStr.includes('ml')) unit = 'liter';
  else if (sizeStr.includes('ml')) unit = 'ml';

  const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
  const quantity = match ? parseFloat(match[1]) : 1;

  return {
    id: `supermarket-${Date.now()}-${Math.random()}`,
    name: product.productName,
    unit,
    quantity,
    variant: product.store,
    searchKeyword: product.productName,
    canonicalName: product.canonicalName,
    barcode: product.barcode,
    productId: product.id,
    packageSize: product.packageSize,
    category: product.category,
  };
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  onAddGrocery,
  onResetComparison,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortMode>('relevance');
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [barcodeQuery, setBarcodeQuery] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const { t } = useLanguage();
  const clearBasket = useBasketStore((s) => s.clear);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debouncedQuery = useDebouncedValue(searchTerm, 350);

  const resetForBarcode = useCallback(() => {
    clearBasket();
    onResetComparison?.();
    setProducts([]);
    setActiveChips([]);
    setError(null);
    setSearchTerm('');
  }, [clearBasket, onResetComparison]);

  useEffect(() => {
    if (barcodeQuery) return;

    const term = debouncedQuery.trim();
    if (term.length < 2) {
      if (term.length === 0) {
        setProducts([]);
        setSearched(false);
        setError(null);
      }
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setSearched(true);
    setActiveChips([]);
    setError(null);

    fetchProducts({ search: term })
      .then((fetched) => {
        if (controller.signal.aborted) return;
        const filtered = filterBySearch(fetched, term);
        setProducts(filtered);
        setError(
          filtered.length === 0
            ? t('error.noProductsFound').replace('{searchTerm}', term)
            : null
        );
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setProducts([]);
        setError(t('error.searchFailed'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, barcodeQuery, t]);

  const handleBarcodeDetected = useCallback(
    (barcode: string) => {
      resetForBarcode();
      setBarcodeQuery(barcode);
      setSearched(true);
      setLoading(true);

      fetchProducts({ barcode })
        .then((data) => {
          setProducts(data);
          setError(
            data.length === 0
              ? t('search.barcodeNotFound').replace('{barcode}', barcode)
              : null
          );
        })
        .catch(() => {
          setProducts([]);
          setError(t('error.searchFailed'));
        })
        .finally(() => setLoading(false));
    },
    [resetForBarcode, t]
  );

  const clearBarcodeSearch = () => {
    setBarcodeQuery(null);
    setProducts([]);
    setSearched(false);
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (!barcodeQuery && debouncedQuery.trim().length >= 2) {
      list = filterBySearch(list, debouncedQuery);
    }
    for (const chip of activeChips) {
      list = filterByChip(list, chip);
    }
    return list;
  }, [products, debouncedQuery, activeChips, barcodeQuery]);

  const groups = useMemo(() => {
    const grouped = barcodeQuery
      ? groupProductsByBarcode(filteredProducts)
      : groupProducts(filteredProducts);
    return sortGroups(grouped, sort, barcodeQuery ? '' : debouncedQuery);
  }, [filteredProducts, sort, debouncedQuery, barcodeQuery]);

  const filterChips = useMemo(() => extractFilterChips(products), [products]);
  const suggestions = useMemo(() => buildSuggestions(products, 8), [products]);

  const handleAddProduct = useCallback(
    (product: Product) => {
      onAddGrocery(productToGrocery(product));
      setProducts([]);
      setSearchTerm('');
      setBarcodeQuery(null);
      setActiveChips([]);
      setError(null);
      setSearched(false);
    },
    [onAddGrocery]
  );

  const toggleChip = (chip: string) => {
    setActiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <ProductSearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              if (barcodeQuery) setBarcodeQuery(null);
              if (error) setError(null);
            }}
            suggestions={suggestions}
            loading={loading}
            placeholder={t('search.placeholderShort')}
          />
        </Box>
        <BarcodeScanButton onDetected={handleBarcodeDetected} disabled={loading} />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {t('search.homeHint')}
      </Typography>

      {barcodeQuery && (
        <Chip
          label={t('search.barcodeChip').replace('{barcode}', barcodeQuery)}
          onDelete={clearBarcodeSearch}
          color="primary"
          variant="outlined"
          sx={{ mt: 1.5 }}
        />
      )}

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            {t('search.searching')}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {searched && !loading && products.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('search.pickProductHint')}
        </Alert>
      )}

      {products.length > 0 && !loading && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <ProductSortBar value={sort} onChange={setSort} />
          <FilterChipBar chips={filterChips} active={activeChips} onToggle={toggleChip} />
          <Chip
            size="small"
            variant="outlined"
            label={t('search.resultCount')
              .replace('{groups}', String(groups.length))
              .replace('{results}', String(filteredProducts.length))}
          />
          <ProductGroupList
            groups={groups}
            onAddProduct={handleAddProduct}
            addButtonLabel={t('search.addButton')}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductSearch;
