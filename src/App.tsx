import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CheapestDialog from './components/CheapestDialog';
import AppNavBar from './components/AppNavBar';
import { Grocery, GroceryWithPrices } from './types';
import { useCountry } from './context/CountryContext';
import { useLanguage } from './context/LanguageContext';
import { useBasketStore } from './store/basketStore';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { country, setCountry } = useCountry();
  const { t } = useLanguage();
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [groceriesWithPrices, setGroceriesWithPrices] = useState<GroceryWithPrices[]>([]);
  const [triggerCheapestDialog, setTriggerCheapestDialog] = useState(false);
  const [searchResetKey, setSearchResetKey] = useState(0);

  const handleAddGrocery = (newGrocery: Grocery) => {
    setGroceries((prevGroceries) => [...prevGroceries, newGrocery]);
  };

  const handleRemoveGrocery = (id: string) => {
    setGroceries((prevGroceries) => prevGroceries.filter((grocery) => grocery.id !== id));
  };

  const handleClearAll = () => {
    setGroceries([]);
    useBasketStore.getState().clear();
  };

  const handleCartClick = () => {
    if (groceries.length > 0) {
      setTriggerCheapestDialog(true);
    } else {
      navigate(`/${country.code}/basket`);
    }
  };

  const handleCheapestDialogHandled = useCallback(() => {
    setTriggerCheapestDialog(false);
  }, []);

  const handleHomeReset = useCallback(() => {
    setSearchResetKey((k) => k + 1);
    setGroceries([]);
    useBasketStore.getState().clear();
  }, []);

  const handleGroceriesWithPricesChange = (newGroceriesWithPrices: GroceryWithPrices[]) => {
    setGroceriesWithPrices(newGroceriesWithPrices);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppNavBar
        comparisonCount={groceries.length}
        onCartClick={handleCartClick}
        onClearAll={groceries.length > 0 ? handleClearAll : undefined}
        onHomeReset={handleHomeReset}
      />

      <Container maxWidth="lg" sx={{ flex: '1 0 auto', pb: 4 }}>
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
            <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3 }}>
              <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
                {t('app.compareHeading')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                {t(`app.description.${country.code}`) || t('app.description').replace('{country}', country.name)}
              </Typography>
              <ProductSearch
                key={searchResetKey}
                onAddGrocery={handleAddGrocery}
                onResetComparison={() => setGroceries([])}
              />
            </Paper>

            <GroceryComparison
              groceries={groceries}
              onRemoveGrocery={handleRemoveGrocery}
              onGroceriesWithPricesChange={handleGroceriesWithPricesChange}
            />
          </>
        )}
      </Container>

      <Footer />

      <CheapestDialog
        open={triggerCheapestDialog}
        onClose={handleCheapestDialogHandled}
        groceries={groceriesWithPrices}
      />
    </Box>
  );
};

export default App;
