import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
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
  const migratedComparisonRef = useRef(false);

  // Migrate products saved before comparison items and basket items were unified.
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppNavBar onHomeReset={handleHomeReset} />

      <Container
        maxWidth="lg"
        sx={{
          flex: '1 0 auto',
          pb: 4,
          pt: { xs: 0, md: groceries.length === 0 ? 4 : 0 },
          transition: 'padding-top 180ms ease',
        }}
      >
        {!country.available ? (
          <Paper elevation={0} sx={{ p: 5, mb: 4, textAlign: 'center', borderRadius: 3 }} variant="outlined">
            <Typography variant="h4" gutterBottom>
              {t('app.comingSoon')}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('app.weWillBeAvailable').replace('{country}', country.name)}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 3 }}>
              {t('app.currentlyOnlyNetherlandsSupported')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCountry('nl')}
              sx={{ mt: 2 }}
            >
              {t('app.switchToNetherlands')}
            </Button>
          </Paper>
        ) : (
          <>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3, maxWidth: 960, mx: 'auto' }}
            >
              <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
                {t('app.compareHeading')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                {t(`app.description.${country.code}`) || t('app.description').replace('{country}', country.name)}
              </Typography>
              <ProductSearch
                key={searchResetKey}
                onAddGrocery={addGrocery}
                onResetComparison={clearComparison}
                showEmptyGuide={groceries.length === 0}
              />
            </Paper>

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
