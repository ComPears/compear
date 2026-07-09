import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { fetchProducts, fetchStores, Product, StoreInfo } from '../api/client';
import { useCountry } from '../context/CountryContext';
import { useLanguage } from '../context/LanguageContext';
import { useComparisonStore } from '../store/comparisonStore';
import { productToGrocery } from '../utils/groceryMapper';
import AppNavBar from '../components/AppNavBar';
import { ProductSearchBar } from '../components/ProductSearchBar';
import { ProductSortBar } from '../components/ProductSortBar';
import { FilterChipBar } from '../components/FilterChipBar';
import { ProductGroupList } from '../components/ProductGroupList';
import { BarcodeScanButton } from '../components/BarcodeScanner';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  SortMode,
  buildSuggestions,
  filterBySearch,
  groupProducts,
  groupProductsByBarcode,
  sortGroups,
} from '../utils/productGrouping';
import { extractFilterChips, filterByChip } from '../utils/filterChips';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { country } = useCountry();
  const { t } = useLanguage();
  const addToComparison = useComparisonStore((s) => s.add);
  const clearComparison = useComparisonStore((s) => s.clear);
  const comparisonCount = useComparisonStore((s) => s.items.length);
  const [query, setQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [dealsOnly, setDealsOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>('relevance');
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestionPool, setSuggestionPool] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [barcodeQuery, setBarcodeQuery] = useState<string | null>(null);
  const [addedSnackbar, setAddedSnackbar] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    let cancelled = false;
    fetchStores().then((data) => {
      if (!cancelled) setStores(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!country.available) return;
    if (barcodeQuery) return;

    const q = debouncedQuery.trim();
    if (q.length < 2 && !storeFilter) {
      setProducts([]);
      setSuggestionPool([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    const params: { search?: string; store?: string } = {};
    if (q.length >= 2) params.search = q;
    if (storeFilter) params.store = storeFilter;

    fetchProducts(params)
      .then((data) => {
        let list = data;
        if (dealsOnly) {
          list = list.filter(
            (p) => p.promoType != null && p.effectivePrice < p.originalPrice
          );
        }
        setProducts(list);
        setSuggestionPool(list);
      })
      .catch(() => {
        setProducts([]);
        setSuggestionPool([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, storeFilter, dealsOnly, country.available, barcodeQuery]);

  const handleBarcodeDetected = useCallback(
    (barcode: string) => {
      clearComparison();
      setBarcodeQuery(barcode);
      setQuery('');
      setActiveChips([]);
      setSearched(true);
      setLoading(true);

      const params: { barcode: string; store?: string } = { barcode };
      if (storeFilter) params.store = storeFilter;

      fetchProducts(params)
        .then((data) => {
          let list = data;
          if (dealsOnly) {
            list = list.filter(
              (p) => p.promoType != null && p.effectivePrice < p.originalPrice
            );
          }
          setProducts(list);
          setSuggestionPool(list);
        })
        .catch(() => {
          setProducts([]);
          setSuggestionPool([]);
        })
        .finally(() => setLoading(false));
    },
    [storeFilter, dealsOnly, clearComparison]
  );

  const clearBarcodeSearch = () => {
    setBarcodeQuery(null);
    setProducts([]);
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
    if (debouncedQuery.trim().length >= 2) {
      list = filterBySearch(list, debouncedQuery);
    }
    for (const chip of activeChips) {
      list = filterByChip(list, chip);
    }
    return list;
  }, [products, debouncedQuery, activeChips]);

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
      setAddedSnackbar(true);
    },
    [addToComparison]
  );

  const toggleChip = (chip: string) => {
    setActiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const showResults = searched && !loading && products.length > 0;

  return (
    <>
      <AppNavBar />
      <Container maxWidth="lg" sx={{ py: 3, bgcolor: 'background.default' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {t('search.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('search.pageHint')}
        </Typography>

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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <ProductSearchBar
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  if (barcodeQuery) setBarcodeQuery(null);
                }}
                suggestions={suggestions}
                loading={loading}
                disableSuggestions={showResults}
                placeholder={t('search.placeholderShort')}
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

          {searched && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ProductSortBar value={sort} onChange={setSort} />
              <FilterChipBar chips={filterChips} active={activeChips} onToggle={toggleChip} />
              <Chip
                size="small"
                variant="outlined"
                label={t('search.resultCount')
                  .replace('{groups}', String(groups.length))
                  .replace('{results}', String(filteredProducts.length))}
              />
            </Box>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && !searched && (
          <Typography color="text.secondary">{t('search.emptyPrompt')}</Typography>
        )}

        {!loading && searched && (
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
    </>
  );
};
