import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RouteIcon from '@mui/icons-material/Route';
import { Grocery } from '../types';
import { fetchProducts, Product, ApiCountry } from '../api/client';
import { fetchProductsByBarcode, isAbortError } from '../utils/barcodeSearch';
import { useLanguage } from '../context/LanguageContext';
import { useCountry } from '../context/CountryContext';
import { productToGrocery } from '../utils/groceryMapper';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ProductSearchBar } from './ProductSearchBar';
import { ProductSortBar } from './ProductSortBar';
import { FilterChipBar } from './FilterChipBar';
import { ProductGroupList } from './ProductGroupList';
import { BarcodeScanButton } from './BarcodeScanner';
import {
  SortMode,
  buildSuggestions,
  groupProducts,
  groupProductsByBarcode,
  sortGroups,
} from '../utils/productGrouping';
import { extractFilterChips, filterByChip } from '../utils/filterChips';
import { useBasketStore } from '../store/basketStore';

interface ProductSearchProps {
  onAddGrocery: (grocery: Grocery) => void;
  onResetComparison?: () => void;
  showEmptyGuide?: boolean;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  onAddGrocery,
  onResetComparison,
  showEmptyGuide = false,
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
  const { country } = useCountry();
  const addToBasket = useBasketStore((s) => s.add);
  const apiCountry = country.code as ApiCountry;
  const abortControllerRef = useRef<AbortController | null>(null);
  const debouncedQuery = useDebouncedValue(searchTerm, 350);

  const resetForBarcode = useCallback(() => {
    onResetComparison?.();
    setProducts([]);
    setActiveChips([]);
    setError(null);
    setSearchTerm('');
  }, [onResetComparison]);

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

    fetchProducts({ search: term }, apiCountry, { signal: controller.signal })
      .then((fetched) => {
        if (controller.signal.aborted) return;
        setProducts(fetched);
        setError(
          fetched.length === 0
            ? t('error.noProductsFound').replace('{searchTerm}', term)
            : null
        );
      })
      .catch((err) => {
        if (controller.signal.aborted || isAbortError(err)) return;
        setProducts([]);
        setError(t('error.searchFailed'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, barcodeQuery, t, apiCountry]);

  const handleBarcodeDetected = useCallback(
    (barcode: string) => {
      resetForBarcode();
      setSearched(true);
      setLoading(true);
      setError(null);

      fetchProductsByBarcode(barcode, apiCountry)
        .then(({ products: data, normalized, invalid }) => {
          setBarcodeQuery(normalized ?? barcode);
          setProducts(data);
          if (invalid) {
            setError(t('search.barcodeInvalid'));
          } else if (data.length === 0) {
            setError(
              t('search.barcodeNotFound').replace('{barcode}', normalized ?? barcode)
            );
          }
        })
        .catch((err) => {
          if (isAbortError(err)) return;
          setProducts([]);
          setError(t('error.searchFailed'));
        })
        .finally(() => setLoading(false));
    },
    [resetForBarcode, t, apiCountry]
  );

  const clearBarcodeSearch = () => {
    setBarcodeQuery(null);
    setProducts([]);
    setSearched(false);
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    for (const chip of activeChips) {
      list = filterByChip(list, chip);
    }
    return list;
  }, [products, activeChips]);

  const groups = useMemo(() => {
    const grouped = barcodeQuery
      ? groupProductsByBarcode(filteredProducts)
      : groupProducts(filteredProducts);
    return sortGroups(grouped, sort, barcodeQuery ? '' : debouncedQuery);
  }, [filteredProducts, sort, debouncedQuery, barcodeQuery]);

  const filterChips = useMemo(() => extractFilterChips(products), [products]);
  const suggestions = useMemo(() => buildSuggestions(products, 8), [products]);
  const showResults = products.length > 0 && !loading;

  const handleAddProduct = useCallback(
    (product: Product) => {
      onAddGrocery(productToGrocery(product));
      addToBasket(product);
      setProducts([]);
      setSearchTerm('');
      setBarcodeQuery(null);
      setActiveChips([]);
      setError(null);
      setSearched(false);
    },
    [onAddGrocery, addToBasket]
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
            loadingLabel={t('search.searching')}
            disableSuggestions={showResults}
            placeholder={t('search.placeholderShort')}
            label={t('search.inputLabel')}
          />
        </Box>
        <BarcodeScanButton onDetected={handleBarcodeDetected} disabled={loading} />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {t('search.homeHint')}
      </Typography>

      {showEmptyGuide && !searched && !loading && !searchTerm.trim() && !barcodeQuery && (
        <Box sx={{ mt: 3, pt: 2.5, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            {t('guide.title')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
              <SearchIcon color="primary" sx={{ mt: 0.25 }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>{t('guide.searchTitle')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('guide.searchText')}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
              <CompareArrowsIcon color="primary" sx={{ mt: 0.25 }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>{t('guide.compareTitle')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('guide.compareText')}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
              <RouteIcon color="primary" sx={{ mt: 0.25 }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>{t('guide.chooseTitle')}</Typography>
                <Typography variant="caption" color="text.secondary">{t('guide.chooseText')}</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 2.5 }}>
            <Typography variant="caption" color="text.secondary">
              {t('guide.try')}
            </Typography>
            {[
              { label: t('guide.milk'), query: 'melk' },
              { label: t('guide.coffee'), query: 'koffie' },
              { label: t('guide.pasta'), query: 'pasta' },
            ].map((example) => (
              <Chip
                key={example.query}
                label={example.label}
                size="small"
                variant="outlined"
                onClick={() => setSearchTerm(example.query)}
              />
            ))}
          </Box>
        </Box>
      )}

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
        <Box role="status" aria-live="polite" sx={{ display: 'flex', alignItems: 'center', mt: 1.5, gap: 1 }}>
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

      {showResults && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography
            role="status"
            aria-live="polite"
            sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
          >
            {t('search.resultsStatus').replace('{count}', String(filteredProducts.length))}
          </Typography>
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
