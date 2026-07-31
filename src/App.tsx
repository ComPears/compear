import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Stack,
} from '@mui/material';
import GroceryComparison from './components/GroceryComparison';
import ProductSearch from './components/ProductSearch';
import Footer from './components/Footer';
import AppNavBar from './components/AppNavBar';
import { useCountry } from './context/CountryContext';
import { useLanguage } from './context/LanguageContext';
import { useComparisonStore } from './store/comparisonStore';
import { useBasketStore } from './store/basketStore';
import { fetchProduct } from './api/client';
import { supermarkets } from './services/supermarketService';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const App: React.FC = () => {
  const { country, setCountry } = useCountry();
  const { t } = useLanguage();
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
  const migratedComparisonRef = useRef(false);

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
              {supermarkets.map((store) => (
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

            <Button variant="outlined" color="primary" onClick={() => setCountry('nl')}>
              {t('app.switchToNetherlands')}
            </Button>
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
                  {t('app.heroSupport')}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  sx={{ flexWrap: 'wrap', rowGap: 1, mb: 0.5 }}
                  aria-label={t('app.storesCovered')}
                >
                  {supermarkets.map((store) => (
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
