import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  Paper, 
  Button, 
  Badge, 
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import GroceryComparison from './components/GroceryComparison';
import ProductSearch from './components/ProductSearch';
import Footer from './components/Footer';
import { Grocery } from './types';
import { useCountry, CountryCode, countries } from './context/CountryContext';
import { useLanguage, LanguageCode } from './context/LanguageContext';

const App: React.FC = () => {
  const { country, setCountry } = useCountry();
  const { language, setLanguage, t } = useLanguage();
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [triggerCheapestDialog, setTriggerCheapestDialog] = useState(false);

  // Effect to update URL when country changes
  useEffect(() => {
    // Update the URL to match the selected country
    if (!window.location.pathname.startsWith(`/${country.code}`)) {
      window.history.pushState(null, '', `/${country.code}`);
    }
  }, [country.code]);

  const handleAddGrocery = (newGrocery: Grocery) => {
    setGroceries(prevGroceries => [...prevGroceries, newGrocery]);
  };

  const handleRemoveGrocery = (id: string) => {
    setGroceries(prevGroceries => prevGroceries.filter(grocery => grocery.id !== id));
  };

  const handleClearAll = () => {
    setGroceries([]);
  };

  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    setCountry(event.target.value as CountryCode);
  };
  
  const handleLanguageChange = () => {
    // Toggle between English and the country's native language
    const newLanguage: LanguageCode = language === 'en' ? 
      (country.code as LanguageCode) : 'en';
    
    // Only switch if the language is supported
    if (['en', 'nl', 'de'].includes(newLanguage)) {
      setLanguage(newLanguage);
    }
  };

  const handleCartClick = () => {
    if (groceries.length > 0) {
      setTriggerCheapestDialog(true);
    }
  };

  const handleCheapestDialogHandled = useCallback(() => {
    setTriggerCheapestDialog(false);
  }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <Box display="flex" alignItems="center">
            <FormControl sx={{ minWidth: 120, mr: 2 }} size="small">
              <Select
                value={country.code}
                onChange={handleCountryChange}
                displayEmpty
                sx={{ 
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '.MuiSvgIcon-root': { color: 'white' }
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LanguageIcon sx={{ mr: 1 }} />
                    {countries.find(c => c.code === selected)?.name || 'Country'}
                  </Box>
                )}
              >
                {countries.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title={language === 'en' ? 'Switch to local language' : 'Switch to English'}>
              <IconButton
                color="inherit"
                onClick={handleLanguageChange}
                sx={{ mr: 2 }}
              >
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', mr: 2 }} />
            
            {country.available && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleCartClick}
                  disabled={groceries.length === 0}
                  sx={{ mr: 2 }}
                >
                  <Badge badgeContent={groceries.length} color="secondary">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
                {groceries.length > 0 && (
                  <Button 
                    color="inherit" 
                    startIcon={<DeleteSweepIcon />} 
                    onClick={handleClearAll}
                  >
                    {t('app.clearAll')}
                  </Button>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ flex: '1 0 auto' }}>
        {!country.available ? (
          <Paper elevation={3} sx={{ p: 5, mb: 4, textAlign: 'center' }}>
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
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" component="h1" gutterBottom>
                {t('app.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {t('app.description').replace('{country}', country.name)}
              </Typography>
              
              <ProductSearch onAddGrocery={handleAddGrocery} />
            </Paper>
            
            <GroceryComparison 
              groceries={groceries} 
              onRemoveGrocery={handleRemoveGrocery}
              openCheapestDialog={triggerCheapestDialog}
              onCheapestDialogHandled={handleCheapestDialogHandled}
            />
          </>
        )}
      </Container>
      
      <Footer />
    </Box>
  );
};

export default App;
