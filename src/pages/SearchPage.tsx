import React, { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import { fetchProducts, fetchStores, Product, StoreInfo } from '../api/client';
import { useCountry } from '../context/CountryContext';
import { PagesNavBar } from '../components/PagesNavBar';
import { ProductSearchBar } from '../components/ProductSearchBar';
import { ProductSortBar } from '../components/ProductSortBar';
import { FilterChipBar } from '../components/FilterChipBar';
import { ProductGroupList } from '../components/ProductGroupList';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  SortMode,
  buildSuggestions,
  extractFilterChips,
  filterByChip,
  filterBySearch,
  groupProducts,
  sortGroups,
} from '../utils/productGrouping';

export const SearchPage: React.FC = () => {
  const { country } = useCountry();
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
  }, [debouncedQuery, storeFilter, dealsOnly, country.available]);

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

  const groups = useMemo(
    () => sortGroups(groupProducts(filteredProducts), sort, debouncedQuery),
    [filteredProducts, sort, debouncedQuery]
  );

  const toggleChip = (chip: string) => {
    setActiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  return (
    <>
      <PagesNavBar />
      <Container maxWidth="lg" sx={{ py: 3, bgcolor: 'background.default' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Zoek producten
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Vergelijk prijzen per product — niet eindeloos scrollen door losse kaarten.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <ProductSearchBar
            value={query}
            onChange={setQuery}
            suggestions={suggestions}
            loading={loading}
            placeholder="Bijv. melk, eieren, pasta..."
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Winkel</InputLabel>
              <Select
                value={storeFilter}
                label="Winkel"
                onChange={(e) => setStoreFilter(e.target.value)}
              >
                <MenuItem value="">Alle winkels</MenuItem>
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
              label="Alleen aanbiedingen"
            />
          </Box>

          {searched && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ProductSortBar value={sort} onChange={setSort} />
              <FilterChipBar chips={filterChips} active={activeChips} onToggle={toggleChip} />
              <Chip
                size="small"
                variant="outlined"
                label={`${groups.length} productgroepen · ${filteredProducts.length} resultaten`}
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
          <Typography color="text.secondary">
            Typ minstens 2 letters om producten te vergelijken tussen winkels.
          </Typography>
        )}

        {!loading && searched && (
          <ProductGroupList
            groups={groups}
            emptyMessage={
              debouncedQuery.trim().length < 2 && !storeFilter
                ? 'Typ minstens 2 letters om te zoeken.'
                : 'Geen producten gevonden. Probeer een andere zoekterm of filter.'
            }
          />
        )}
      </Container>
    </>
  );
};
