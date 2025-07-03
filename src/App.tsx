import React, { useState, useCallback } from 'react';
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
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GroceryComparison from './components/GroceryComparison';
import ProductSearch from './components/ProductSearch';
import Footer from './components/Footer';
import SuggestionDialog from './components/SuggestionDialog';
import CheapestDialog from './components/CheapestDialog';
import { Grocery, GroceryWithPrices } from './types';
import { useCountry, CountryCode, countries } from './context/CountryContext';
import { useLanguage, LanguageCode } from './context/LanguageContext';
import { useTheme, useMediaQuery } from '@mui/material';

const App: React.FC = () => {
  const { country, setCountry } = useCountry();
  const { language, setLanguage, t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Use 'md' for better mobile experience
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [groceriesWithPrices, setGroceriesWithPrices] = useState<GroceryWithPrices[]>([]);
  const [triggerCheapestDialog, setTriggerCheapestDialog] = useState(false);
  const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);

  // Note: URL management is handled by AppRouter.tsx
  // No need to manage URL changes here to avoid conflicts

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

  const handleSuggestionClick = () => {
    setSuggestionDialogOpen(true);
  };

  const handleSuggestionDialogClose = () => {
    setSuggestionDialogOpen(false);
  };

  const handleGroceriesWithPricesChange = (newGroceriesWithPrices: GroceryWithPrices[]) => {
    setGroceriesWithPrices(newGroceriesWithPrices);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ px: { xs: 1, sm: 3 } }}> {/* Responsive padding */}
          <Typography 
            variant={isMobile ? "h6" : "h6"} 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }, // Smaller title on mobile
              minWidth: 0 // Allow text to shrink
            }}
          >
            {isMobile ? "ComPear" : t('app.title')} {/* Shorter title on mobile */}
          </Typography>
          <Box display="flex" alignItems="center" sx={{ gap: { xs: 0.5, sm: 1 } }}>
            <FormControl sx={{ minWidth: { xs: 80, sm: 120 }, mr: { xs: 1, sm: 2 } }} size="small">
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
                    <LanguageIcon sx={{ mr: { xs: 0.5, sm: 1 } }} />
                    {isMobile 
                      ? selected.toUpperCase() // Show country code on mobile (e.g., "NL")
                      : (countries.find(c => c.code === selected)?.name || 'Country')
                    }
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
                sx={{ mr: { xs: 0.5, sm: 2 }, p: { xs: 1, sm: 1 } }}
                size={isMobile ? "small" : "medium"}
              >
                <TranslateIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share a suggestion">
              <IconButton
                color="inherit"
                onClick={handleSuggestionClick}
                sx={{ mr: 2 }}
                aria-label="Open suggestion dialog"
                aria-haspopup="dialog"
              >
                <LightbulbIcon />
              </IconButton>
            </Tooltip>
            
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.3)', 
                mr: { xs: 0.5, sm: 2 },
                display: { xs: 'none', sm: 'block' } // Hide divider on mobile to save space
              }} 
            />
            
            {country.available && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleCartClick}
                  disabled={groceries.length === 0}
                  aria-label="Open cheapest supermarket dialog"
                  sx={{ mr: { xs: 0.5, sm: 2 }, p: { xs: 1, sm: 1 } }}
                  size={isMobile ? "small" : "medium"}
                >
                  <Badge badgeContent={groceries.length} color="secondary">
                    <ShoppingCartIcon fontSize={isMobile ? "small" : "medium"} />
                  </Badge>
                </IconButton>
                {groceries.length > 0 && (
                  isMobile ? (
                    <Tooltip title={t('app.clearAll')}>
                      <IconButton
                        color="inherit"
                        onClick={handleClearAll}
                        size="small"
                        sx={{ p: 1 }}
                      >
                        <DeleteSweepIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Button 
                      color="inherit" 
                      startIcon={<DeleteSweepIcon />} 
                      onClick={handleClearAll}
                      sx={{ minWidth: 'auto' }}
                    >
                      {t('app.clearAll')}
                    </Button>
                  )
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
                {t(`app.description.${country.code}`) || t('app.description').replace('{country}', country.name)}
              </Typography>
              
              <ProductSearch onAddGrocery={handleAddGrocery} />
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
      
      <SuggestionDialog 
        open={suggestionDialogOpen}
        onClose={handleSuggestionDialogClose}
      />
      
      <CheapestDialog
        open={triggerCheapestDialog}
        onClose={handleCheapestDialogHandled}
        groceries={groceriesWithPrices}
      />
    </Box>
  );
};

export default App;
