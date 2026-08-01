import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Stack,
  Chip,
} from '@mui/material';
import GroceryComparison from './components/GroceryComparison';
import ProductSearch from './components/ProductSearch';
import Footer from './components/Footer';
import AppNavBar from './components/AppNavBar';
import { useCountry } from './context/CountryContext';
import { useLanguage } from './context/LanguageContext';
import { useComparisonStore } from './store/comparisonStore';
import { useBasketStore } from './store/basketStore';
import { fetchProduct, fetchStores, StoreInfo } from './api/client';
import { getSupermarketsForCountry } from './services/supermarketService';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Link as RouterLink } from 'react-router-dom';
import { CATEGORIES, categorySlug, getCategoryDisplayName } from './services/categoryService';

const App: React.FC = () => {
  const { country } = useCountry();
  const { t } = useLanguage();
  const storeMarks = getSupermarketsForCountry(country.code);
  const groceries = useComparisonStore((s) => s.items);
  const addGrocery = useComparisonStore((s) => s.add);
  const removeGrocery = useComparisonStore((s) => s.remove);
  const clearComparison = useComparisonStore((s) => s.clear);
  const basketItems = useBasketStore((s) => s.items);
  const addToBasket = useBasketStore((s) => s.add);
  const removeFromBasket = useBasketStore((s) => s.remove);
  const clearBasket = useBasketStore((s) => s.clear);
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSent, setWaitlistSent] = useState(false);
  const [catalogStores, setCatalogStores] = useState<StoreInfo[]>([]);
  const migratedComparisonRef = useRef(false);

  useEffect(() => {
    if (!country.available) return;
    let cancelled = false;
    fetchStores(country.code)
      .then((stores) => {
        if (!cancelled) setCatalogStores(stores);
      })
      .catch(() => {
        if (!cancelled) setCatalogStores([]);
      });
    return () => {
      cancelled = true;
    };
  }, [country.available, country.code]);

  const catalogProductCount = useMemo(
    () => catalogStores.reduce((total, store) => total + (store.productCount ?? 0), 0),
    [catalogStores]
  );
  const catalogFreshness = useMemo(() => {
    const timestamps = catalogStores
      .map((store) => store.latestPriceAt)
      .filter((value): value is string => Boolean(value) && Number.isFinite(Date.parse(value as string)))
      .map((value) => Date.parse(value));
    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps));
  }, [catalogStores]);
  const numberLocale = country.code === 'nl' ? 'nl-NL' : 'en-GB';
  const updatedToday = catalogFreshness
    ? catalogFreshness.toDateString() === new Date().toDateString()
    : false;

  useEffect(() => {
    if (migratedComparisonRef.current || !country.available) return;
    migratedComparisonRef.current = true;

    const basketIds = new Set(basketItems.map((item) => item.product.id));
    const missingProductIds = groceries
      .map((grocery) => grocery.productId)
      .filter((id): id is string => Boolean(id) && !basketIds.has(id as string));

    void Promise.allSettled(
      missingProductIds.map(async (productId) => {
        const product = await fetchProduct(productId, country.code);
        addToBasket(product);
      })
    );
  }, [country.available, country.code, groceries, basketItems, addToBasket]);

  const handleClearAll = () => {
    if (!window.confirm(t('app.clearAllConfirm'))) return;
    clearComparison();
    clearBasket();
  };

  const handleRemoveGrocery = (id: string) => {
    const grocery = groceries.find((item) => item.id === id);
    if (grocery?.productId) removeFromBasket(grocery.productId);
    removeGrocery(id);
  };

  const handleHomeReset = useCallback(() => {
    setSearchResetKey((k) => k + 1);
  }, []);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    const email = waitlistEmail.trim();
    if (!email || !email.includes('@')) return;
    try {
      const key = `compear-waitlist-${country.code}`;
      const prev = JSON.parse(localStorage.getItem(key) || '[]') as string[];
      if (!prev.includes(email)) {
        localStorage.setItem(key, JSON.stringify([...prev, email]));
      }
    } catch {
      /* ignore storage failures */
    }
    setWaitlistSent(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavBar onHomeReset={handleHomeReset} />

      <Container
        maxWidth="lg"
        sx={{
          flex: '1 0 auto',
          pb: 5,
          pt: { xs: 1, md: groceries.length === 0 ? 2 : 0 },
        }}
      >
        {!country.available ? (
          <Box
            className="cp-fade-up"
            sx={{
              maxWidth: 560,
              mx: 'auto',
              textAlign: 'center',
              py: { xs: 4, md: 6 },
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontSize: { xs: '2.4rem', sm: '3.25rem' },
                mb: 1,
                color: 'primary.dark',
              }}
            >
              {t('app.title')}
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
              {t('app.comingSoonHeadline').replace('{country}', country.name)}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: 'auto' }}>
              {t('app.comingSoonBody')}
            </Typography>

            <Stack direction="row" spacing={1.25} justifyContent="center" sx={{ mb: 3.5, flexWrap: 'wrap', rowGap: 1 }}>
              {storeMarks.map((store) => (
                <Avatar
                  key={store.id}
                  src={store.logo}
                  alt={store.name}
                  variant="rounded"
                  sx={{ width: 36, height: 36, bgcolor: 'common.white', border: '1px solid', borderColor: 'divider' }}
                  imgProps={{ loading: 'lazy' }}
                />
              ))}
            </Stack>

            {waitlistSent ? (
              <Typography color="primary.main" fontWeight={700}>
                {t('app.waitlistThanks')}
              </Typography>
            ) : (
              <Box
                component="form"
                onSubmit={handleWaitlist}
                sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 3 }}
              >
                <TextField
                  size="small"
                  type="email"
                  required
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder={t('app.waitlistPlaceholder')}
                  inputProps={{ 'aria-label': t('app.waitlistPlaceholder') }}
                  sx={{ minWidth: 220, bgcolor: 'background.paper' }}
                />
                <Button type="submit" variant="contained">
                  {t('app.waitlistCta')}
                </Button>
              </Box>
            )}

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.25}
              justifyContent="center"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <Button component={RouterLink} to="/nl/" variant="outlined" color="primary">
                {t('app.switchToNetherlands')}
              </Button>
              <Button component={RouterLink} to="/uk/" variant="contained" color="primary">
                {t('app.switchToUnitedKingdom')}
              </Button>
            </Stack>
          </Box>
        ) : (
          <>
            {groceries.length === 0 && (
              <Box
                className="cp-fade-up"
                sx={{
                  textAlign: 'center',
                  mb: { xs: 2.5, md: 3.5 },
                  pt: { xs: 1, md: 2 },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.75rem', sm: '3.75rem', md: '4.25rem' },
                    lineHeight: 1.05,
                    color: 'primary.dark',
                    mb: 1,
                  }}
                >
                  {t('app.title')}
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
                  sx={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontWeight: 500,
                    fontSize: { xs: '1.2rem', sm: '1.45rem' },
                    maxWidth: 520,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  {t('app.heroHeadline')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mb: 2 }}>
                  {t(`app.heroSupport.${country.code}`) || t('app.heroSupport')}
                </Typography>
                {catalogProductCount > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    sx={{ flexWrap: 'wrap', rowGap: 1, mb: 2 }}
                    aria-label={t('app.catalogCoverageLabel')}
                  >
                    <Chip
                      color="primary"
                      variant="outlined"
                      label={t('app.catalogProducts').replace(
                        '{count}',
                        new Intl.NumberFormat(numberLocale).format(catalogProductCount)
                      )}
                      sx={{ bgcolor: 'rgba(255,255,255,0.72)' }}
                    />
                    <Chip
                      color="primary"
                      variant="outlined"
                      label={t('app.catalogStores').replace('{count}', String(catalogStores.length))}
                      sx={{ bgcolor: 'rgba(255,255,255,0.72)' }}
                    />
                    {catalogFreshness && (
                      <Chip
                        color="secondary"
                        variant="outlined"
                        label={
                          updatedToday
                            ? t('app.pricesUpdatedToday')
                            : t('app.pricesUpdatedDate').replace(
                                '{date}',
                                new Intl.DateTimeFormat(numberLocale, {
                                  day: 'numeric',
                                  month: 'short',
                                }).format(catalogFreshness)
                              )
                        }
                        sx={{ bgcolor: 'rgba(255,255,255,0.72)' }}
                      />
                    )}
                  </Stack>
                )}
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  sx={{ flexWrap: 'wrap', rowGap: 1, mb: 0.5 }}
                  aria-label={t('app.storesCovered')}
                >
                  {storeMarks.map((store) => (
                    <Avatar
                      key={store.id}
                      src={store.logo}
                      alt={store.name}
                      variant="rounded"
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'common.white',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                      imgProps={{ loading: 'lazy' }}
                    />
                  ))}
                </Stack>
                <Stack
                  component="nav"
                  direction="row"
                  spacing={0.75}
                  justifyContent="center"
                  aria-label={t('filters.category')}
                  sx={{ flexWrap: 'wrap', rowGap: 0.75, mt: 1.5 }}
                >
                  {CATEGORIES.filter((category) => category !== 'Other').slice(0, 8).map((category) => (
                    <Button
                      key={category}
                      component={RouterLink}
                      to={`/${country.code}/categories/${categorySlug(category)}`}
                      size="small"
                      variant="text"
                      sx={{ minHeight: 40 }}
                    >
                      {country.code === 'nl' ? getCategoryDisplayName(category) : category}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}

            <Box
              className="cp-fade-up-delay"
              sx={{
                maxWidth: 960,
                mx: 'auto',
                mb: 3,
                ...(groceries.length > 0
                  ? {
                      p: { xs: 2, sm: 2.5 },
                      bgcolor: 'rgba(255,255,255,0.72)',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }
                  : {}),
              }}
            >
              {groceries.length > 0 && (
                <>
                  <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
                    {t('app.compareHeading')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t(`app.description.${country.code}`) || t('app.description').replace('{country}', country.name)}
                  </Typography>
                </>
              )}
              <ProductSearch
                key={searchResetKey}
                onAddGrocery={addGrocery}
                onResetComparison={clearComparison}
                showEmptyGuide={groceries.length === 0}
              />
            </Box>

            {groceries.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  color="error"
                  variant="outlined"
                  size="small"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleClearAll}
                >
                  {t('app.clearAll')}
                </Button>
              </Box>
            )}

            <GroceryComparison
              groceries={groceries}
              onRemoveGrocery={handleRemoveGrocery}
            />
          </>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default App;
