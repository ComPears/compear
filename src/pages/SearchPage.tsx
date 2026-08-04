import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Button,
  Skeleton,
  Collapse,
  Paper,
} from '@mui/material';
import { fetchProducts, fetchStores, Product, StoreInfo, ApiCountry } from '../api/client';
import { fetchProductsByBarcode, isAbortError } from '../utils/barcodeSearch';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { useComparisonStore } from '../store/comparisonStore';
import { useBasketStore } from '../store/basketStore';
import { productToGrocery } from '../utils/groceryMapper';
import AppNavBar from '../components/AppNavBar';
import Footer from '../components/Footer';
import { ProductSearchBar } from '../components/ProductSearchBar';
import { ProductSortBar } from '../components/ProductSortBar';
import { FilterChipBar } from '../components/FilterChipBar';
import { ProductGroupList } from '../components/ProductGroupList';
import { BarcodeScanButton } from '../components/BarcodeScanner';
import { DietaryFilterBar } from '../components/DietaryFilterBar';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  SortMode,
  buildSuggestions,
  groupProducts,
  groupProductsByBarcode,
  sortGroups,
} from '../utils/productGrouping';
import { extractFilterChips, filterByChip } from '../utils/filterChips';

const SEARCH_PAGE_SIZE = 30;

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { country } = useCountry();
  const { t } = useLanguage();
  const addToComparison = useComparisonStore((s) => s.add);
  const clearComparison = useComparisonStore((s) => s.clear);
  const comparisonCount = useComparisonStore((s) => s.items.length);
  const addToBasket = useBasketStore((s) => s.add);
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [storeFilter, setStoreFilter] = useState('');
  const [dealsOnly, setDealsOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>('relevance');
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestionPool, setSuggestionPool] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [barcodeQuery, setBarcodeQuery] = useState<string | null>(null);
  const [dietaryLabels, setDietaryLabels] = useState<string[]>([]);
  const [addedSnackbar, setAddedSnackbar] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const value = debouncedQuery.trim();
    if (value) next.set('q', value);
    else next.delete('q');
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [debouncedQuery, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    fetchStores(country.code).then((data) => {
      if (!cancelled) setStores(data);
    });
    return () => {
      cancelled = true;
    };
  }, [country.code]);

  useEffect(() => {
    if (!country.available) return;
    if (barcodeQuery) return;

    const q = debouncedQuery.trim();
    if (q.length < 2 && !storeFilter) {
      setProducts([]);
      setSuggestionPool([]);
      setSearched(false);
      setLoading(false);
      setHasMore(false);
      setSearchError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setSearched(true);
    setSearchError(null);
    const params: { search?: string; store?: string; labels?: string; limit?: number } = {
      limit: SEARCH_PAGE_SIZE,
    };
    if (q.length >= 2) params.search = q;
    if (storeFilter) params.store = storeFilter;
    if (dietaryLabels.length > 0) params.labels = dietaryLabels.join(',');

    fetchProducts(params, country.code as ApiCountry, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setProducts(data);
        setSuggestionPool(data);
        setHasMore(data.length === SEARCH_PAGE_SIZE);
      })
      .catch((err) => {
        if (controller.signal.aborted || isAbortError(err)) return;
        setProducts([]);
        setSuggestionPool([]);
        setHasMore(false);
        setSearchError(t('error.searchFailed'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, storeFilter, country.available, country.code, barcodeQuery, dietaryLabels, t]);

  const handleBarcodeDetected = useCallback(
    (barcode: string) => {
      clearComparison();
      setQuery('');
      setActiveChips([]);
      setSearched(true);
      setLoading(true);
      setSearchError(null);

      fetchProductsByBarcode(barcode, country.code as ApiCountry)
        .then(({ products: data, normalized, invalid }) => {
          setBarcodeQuery(normalized ?? barcode);
          setProducts(data);
          setSuggestionPool(data);
          setHasMore(false);
          if (invalid) {
            setSearchError(t('search.barcodeInvalid'));
          } else if (data.length === 0) {
            setSearchError(
              t('search.barcodeNotFound').replace('{barcode}', normalized ?? barcode)
            );
          }
        })
        .catch((err) => {
          if (isAbortError(err)) return;
          setProducts([]);
          setSuggestionPool([]);
          setHasMore(false);
          setSearchError(t('error.searchFailed'));
        })
        .finally(() => setLoading(false));
    },
    [clearComparison, country.code, t]
  );

  const clearBarcodeSearch = () => {
    setBarcodeQuery(null);
    setProducts([]);
    setHasMore(false);
    setSearched(false);
  };

  useEffect(() => {
    setActiveChips([]);
  }, [debouncedQuery, storeFilter, dealsOnly]);

  const suggestions = useMemo(
    () => buildSuggestions(suggestionPool, 8),
    [suggestionPool]
  );

  const filteredProducts = useMemo(() => {
    let list = products;
    if (dealsOnly) {
      list = list.filter(
        (product) =>
          product.promoType != null && product.effectivePrice < product.originalPrice
      );
    }
    for (const chip of activeChips) {
      list = filterByChip(list, chip);
    }
    return list;
  }, [products, dealsOnly, activeChips]);

  const filterChips = useMemo(() => extractFilterChips(products), [products]);

  const groups = useMemo(() => {
    const grouped = barcodeQuery
      ? groupProductsByBarcode(filteredProducts)
      : groupProducts(filteredProducts);
    return sortGroups(grouped, sort, barcodeQuery ? '' : debouncedQuery);
  }, [filteredProducts, sort, debouncedQuery, barcodeQuery]);

  const handleAddProduct = useCallback(
    (product: Product) => {
      addToComparison(productToGrocery(product));
      addToBasket(product);
      setAddedSnackbar(true);
    },
    [addToComparison, addToBasket]
  );

  const loadMore = useCallback(async () => {
    const q = debouncedQuery.trim();
    if (loadingMore || !hasMore || barcodeQuery) return;

    const params: {
      search?: string;
      store?: string;
      labels?: string;
      limit: number;
      offset: number;
    } = {
      limit: SEARCH_PAGE_SIZE,
      offset: products.length,
    };
    if (q.length >= 2) params.search = q;
    if (storeFilter) params.store = storeFilter;
    if (dietaryLabels.length > 0) params.labels = dietaryLabels.join(',');

    setLoadingMore(true);
    try {
      const next = await fetchProducts(params, country.code as ApiCountry);
      setProducts((current) => {
        const seen = new Set(current.map((product) => product.id));
        return [...current, ...next.filter((product) => !seen.has(product.id))];
      });
      setSuggestionPool((current) => [...current, ...next]);
      setHasMore(next.length === SEARCH_PAGE_SIZE);
    } catch {
      setSearchError(t('error.searchFailed'));
    } finally {
      setLoadingMore(false);
    }
  }, [
    barcodeQuery,
    country.code,
    debouncedQuery,
    dietaryLabels,
    hasMore,
    loadingMore,
    products.length,
    storeFilter,
    t,
  ]);

  const toggleChip = (chip: string) => {
    setActiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const showResults = searched && !loading && filteredProducts.length > 0;
  const catalogProductCount = useMemo(
    () => stores.reduce((total, store) => total + (store.productCount ?? 0), 0),
    [stores]
  );
  const numberLocale =
    country.code === 'nl' ? 'nl-NL' : country.code === 'de' ? 'de-DE' : 'en-GB';

  const exampleQueries =
    country.code === 'uk'
      ? [
          { label: t('guide.milk'), query: 'milk' },
          { label: t('guide.coffee'), query: 'coffee' },
          { label: t('guide.pasta'), query: 'pasta' },
        ]
      : country.code === 'de'
        ? [
            { label: t('guide.milk'), query: 'Milch' },
            { label: 'Brot', query: 'Brot' },
            { label: t('guide.coffee'), query: 'Kaffee' },
          ]
        : [
            { label: t('guide.milk'), query: 'melk' },
            { label: t('guide.coffee'), query: 'koffie' },
            { label: t('guide.pasta'), query: 'pasta' },
          ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavBar />
      <Container component="main" maxWidth="lg" sx={{ flex: '1 0 auto', py: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', mb: 2.5 }}>
          <Box>
            <Typography
              component="h1"
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 650, color: 'primary.dark' }}
            >
              {t('search.browseTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
              {t('search.browseHint')}
            </Typography>
          </Box>
          {catalogProductCount > 0 && (
            <Paper
              variant="outlined"
              sx={{ px: 2, py: 1.25, bgcolor: 'rgba(255,255,255,0.76)', minWidth: { xs: '100%', sm: 'auto' } }}
              aria-label={t('app.catalogCoverageLabel')}
            >
              <Typography variant="body2" fontWeight={750} color="primary.dark">
                {t('search.catalogCoverage')
                  .replace('{products}', new Intl.NumberFormat(numberLocale).format(catalogProductCount))
                  .replace('{stores}', String(stores.length))}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('search.catalogCoverageHint')}
              </Typography>
            </Paper>
          )}
        </Box>

        {comparisonCount > 0 && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate(`/${country.code}`)}>
                {t('search.viewList')}
              </Button>
            }
          >
            {t('search.listCount').replace('{count}', String(comparisonCount))}
          </Alert>
        )}

        <Paper
          variant="outlined"
          sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5, p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(255,255,255,0.82)' }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'stretch' }}>
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <ProductSearchBar
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  if (barcodeQuery) setBarcodeQuery(null);
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

          {barcodeQuery && (
            <Chip
              label={t('search.barcodeChip').replace('{barcode}', barcodeQuery)}
              onDelete={clearBarcodeSearch}
              color="primary"
              variant="outlined"
            />
          )}

          <Box>
            <Button size="small" onClick={() => setFiltersOpen((o) => !o)} sx={{ px: 0 }}>
              {filtersOpen ? t('search.hideFilters') : t('search.showFilters')}
            </Button>
            <Collapse in={filtersOpen || searched}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                <DietaryFilterBar selected={dietaryLabels} onChange={setDietaryLabels} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>{t('search.storeFilter')}</InputLabel>
                    <Select
                      value={storeFilter}
                      label={t('search.storeFilter')}
                      onChange={(e) => setStoreFilter(e.target.value)}
                    >
                      <MenuItem value="">{t('search.allStores')}</MenuItem>
                      {stores.map((s) => (
                        <MenuItem key={s.id} value={s.slug}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={dealsOnly}
                        onChange={(e) => setDealsOnly(e.target.checked)}
                      />
                    }
                    label={t('search.dealsOnly')}
                  />
                </Box>
              </Box>
            </Collapse>
          </Box>

          {searched && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Typography
                role="status"
                aria-live="polite"
                sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
              >
                {t('search.resultsStatus').replace('{count}', String(filteredProducts.length))}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <ProductSortBar value={sort} onChange={setSort} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={t('search.resultCount')
                    .replace('{groups}', String(groups.length))
                    .replace('{results}', String(filteredProducts.length))}
                />
              </Box>
              {filterChips.length > 0 && (
                <FilterChipBar chips={filterChips} active={activeChips} onToggle={toggleChip} />
              )}
            </Box>
          )}
        </Paper>

        {loading && (
          <Box role="status" aria-live="polite" aria-label={t('search.searching')} sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary" className="cp-skeleton-pulse">
                {t('search.searching')}
              </Typography>
            </Box>
            {[0, 1, 2, 3].map((i) => (
              <Box key={i} sx={{ mb: 1.5 }}>
                <Skeleton variant="text" width="50%" height={28} />
                <Box sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
                  <Skeleton variant="rounded" width={90} height={32} />
                  <Skeleton variant="rounded" width={90} height={32} />
                  <Skeleton variant="rounded" width={90} height={32} />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {!loading && !searched && (
          <Box className="cp-fade-up" sx={{ py: 2 }}>
            <Typography color="text.secondary" sx={{ mb: 1.5 }}>
              {t('search.emptyPrompt')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('guide.try')}
              </Typography>
              {exampleQueries.map((example) => (
                <Chip
                  key={example.query}
                  label={example.label}
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => setQuery(example.query)}
                />
              ))}
            </Box>
          </Box>
        )}

        {!loading && searchError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {searchError}
          </Alert>
        )}

        {!loading && searched && (
          <>
            <ProductGroupList
              groups={groups}
              onAddProduct={handleAddProduct}
              addButtonLabel={t('search.addButton')}
              emptyMessage={
                barcodeQuery
                  ? t('search.barcodeNotFound').replace('{barcode}', barcodeQuery)
                  : debouncedQuery.trim().length < 2 && !storeFilter
                    ? t('error.minCharacters')
                    : t('search.noResults')
              }
            />
            {hasMore && !barcodeQuery && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="outlined" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? t('search.loadingMore') : t('search.loadMore')}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>

      <Snackbar
        open={addedSnackbar}
        autoHideDuration={4000}
        onClose={() => setAddedSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setAddedSnackbar(false)}
          action={
            <Button color="inherit" size="small" onClick={() => navigate(`/${country.code}`)}>
              {t('search.viewList')}
            </Button>
          }
        >
          {t('search.addedToList')}
        </Alert>
      </Snackbar>
      <Footer />
    </Box>
  );
};
