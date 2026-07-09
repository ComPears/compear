import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { fetchDeals, fetchDealsDigest, Product, DealsDigest } from '../api/client';
import { useCountry } from '../context/CountryContext';
import AppNavBar from '../components/AppNavBar';
import { ProductSearchBar } from '../components/ProductSearchBar';
import { ProductSortBar } from '../components/ProductSortBar';
import { FilterChipBar } from '../components/FilterChipBar';
import { ProductGroupList } from '../components/ProductGroupList';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ProductCategory, CATEGORIES, DEAL_CATEGORY_LABELS, filterByCategory } from '../services/categoryService';
import {
  SortMode,
  buildSuggestions,
  dedupeDealsByProduct,
  filterBySearch,
  groupProducts,
  sortGroups,
} from '../utils/productGrouping';
import { extractFilterChips, filterByChip } from '../utils/filterChips';

export const DealsPage: React.FC = () => {
  const { country } = useCountry();
  const [allDeals, setAllDeals] = useState<Product[]>([]);
  const [digest, setDigest] = useState<DealsDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'All'>('All');
  const [dedupe, setDedupe] = useState(true);
  const [sort, setSort] = useState<SortMode>('discount');
  const [activeChips, setActiveChips] = useState<string[]>([]);

  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    Promise.all([fetchDeals(), fetchDealsDigest()])
      .then(([deals, weeklyDigest]) => {
        setAllDeals(deals);
        setDigest(weeklyDigest);
      })
      .catch(() => {
        setAllDeals([]);
        setDigest(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setActiveChips([]);
  }, [debouncedQuery, storeFilter, category, dedupe]);

  const storeOptions = useMemo(() => {
    const stores = new Set(allDeals.map((d) => d.store));
    return Array.from(stores).sort();
  }, [allDeals]);

  const filteredDeals = useMemo(() => {
    let list = allDeals;
    if (debouncedQuery.trim().length >= 2) {
      list = filterBySearch(list, debouncedQuery);
    }
    if (storeFilter) {
      list = list.filter((d) => d.store === storeFilter);
    }
    list = filterByCategory(list, category);
    for (const chip of activeChips) {
      list = filterByChip(list, chip);
    }
    if (dedupe) {
      list = dedupeDealsByProduct(list);
    }
    return list;
  }, [allDeals, debouncedQuery, storeFilter, category, activeChips, dedupe]);

  const suggestions = useMemo(
    () =>
      buildSuggestions(
        debouncedQuery.trim().length >= 2
          ? filterBySearch(allDeals, debouncedQuery)
          : allDeals.slice(0, 50),
        8
      ),
    [allDeals, debouncedQuery]
  );

  const filterChips = useMemo(() => extractFilterChips(filteredDeals), [filteredDeals]);

  const groups = useMemo(
    () => sortGroups(groupProducts(filteredDeals), sort, debouncedQuery),
    [filteredDeals, sort, debouncedQuery]
  );

  const formatPrice = (n: number) => `€${n.toFixed(2)}`;

  const toggleChip = (chip: string) => {
    setActiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const showResults = debouncedQuery.trim().length >= 2 || storeFilter || category !== 'All';

  return (
    <>
      <AppNavBar />
      <Container maxWidth="lg" sx={{ py: 3, bgcolor: 'background.default' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Aanbiedingen
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Zoek een product of kies een winkel/categorie — geen eindeloze lijst van 4.000+ deals.
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && digest && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Week {digest.weekLabel} — Overzicht
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Totaal aanbiedingen
                </Typography>
                <Typography variant="h5">{digest.totalDeals}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Mogelijke besparing
                </Typography>
                <Typography variant="h5" color="primary">
                  {formatPrice(digest.totalPotentialSavings)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Winkels met deals
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {Object.entries(digest.byStore).map(([store, count]) => (
                    <Chip
                      key={store}
                      size="small"
                      label={`${store}: ${count}`}
                      color={storeFilter === store ? 'primary' : 'default'}
                      variant={storeFilter === store ? 'filled' : 'outlined'}
                      onClick={() =>
                        setStoreFilter((prev) => (prev === store ? '' : store))
                      }
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>

            {digest.topSavings.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Topbesparingen deze week
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {digest.topSavings.slice(0, 5).map((deal) => (
                    <Box
                      key={deal.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {deal.productName} · {deal.store}
                      </Typography>
                      <Chip
                        size="small"
                        color="success"
                        label={`Bespaar ${formatPrice(deal.savings)}`}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {!loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <ProductSearchBar
              value={query}
              onChange={setQuery}
              suggestions={suggestions}
              placeholder="Zoek aanbieding, bijv. melk, koffie..."
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Winkel:
              </Typography>
              <Chip
                size="small"
                label="Alle"
                color={storeFilter === '' ? 'primary' : 'default'}
                variant={storeFilter === '' ? 'filled' : 'outlined'}
                onClick={() => setStoreFilter('')}
              />
              {storeOptions.map((store) => (
                <Chip
                  key={store}
                  size="small"
                  label={store}
                  color={storeFilter === store ? 'primary' : 'default'}
                  variant={storeFilter === store ? 'filled' : 'outlined'}
                  onClick={() => setStoreFilter(store)}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Categorie:
              </Typography>
              {(['All', ...CATEGORIES] as const).map((cat) => (
                <Chip
                  key={cat}
                  size="small"
                  label={DEAL_CATEGORY_LABELS[cat]}
                  color={category === cat ? 'primary' : 'default'}
                  variant={category === cat ? 'filled' : 'outlined'}
                  onClick={() => setCategory(cat)}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={dedupe ? 'best' : 'all'}
                onChange={(_e, value: 'best' | 'all' | null) => {
                  if (value) setDedupe(value === 'best');
                }}
              >
                <ToggleButton value="best">Beste deal per product</ToggleButton>
                <ToggleButton value="all">Alle aanbiedingen</ToggleButton>
              </ToggleButtonGroup>
              <ProductSortBar value={sort} onChange={setSort} showDiscount />
            </Box>

            <FilterChipBar chips={filterChips} active={activeChips} onToggle={toggleChip} />

            {showResults && (
              <Chip
                size="small"
                variant="outlined"
                label={`${groups.length} productgroepen · ${filteredDeals.length} deals`}
              />
            )}
          </Box>
        )}

        {!loading && !showResults && (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Zoek een product of kies een winkel/categorie om aanbiedingen te vergelijken.
            </Typography>
          </Paper>
        )}

        {!loading && showResults && (
          <ProductGroupList
            groups={groups}
            showDeals
            emptyMessage="Geen aanbiedingen voor deze zoekopdracht. Probeer een andere term of filter."
          />
        )}
      </Container>
    </>
  );
};
